// pdw-site-v2/src/app/api/admin/posts/route.ts
// LIST + CREATE posts.
// Auth: o middleware já garante que /admin/* tem cookie pdw_admin válido,
// mas /api/admin/* fica fora do matcher (excluído por `(?!api)`). Revalidamos
// aqui o cookie para fechar a porta.
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createPost, listPosts, countPostsByType, PostStatus, PostType } from '@/lib/posts-db';

function requireAdmin(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  // Permitir DEV bypass (mesmo critério do middleware)
  const devBypass = process.env.NODE_ENV !== 'production';
  if (devBypass) return null;
  if (!expected || cookie !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const sp = req.nextUrl.searchParams;
  const status = (sp.get('status') ?? 'all') as PostStatus | 'all';
  const type   = (sp.get('type')   ?? 'all') as PostType   | 'all';
  const limit  = Number(sp.get('limit')  ?? 50);
  const offset = Number(sp.get('offset') ?? 0);
  const posts  = listPosts({ status, type, limit, offset });
  const counts = countPostsByType('all');
  return NextResponse.json({ posts, counts });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json();
  // Validação mínima — em produção, usar zod.
  if (!body?.type || !body?.title) {
    return NextResponse.json({ error: 'missing_fields', fields: ['type', 'title'] }, { status: 400 });
  }
  const post = createPost({
    type: body.type,
    title: body.title,
    excerpt: body.excerpt,
    embed: body.embed,
    source_url: body.source_url,
    status: body.status ?? 'draft',
    scheduled_at: body.scheduled_at ?? null,
    pinned: !!body.pinned,
    comments_enabled: !!body.comments_enabled,
    author: body.author,
  });
  return NextResponse.json({ post }, { status: 201 });
}

export const dynamic = 'force-dynamic';
