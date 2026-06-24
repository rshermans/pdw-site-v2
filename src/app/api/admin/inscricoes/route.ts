import { NextRequest, NextResponse } from 'next/server';
import { listInscricoes, listEventos, getInscricaoById, getEventoSpeakers } from '@/lib/eventos-db';
import { buildEventoInscricaoHtml } from '@/lib/emails/EventoInscricaoEmail';
import { buildEventoPreWebinarHtml } from '@/lib/emails/EventoPreWebinarEmail';
import { buildEventoPosWebinarHtml } from '@/lib/emails/EventoPosWebinarEmail';
import { sendMail } from '@/lib/mailer';

function requireAdmin(req: NextRequest): NextResponse | null {
  const cookie  = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  const devBypass = process.env.NODE_ENV !== 'production';
  if (devBypass) return null;
  if (!expected || cookie !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

function escapeCsv(value: string | null | undefined): string {
  const s = (value ?? '').replace(/\n/g, ' ').replace(/\r/g, '');
  if (s.includes(',') || s.includes('"') || s.includes("'")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const TIPOS_LABEL: Record<string, string> = {
  publico_geral: 'Público geral',
  universidade:  'Universidade / Investigação',
  empresa:       'Empresa',
  admin_publica: 'Administração pública',
  outro:         'Outro',
};

const INTERESSES_LABEL: Record<string, string> = {
  tecnologia: 'Tecnologia / infraestrutura',
  diplomas:   'Diplomas digitais',
  onboarding: 'Onboarding digital',
  piloto:     'Projeto piloto',
  parceria:   'Parceria / colaboração',
  imprensa:   'Imprensa / comunicação',
};

export async function GET(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const eventoId  = searchParams.get('evento_id') ? Number(searchParams.get('evento_id')) : undefined;
  const formato   = searchParams.get('formato');

  const inscricoes = listInscricoes(eventoId);
  const eventos    = listEventos();

  if (formato === 'csv') {
    const header = [
      'ID', 'Evento', 'Nome', 'Email', 'Organização',
      'Tipo de participante', 'Interesse principal',
      'WhatsApp', 'Pergunta speakers', 'Data inscrição',
    ].join(',');

    const rows = inscricoes.map((i) => [
      i.id,
      escapeCsv(i.evento_titulo),
      escapeCsv(i.nome),
      escapeCsv(i.email),
      escapeCsv(i.organizacao),
      escapeCsv(TIPOS_LABEL[i.tipo_participante] ?? i.tipo_participante),
      escapeCsv(i.interesse_principal ? (INTERESSES_LABEL[i.interesse_principal] ?? i.interesse_principal) : ''),
      i.whatsapp_consent ? 'Sim' : 'Não',
      escapeCsv(i.pergunta_speakers),
      i.created_at,
    ].join(','));

    const csv = [header, ...rows].join('\r\n');
    const filename = eventoId
      ? `inscricoes-evento-${eventoId}.csv`
      : 'inscricoes-todos.csv';

    return new NextResponse('﻿' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ inscricoes, eventos });
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');

export async function POST(req: NextRequest) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  let body: { ids?: unknown; template?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'IDs necessários' }, { status: 400 });
  }

  const template = (typeof body.template === 'string' ? body.template : 'confirmacao');

  const ids = (body.ids as unknown[]).filter((x) => Number.isInteger(x) && (x as number) > 0) as number[];
  if (ids.length > 500) {
    return NextResponse.json({ error: 'Máximo 500 por envio' }, { status: 400 });
  }

  let sent = 0;
  let failed = 0;

  for (const id of ids) {
    const inscricao = getInscricaoById(id);
    if (!inscricao) { failed++; continue; }

    const lang = (inscricao.lang === 'en' ? 'en' : 'pt') as 'pt' | 'en';
    const speakers = getEventoSpeakers(inscricao.evento_id);

    let subject = '';
    let html = '';

    if (template === 'lembrete') {
      subject = lang === 'pt'
        ? `Lembrete — ${inscricao.evento_titulo} começa em breve`
        : `Reminder — ${inscricao.evento_titulo} starting soon`;
      html = buildEventoPreWebinarHtml({
        nome: inscricao.nome,
        eventoTitulo: inscricao.evento_titulo,
        eventoData: inscricao.evento_data_inicio,
        plataforma: inscricao.evento_plataforma,
        linkAcesso: inscricao.evento_link_acesso,
        siteUrl,
        speakers,
        lang,
      });
    } else if (template === 'pos_webinar') {
      subject = lang === 'pt'
        ? `Obrigado por participar — ${inscricao.evento_titulo}`
        : `Thank you for participating — ${inscricao.evento_titulo}`;
      html = buildEventoPosWebinarHtml({
        nome: inscricao.nome,
        eventoTitulo: inscricao.evento_titulo,
        eventoSlug: inscricao.evento_slug,
        siteUrl,
        videoGravacaoUrl: inscricao.evento_video_gravacao_url,
        slidesUrl: inscricao.evento_slides_url,
        speakers,
        lang,
      });
    } else {
      subject = `✓ Inscrição confirmada — ${inscricao.evento_titulo}`;
      html = buildEventoInscricaoHtml({
        nome:         inscricao.nome,
        eventoTitulo: inscricao.evento_titulo,
        eventoData:   inscricao.evento_data_inicio,
        plataforma:   inscricao.evento_plataforma,
        siteUrl,
        lang,
        linkAcesso:   inscricao.evento_link_acesso,
      });
    }

    try {
      await sendMail({ to: inscricao.email, subject, html });
      sent++;
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}
