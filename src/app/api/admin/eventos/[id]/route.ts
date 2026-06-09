import { NextRequest, NextResponse } from 'next/server';
import { updateEvento, deleteEvento } from '@/lib/eventos-db';

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  return process.env.NODE_ENV !== 'production' || (!!expected && cookie === expected);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const eventoId = parseInt(id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const allowed = [
    'slug', 'titulo', 'subtitulo', 'descricao_curta', 'descricao_longa', 'icone',
    'imagem_destaque', 'imagem_cartaz', 'imagem_cronograma', 'data_inicio', 'data_fim',
    'fuso_horario', 'formato', 'local', 'plataforma', 'link_acesso',
    'inscricoes_abertas', 'capacidade_maxima', 'estado', 'video_gravacao_url', 'slides_url',
    'banner_ativo', 'banner_texto', 'banner_cta_texto', 'banner_cta_link', 'anuncio_inicio', 'anuncio_fim'
  ];
  const fields: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k in body) fields[k] = body[k];
  }
  try {
    updateEvento(eventoId, fields as Parameters<typeof updateEvento>[1]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'slug_exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const eventoId = parseInt(id, 10);
  if (isNaN(eventoId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  const ok = deleteEvento(eventoId);
  if (!ok) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
