import { NextRequest, NextResponse } from 'next/server';
import { getInscricaoById, deleteInscricao } from '@/lib/eventos-db';
import { buildEventoInscricaoHtml } from '@/lib/emails/EventoInscricaoEmail';
import { sendMail } from '@/lib/mailer';

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

  const lang = (inscricao.lang === 'en' ? 'en' : 'pt') as 'pt' | 'en';

  try {
    await sendMail({
      to: inscricao.email,
      subject: `✓ Inscrição confirmada — ${inscricao.evento_titulo}`,
      html: buildEventoInscricaoHtml({
        nome:         inscricao.nome,
        eventoTitulo: inscricao.evento_titulo,
        eventoData:   inscricao.evento_data_inicio,
        plataforma:   inscricao.evento_plataforma,
        siteUrl,
        lang,
      }),
    });
  } catch (err) {
    console.error('[PDW] Erro ao reenviar email de inscrição:', err);
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
