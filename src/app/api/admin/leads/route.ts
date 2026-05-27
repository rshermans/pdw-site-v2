import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
import { listLeads, countLeads } from '@/lib/leads-db';
import { buildLeadConfirmationHtml } from '@/lib/emails/LeadConfirmationEmail';
import { buildAdminLeadHtml } from '@/lib/emails/AdminLeadEmail';

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

function escapeCsvField(value: string | null | undefined): string {
  const s = (value ?? '').replace(/\n/g, ' ').replace(/\r/g, '');
  if (s.includes(',') || s.includes('"') || s.includes("'")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const sp = req.nextUrl.searchParams;
  const format = sp.get('format');
  const limit = Number(sp.get('limit') ?? 1000);
  const offset = Number(sp.get('offset') ?? 0);

  const leads = listLeads(limit, offset);

  if (format === 'csv') {
    const header = 'id,nome,instituicao,email,assunto,mensagem,data\n';
    const rows = leads
      .map((l) =>
        [
          l.id,
          escapeCsvField(l.name),
          escapeCsvField(l.institution),
          escapeCsvField(l.email),
          escapeCsvField(l.subject),
          escapeCsvField(l.message),
          l.created_at,
        ].join(',')
      )
      .join('\n');

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse('﻿' + header + rows, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pdw-contactos-${date}.csv"`,
      },
    });
  }

  const total = countLeads();
  return NextResponse.json({ leads, total });
}

// POST /api/admin/leads  body: { action: "test-email" }
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  if (body?.action !== 'test-email') {
    return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_for_build');
  const adminEmail = process.env.ADMIN_EMAIL ?? 'rmagalhaes@tecminho.uminho.pt';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');

  const testData = {
    name: 'Teste PDW Admin',
    institution: 'TecMinho · Teste',
    email: adminEmail,
    subject: 'Teste de envio de email',
    message: 'Este é um email de teste enviado a partir do painel de administração do PDW.',
    siteUrl,
  };

  const [userResult, adminResult] = await Promise.allSettled([
    resend.emails.send({
      from: 'PDW <onboarding@resend.dev>',
      to: adminEmail,
      subject: '[TESTE] Recebemos o seu pedido — Portuguese Digital Wallet',
      html: buildLeadConfirmationHtml(testData),
    }),
    resend.emails.send({
      from: 'PDW Leads <onboarding@resend.dev>',
      to: adminEmail,
      subject: '[TESTE] [PDW Lead] Teste PDW Admin — TecMinho',
      html: buildAdminLeadHtml(testData),
    }),
  ]);

  const ok =
    userResult.status === 'fulfilled' && adminResult.status === 'fulfilled';

  return NextResponse.json({
    ok,
    user: userResult.status === 'fulfilled' ? { id: (userResult.value as any).data?.id } : { error: (userResult as any).reason?.message },
    admin: adminResult.status === 'fulfilled' ? { id: (adminResult.value as any).data?.id } : { error: (adminResult as any).reason?.message },
  }, { status: ok ? 200 : 500 });
}

export const dynamic = 'force-dynamic';
