// pdw-site-v2/src/app/api/admin/media/route.ts
// Listar media (já existe POST para upload em ./upload/route.ts).
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { listMedia } from '@/lib/posts-db';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('pdw_admin')?.value;
  const expected = process.env.PDW_ADMIN_TOKEN;
  const devBypass = process.env.NODE_ENV !== 'production';
  if (!devBypass && (!expected || cookie !== expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const kind = req.nextUrl.searchParams.get('kind') as 'video' | 'logo' | 'image' | null;
  const items = listMedia(kind ?? undefined);
  return NextResponse.json({ items });
}

export const dynamic = 'force-dynamic';
