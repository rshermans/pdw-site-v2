import { NextRequest, NextResponse } from 'next/server';
import { deleteMedia, updateMediaSlot } from '@/lib/posts-db';

export const dynamic = 'force-dynamic';

function requireAdmin(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null;
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  if (!expected || cookie !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const { id } = await params;
  const { slot } = await req.json();
  const item = updateMediaSlot(Number(id), slot ?? null);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  const { id } = await params;
  const ok = deleteMedia(Number(id));
  if (!ok) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export const dynamic = 'force-dynamic';
