// pdw-site-v2/src/app/api/public/posts/route.ts
// Endpoint público (sem auth) para o feed em /atualidades.
// Devolve apenas posts publicados, com paginação simples.
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { listPosts, countPostsByType, PostType } from '@/lib/posts-db';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = (sp.get('type') ?? 'all') as PostType | 'all';
  const limit = Math.min(48, Number(sp.get('limit') ?? 24));
  const offset = Number(sp.get('offset') ?? 0);
  const posts = listPosts({ status: 'published', type, limit, offset });
  const counts = countPostsByType('published');
  return NextResponse.json({ posts, counts });
}

export const dynamic = 'force-dynamic';
