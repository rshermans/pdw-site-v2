import { NextRequest, NextResponse } from 'next/server';
import { createEvento, listEventos } from '@/lib/eventos-db';
import { createPost } from '@/lib/posts-db';

function isAuthorized(req: NextRequest): boolean {
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  return process.env.NODE_ENV !== 'production' || (!!expected && cookie === expected);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const eventos = listEventos();
  return NextResponse.json({ eventos });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  // Validação mínima
  if (!body.titulo || !body.slug || !body.data_inicio) {
    return NextResponse.json({ error: 'missing_fields', fields: ['titulo', 'slug', 'data_inicio'] }, { status: 400 });
  }

  try {
    const id = createEvento({
      slug:               body.slug.trim(),
      titulo:             body.titulo.trim(),
      subtitulo:          body.subtitulo?.trim() || null,
      descricao_curta:    body.descricao_curta?.trim() || null,
      descricao_longa:    body.descricao_longa?.trim() || null,
      icone:              body.icone || 'webinar',
      imagem_destaque:    body.imagem_destaque || null,
      imagem_cartaz:      body.imagem_cartaz || null,
      imagem_cronograma:  body.imagem_cronograma || null,
      data_inicio:        body.data_inicio,
      data_fim:           body.data_fim || null,
      fuso_horario:       body.fuso_horario || 'Europe/Lisbon',
      formato:            body.formato || 'online',
      local:              body.local || null,
      plataforma:         body.plataforma || null,
      link_acesso:        body.link_acesso || null,
      inscricoes_abertas: !!body.inscricoes_abertas,
      capacidade_maxima:  body.capacidade_maxima ? Number(body.capacidade_maxima) : null,
      estado:             body.estado || 'rascunho',
      video_gravacao_url: body.video_gravacao_url || null,
      slides_url:         body.slides_url || null,
      banner_ativo:       !!body.banner_ativo,
      banner_texto:       body.banner_texto || null,
      banner_cta_texto:   body.banner_cta_texto || 'Inscrever',
      banner_cta_link:    body.banner_cta_link || null,
      anuncio_inicio:     body.anuncio_inicio || null,
      anuncio_fim:        body.anuncio_fim || null,
    });

    // Se solicitado, criar feed post correspondente automaticamente
    if (body.divulgar_feed) {
      const pageUrl = `/pt/eventos/${body.slug.trim()}`;
      createPost({
        type: 'evento',
        title: body.titulo.trim(),
        excerpt: body.descricao_curta?.trim() || '',
        source_url: pageUrl,
        embed: {
          date_iso: body.data_inicio,
          rsvp_url: pageUrl,
        },
        status: 'published',
        pinned: false,
      });
    }

    return NextResponse.json({ id, ok: true }, { status: 201 });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      return NextResponse.json({ error: 'slug_exists' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'error creating event' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
