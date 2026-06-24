import { NextRequest, NextResponse } from 'next/server';
import { getInscricaoById, deleteInscricao, getEventoSpeakers } from '@/lib/eventos-db';
import { Resend } from 'resend';
import { buildEventoInscricaoHtml } from '@/lib/emails/EventoInscricaoEmail';
import { buildEventoPreWebinarHtml } from '@/lib/emails/EventoPreWebinarEmail';
import { buildEventoPosWebinarHtml } from '@/lib/emails/EventoPosWebinarEmail';

function requireAdmin(req: NextRequest): NextResponse | null {
  const cookie    = req.cookies.get('pdw_admin')?.value;
  const expected  = process.env.PDW_ADMIN_TOKEN;
  const devBypass = process.env.NODE_ENV !== 'production';
  if (devBypass) return null;
  if (!expected || cookie !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

const resend  = new Resend(process.env.RESEND_API_KEY || 're_dummy_for_build');
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const deleted = deleteInscricao(numId);
  if (!deleted) {
    return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = requireAdmin(req);
  if (deny) return deny;

  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const inscricao = getInscricaoById(numId);
  if (!inscricao) {
    return NextResponse.json({ error: 'Inscrição não encontrada' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const template = searchParams.get('template') ?? 'confirmacao';

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
    await resend.emails.send({
      from: 'PDW Events <onboarding@resend.dev>',
      to: inscricao.email,
      subject,
      html,
    });
  } catch (err) {
    console.error('[PDW] Erro ao reenviar email:', err);
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
