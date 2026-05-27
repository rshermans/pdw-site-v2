// pdw-site-v2/src/app/api/admin/posts/[id]/route.ts
// PATCH + DELETE individual.
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { updatePost, deletePost } from '@/lib/posts-db';

function requireAdmin(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  const devBypass = process.env.NODE_ENV !== 'production';
  if (devBypass) return null;
  if (!expected || cookie !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const post = updatePost(Number(id), body);
  if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const { id } = await params;
  const ok = deletePost(Number(id));
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
