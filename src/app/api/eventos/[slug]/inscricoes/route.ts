import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEventoBySlug, createInscricao, countInscricoes, hashIp, getEventoSpeakers } from '@/lib/eventos-db';
import { buildEventoInscricaoHtml } from '@/lib/emails/EventoInscricaoEmail';
import { buildAdminInscricaoHtml } from '@/lib/emails/AdminInscricaoEmail';
import { sendMail } from '@/lib/mailer';

const TIPOS_PARTICIPANTE = ['publico_geral', 'universidade', 'empresa', 'admin_publica', 'outro'] as const;
const INTERESSES = ['tecnologia', 'diplomas', 'onboarding', 'piloto', 'parceria', 'imprensa'] as const;

const inscricaoSchema = z.object({
  nome:                 z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email:                z.string().email('Email inválido'),
  organizacao:          z.string().optional(),
  cargo:                z.string().optional(),
  telemovel:            z.string().optional(),
  tipo_participante:    z.enum(TIPOS_PARTICIPANTE),
  interesse_principal:  z.enum(INTERESSES).optional(),
  consentimento:        z.boolean().refine((v) => v === true, {
                          message: 'É necessário aceitar a Política de Privacidade',
                        }),
  whatsapp_consent:     z.boolean().optional(),
  pergunta_speakers:    z.string().max(1000).optional(),
  lang:                 z.enum(['pt', 'en']).optional(),
  _hp:                  z.string().optional(),
});

const siteUrl    = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL ?? 'rmagalhaes@tecminho.uminho.pt';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const evento = getEventoBySlug(slug);
  if (!evento) {
    return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 });
  }
  if (!evento.inscricoes_abertas || evento.estado === 'encerrado' || evento.estado === 'arquivado') {
    return NextResponse.json({ error: 'Inscrições encerradas' }, { status: 403 });
  }
  if (evento.capacidade_maxima !== null) {
    const total = countInscricoes(evento.id);
    if (total >= evento.capacidade_maxima) {
      return NextResponse.json({ error: 'Capacidade máxima atingida' }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  // Honeypot: silent drop
  if ((body as Record<string, unknown>)?._hp) {
    return NextResponse.json({ ok: true });
  }

  const parsed = inscricaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const {
    nome, email, organizacao, telemovel,
    tipo_participante, interesse_principal,
    consentimento, whatsapp_consent, pergunta_speakers,
    lang: rawLang,
  } = parsed.data;

  const lang = rawLang ?? 'pt';

  const rawIp  = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ip_hash = rawIp ? hashIp(rawIp) : null;

  let utmOrigem: string | null = null;
  try {
    const referer = request.headers.get('referer');
    if (referer) utmOrigem = new URL(referer).searchParams.get('utm_source');
  } catch { /* ignore */ }

  try {
    createInscricao({
      evento_id: evento.id,
      nome, email,
      organizacao: organizacao ?? null,
      telemovel: telemovel ?? null,
      tipo_participante,
      interesse_principal: interesse_principal ?? null,
      consentimento,
      whatsapp_consent: whatsapp_consent ?? false,
      pergunta_speakers: pergunta_speakers ?? null,
      origem: utmOrigem,
      ip_hash,
      lang,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { error: 'Já existe uma inscrição com este email para este evento.' },
        { status: 409 }
      );
    }
    console.error('[PDW] Erro ao guardar inscrição:', err);
    return NextResponse.json(
      { error: 'Erro ao registar inscrição. Por favor tente novamente.' },
      { status: 500 }
    );
  }

  // Envio de emails via Gmail SMTP (falha silenciosa — inscrição já está guardada)
  const speakers = getEventoSpeakers(evento.id);

  try {
    await Promise.all([
      sendMail({
        to: email,
        subject: `✓ Inscrição confirmada — ${evento.titulo}`,
        html: buildEventoInscricaoHtml({
          nome,
          eventoTitulo: evento.titulo,
          eventoData: evento.data_inicio,
          plataforma: evento.plataforma,
          siteUrl,
          lang,
          linkAcesso: evento.link_acesso,
          speakers,
        }),
      }),
      sendMail({
        to: adminEmail,
        subject: `[PDW Inscrição] ${nome} — ${evento.titulo}`,
        html: buildAdminInscricaoHtml({
          nome, email,
          organizacao: organizacao ?? null,
          tipo_participante,
          interesse_principal: interesse_principal ?? null,
          pergunta_speakers: pergunta_speakers ?? null,
          eventoTitulo: evento.titulo,
          siteUrl,
        }),
      }),
    ]);
  } catch (emailErr) {
    console.error('[PDW] Erro ao enviar email de inscrição:', emailErr);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
