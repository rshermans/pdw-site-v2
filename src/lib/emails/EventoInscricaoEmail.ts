interface EventoInscricaoProps {
  nome: string;
  eventoTitulo: string;
  eventoData: string;
  plataforma: string | null;
  siteUrl: string;
  lang?: 'pt' | 'en';
}

const T = {
  pt: {
    htmlLang:      'pt',
    titlePrefix:   'Inscrição confirmada',
    badge:         '✓ Inscrição confirmada',
    greeting:      'Olá',
    bodyA:         'A sua inscrição em',
    bodyB:         'foi registada com sucesso. Estamos muito contentes por contar com a sua presença!',
    detalhes:      'Detalhes do evento',
    linkAccess:    'O <strong style="color:#f1f5f9;">link de acesso</strong> será enviado para este email nos dias anteriores ao evento.',
    proximo:       'O que acontece a seguir',
    step1:         'Guarde a data na sua agenda',
    step2:         'Receberá o link de acesso antes do evento',
    step3:         'Prepare as suas perguntas para os speakers',
    parceiros:     'Parceiros do ecossistema',
    financiamento: 'Financiamento',
    duvidas:       'Dúvidas? Contacte-nos em',
    rgpd:          'Os seus dados são tratados ao abrigo do RGPD (UE) 2016/679 para gestão desta iniciativa.<br>Para exercer os seus direitos, contacte kto@tecminho.uminho.pt',
    at:            ' às ',
    locale:        'pt-PT',
  },
  en: {
    htmlLang:      'en',
    titlePrefix:   'Registration confirmed',
    badge:         '✓ Registration confirmed',
    greeting:      'Hello',
    bodyA:         'Your registration for',
    bodyB:         'has been successfully confirmed. We look forward to your participation!',
    detalhes:      'Event details',
    linkAccess:    'The <strong style="color:#f1f5f9;">access link</strong> will be sent to this email in the days prior to the event.',
    proximo:       'What happens next',
    step1:         'Save the date in your calendar',
    step2:         'You will receive the access link before the event',
    step3:         'Prepare your questions for the speakers',
    parceiros:     'Ecosystem partners',
    financiamento: 'Funding',
    duvidas:       'Questions? Contact us at',
    rgpd:          'Your data is processed under GDPR (EU) 2016/679 for the management of this initiative.<br>To exercise your rights, contact kto@tecminho.uminho.pt',
    at:            ' at ',
    locale:        'en-GB',
  },
} as const;

function formatEventDate(iso: string, lang: 'pt' | 'en'): string {
  try {
    const t = T[lang];
    return (
      new Date(iso).toLocaleDateString(t.locale, {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      }) +
      t.at +
      new Date(iso).toLocaleTimeString(t.locale, { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
}

export function buildEventoInscricaoHtml({
  nome,
  eventoTitulo,
  eventoData,
  plataforma,
  siteUrl,
  lang = 'pt',
}: EventoInscricaoProps): string {
  const t            = T[lang];
  const logo         = `${siteUrl}/pdw_logo.png`;
  const tecminho     = `${siteUrl}/tcminho-logo.png`;
  const blockchain   = `${siteUrl}/logo-Blockchain-pt.png`;
  const funders      = `${siteUrl}/financiadores-3logos.png`;
  const dataFormatada = formatEventDate(eventoData, lang);

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${t.titlePrefix} — ${eventoTitulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#111118;border-radius:16px;border:1px solid #1e1e2e;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 48px 28px;text-align:center;border-bottom:1px solid rgba(37,99,235,0.2);">
              <img src="${logo}" alt="Portuguese Digital Wallet" width="180" style="display:block;margin:0 auto 20px;max-width:180px;height:auto;" />
              <div style="display:inline-block;background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.3);border-radius:20px;padding:6px 16px;margin-bottom:16px;">
                <span style="font-size:12px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.08em;">${t.badge}</span>
              </div>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;line-height:1.3;">${eventoTitulo}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 48px;">
              <p style="margin:0 0 14px;font-size:16px;color:#94a3b8;line-height:1.6;">
                ${t.greeting} <strong style="color:#f1f5f9;">${nome}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#94a3b8;line-height:1.6;">
                ${t.bodyA} <strong style="color:#f1f5f9;">${eventoTitulo}</strong> ${t.bodyB}
              </p>

              <!-- Event info box -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:rgba(37,99,235,0.05);border:1px solid rgba(37,99,235,0.2);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.1em;">${t.detalhes}</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;width:32px;vertical-align:top;">📅</td>
                        <td style="padding:6px 0;font-size:14px;color:#cbd5e1;line-height:1.5;">${dataFormatada}</td>
                      </tr>
                      ${plataforma ? `
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;width:32px;vertical-align:top;">💻</td>
                        <td style="padding:6px 0;font-size:14px;color:#cbd5e1;">${plataforma}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;width:32px;vertical-align:top;">🔗</td>
                        <td style="padding:6px 0;font-size:14px;color:#cbd5e1;line-height:1.5;">
                          ${t.linkAccess}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What happens next -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#0d1117;border:1px solid #1e2433;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.1em;">${t.proximo}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;line-height:1.5;">
                      <span style="color:#3b82f6;font-weight:700;margin-right:8px;">01</span>${t.step1}
                    </p>
                    <p style="margin:0 0 8px;font-size:14px;color:#94a3b8;line-height:1.5;">
                      <span style="color:#3b82f6;font-weight:700;margin-right:8px;">02</span>${t.step2}
                    </p>
                    <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.5;">
                      <span style="color:#3b82f6;font-weight:700;margin-right:8px;">03</span>${t.step3}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
                ${t.duvidas}
                <a href="mailto:kto@tecminho.uminho.pt" style="color:#60a5fa;">kto@tecminho.uminho.pt</a>
              </p>
            </td>
          </tr>

          <!-- Partners -->
          <tr>
            <td style="padding:20px 48px;border-top:1px solid #1e1e2e;text-align:center;">
              <p style="margin:0 0 14px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">${t.parceiros}</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 16px;vertical-align:middle;">
                    <img src="${tecminho}" alt="TecMinho" height="32" style="display:block;height:32px;max-width:120px;width:auto;" />
                  </td>
                  <td style="padding:0 16px;vertical-align:middle;border-left:1px solid #1e1e2e;">
                    <img src="${blockchain}" alt="Blockchain.PT" height="28" style="display:block;height:28px;max-width:140px;width:auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Funders -->
          <tr>
            <td style="padding:16px 48px 28px;text-align:center;background:#0d0d14;">
              <p style="margin:0 0 10px;font-size:10px;color:#334155;text-transform:uppercase;letter-spacing:0.06em;">${t.financiamento}</p>
              <img src="${funders}" alt="Financiado por PRR, República Portuguesa e NextGenerationEU" width="240" style="display:block;margin:0 auto;max-width:240px;height:auto;opacity:0.7;" />
              <p style="margin:10px 0 0;font-size:11px;color:#334155;">TecMinho — Campus de Azurém, Guimarães, Portugal</p>
              <p style="margin:6px 0 0;font-size:10px;color:#1e293b;line-height:1.4;">
                ${t.rgpd}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
