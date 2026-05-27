import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import db from '@/lib/db';
import { buildLeadConfirmationHtml } from '@/lib/emails/LeadConfirmationEmail';
import { buildAdminLeadHtml } from '@/lib/emails/AdminLeadEmail';

export const dynamic = 'force-dynamic';

const leadSchema = z.object({
  name:        z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  institution: z.string().min(2, 'Instituição deve ter pelo menos 2 caracteres'),
  email:       z.string().email('Email inválido'),
  subject:     z.string().optional(),
  message:     z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_for_build');
const adminEmail = process.env.ADMIN_EMAIL ?? 'rmagalhaes@tecminho.uminho.pt';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');

const insertLead = db.prepare(`
  INSERT INTO leads (name, institution, email, subject, message)
  VALUES (@name, @institution, @email, @subject, @message)
`);

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL ?? 'rmagalhaes@tecminho.uminho.pt';
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdw.tecminho.uminho.pt').replace(/\/$/, '');
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, institution, email, subject, message } = parsed.data;

  db.prepare(`INSERT INTO leads (name, institution, email, subject, message) VALUES (@name, @institution, @email, @subject, @message)`)
    .run({ name, institution, email, subject: subject ?? null, message });

  await Promise.all([
    resend.emails.send({
      from:    'PDW <onboarding@resend.dev>',
      to:      email,
      subject: 'Recebemos o seu pedido — Portuguese Digital Wallet',
      html:    buildLeadConfirmationHtml({ name, institution, siteUrl }),
    }),
    resend.emails.send({
      from:    'PDW Leads <onboarding@resend.dev>',
      to:      adminEmail,
      subject: `[PDW Lead] ${name} — ${institution}`,
      html:    buildAdminLeadHtml({ name, institution, email, subject, message, siteUrl }),
    }),
  ]);

  return NextResponse.json({ success: true });
}
