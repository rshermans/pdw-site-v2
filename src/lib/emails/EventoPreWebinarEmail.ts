export interface EventoPreWebinarProps {
  nome: string;
  eventoTitulo: string;
  eventoData: string;
  plataforma: string | null;
  linkAcesso: string | null;
  siteUrl: string;
  speakers?: Array<{ nome: string; cargo: string | null }>;
  lang?: 'pt' | 'en';
}

function formatPreWebinarDate(iso: string, lang: 'pt' | 'en') {
  try {
    const d = new Date(iso);
    const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
    
    const dateStr = d.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    let timeStr = d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    if (lang === 'pt') {
      timeStr = timeStr.replace(':', 'h');
    }
    
    const offset = d.getTimezoneOffset();
    const gmtStr = offset === -60 ? 'GMT+1' : 'GMT+0';
    
    return { dateStr, timeStr: `${timeStr} (${gmtStr})` };
  } catch {
    return { dateStr: iso, timeStr: '' };
  }
}

export function buildEventoPreWebinarHtml({
  nome,
  eventoTitulo,
  eventoData,
  plataforma,
  linkAcesso,
  siteUrl,
  speakers = [],
  lang = 'pt',
}: EventoPreWebinarProps): string {
  const isPt = lang === 'pt';
  const { dateStr, timeStr } = formatPreWebinarDate(eventoData, lang);

  // Localization resources
  const T = {
    title: isPt ? 'Lembrete — Webinar começa em breve' : 'Reminder — Webinar starting soon',
    badge: isPt ? '⏰ Lembrete' : '⏰ Reminder',
    greeting: isPt ? 'Olá' : 'Hello',
    alertText: isPt ? 'O webinar começa em breve!' : 'The webinar is starting soon!',
    labelDate: isPt ? '📅 Data' : '📅 Date',
    labelTime: isPt ? '🕙 Hora' : '🕙 Time',
    labelPlatform: isPt ? '💻 Plataforma' : '💻 Platform',
    btnText: isPt ? 'Entrar no Zoom →' : 'Join on Zoom →',
    copyText: isPt ? 'Ou copie:' : 'Or copy:',
    tipsTitle: isPt ? '💡 Antes de entrar' : '💡 Before entering',
    tips: isPt ? [
      'Teste o áudio e vídeo antes de entrar',
      'Prepare as suas perguntas para os speakers',
      'Partilhe o link com colegas interessados'
    ] : [
      'Test your audio and video before joining',
      'Prepare your questions for the speakers',
      'Share the link with interested colleagues'
    ],
    speakersTitle: isPt ? 'Oradores' : 'Speakers',
  };

  // Build speakers HTML cells
  let speakersBlock = '';
  if (speakers.length > 0) {
    const cellWidth = Math.floor(100 / speakers.length);
    const cells = speakers.map(s => {
      const parts = s.nome.trim().split(/\s+/);
      const initials = parts.length >= 2 
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (parts[0]?.[0] ?? '').toUpperCase();
      return `
        <td width="${cellWidth}%" style="text-align:center; padding:8px;" class="mobile-stack">
          <div style="width:48px; height:48px; border-radius:50%; background-color:#E8F4F0; display:inline-block; line-height:48px; font-size:18px; font-weight:700; color:#006c4b;">${initials}</div>
          <p style="margin:8px 0 2px 0; font-size:13px; font-weight:700; color:#181c1e;" class="dark-text">${s.nome}</p>
          <p style="margin:0; font-size:11px; color:#8FAFC7;">${s.cargo ?? ''}</p>
        </td>
      `;
    }).join('');

    speakersBlock = `
      <!-- SPEAKERS -->
      <tr>
        <td style="background-color:#ffffff; padding: 0 32px 32px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0;" class="dark-card dark-border mobile-padding">
          <p style="margin:0 0 16px 0; font-size:13px; font-weight:700; color:#1a3b5d; text-transform:uppercase; letter-spacing:0.08em;">${T.speakersTitle}</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${cells}
            </tr>
          </table>
        </td>
      </tr>
    `;
  }

  // Fallback direct link
  const cleanLink = linkAcesso || '#';

  return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${T.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #0E1E2E !important; }
      .dark-card { background-color: #1A3347 !important; }
      .dark-text { color: #E8F4F0 !important; }
      .dark-muted { color: #8FAFC7 !important; }
      .dark-border { border-color: #1E3A52 !important; }
    }

    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .hero-title { font-size: 26px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f7fafc; font-family:'Public Sans',Arial,sans-serif;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f7fafc;" class="dark-bg">
    <tr>
      <td align="center" style="padding: 24px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="max-width:600px; width:100%;">

          <!-- TOP ACCENT BAR -->
          <tr>
            <td style="height:4px; background: linear-gradient(135deg, #006c4b 0%, #009668 50%, #1a3b5d 100%); border-radius: 8px 8px 0 0; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- HEADER -->
          <tr>
            <td style="background-color:#ffffff; padding: 28px 32px 20px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0;" class="dark-card dark-border mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-size:18px; font-weight:800; color:#006c4b; letter-spacing:-0.02em;">Portuguese Digital Wallet</span>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block; background-color:#E8F4F0; color:#006c4b; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:6px 14px; border-radius:999px;">${T.badge}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO SECTION -->
          <tr>
            <td style="background-color:#ffffff; padding: 8px 32px 32px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0;" class="dark-card dark-border mobile-padding">
              <p style="margin:0 0 20px 0; font-size:16px; line-height:1.6; color:#3d4a42;" class="dark-muted">
                ${T.greeting} <strong style="color:#181c1e;" class="dark-text">${nome}</strong>,
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: linear-gradient(135deg, rgba(0,108,75,0.06) 0%, rgba(26,59,93,0.06) 100%); border: 1px solid rgba(0,108,75,0.15); border-radius:12px; padding:28px 24px; text-align:center;">
                    <p style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:#006c4b; text-transform:uppercase; letter-spacing:0.08em;">WEBINAR</p>
                    <h1 style="margin:0 0 6px 0; font-size:28px; font-weight:800; color:#181c1e; line-height:1.15; letter-spacing:-0.02em;" class="dark-text hero-title">${T.alertText}</h1>
                    <p style="margin:0; font-size:18px; color:#3d4a42; line-height:1.4;" class="dark-muted">${eventoTitulo}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EVENT DETAILS -->
          <tr>
            <td style="background-color:#ffffff; padding: 0 32px 28px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0;" class="dark-card dark-border mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="33%" style="padding:12px 8px; text-align:center; background-color:#f7fafc; border-radius:8px;" class="dark-bg mobile-stack">
                    <p style="margin:0 0 4px 0; font-size:11px; font-weight:600; color:#006c4b; text-transform:uppercase; letter-spacing:0.1em;">${T.labelDate}</p>
                    <p style="margin:0; font-size:15px; font-weight:700; color:#181c1e;" class="dark-text">${dateStr}</p>
                  </td>
                  <td width="4" style="font-size:0;">&nbsp;</td>
                  <td width="33%" style="padding:12px 8px; text-align:center; background-color:#f7fafc; border-radius:8px;" class="dark-bg mobile-stack">
                    <p style="margin:0 0 4px 0; font-size:11px; font-weight:600; color:#006c4b; text-transform:uppercase; letter-spacing:0.1em;">${T.labelTime}</p>
                    <p style="margin:0; font-size:15px; font-weight:700; color:#181c1e;" class="dark-text">${timeStr}</p>
                  </td>
                  <td width="4" style="font-size:0;">&nbsp;</td>
                  <td width="33%" style="padding:12px 8px; text-align:center; background-color:#f7fafc; border-radius:8px;" class="dark-bg mobile-stack">
                    <p style="margin:0 0 4px 0; font-size:11px; font-weight:600; color:#006c4b; text-transform:uppercase; letter-spacing:0.1em;">${T.labelPlatform}</p>
                    <p style="margin:0; font-size:15px; font-weight:700; color:#181c1e;" class="dark-text">${plataforma ?? 'Online'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="background-color:#ffffff; padding: 0 32px 32px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0; text-align:center;" class="dark-card dark-border mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border-radius:999px; background: linear-gradient(135deg, #006c4b 0%, #009668 100%); box-shadow: 0 8px 20px rgba(0,108,75,0.3);">
                    <a href="${cleanLink}" target="_blank" style="display:inline-block; padding:16px 48px; font-size:16px; font-weight:700; color:#ffffff; text-decoration:none; letter-spacing:0.02em;">
                      ${T.btnText}
                    </a>
                  </td>
                </tr>
              </table>
              ${linkAcesso ? `
              <p style="margin:16px 0 0 0; font-size:12px; color:#8FAFC7;">
                ${T.copyText} <a href="${cleanLink}" style="color:#006c4b; text-decoration:underline; word-break:break-all; font-size:11px;">${cleanLink}</a>
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- TIPS SECTION -->
          <tr>
            <td style="background-color:#ffffff; padding: 0 32px 32px 32px; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0;" class="dark-card dark-border mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #d1d9e0;" class="dark-border">
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0 0 12px 0; font-size:13px; font-weight:700; color:#006c4b; text-transform:uppercase; letter-spacing:0.08em;">${T.tipsTitle}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${T.tips.map(tip => `
                      <tr>
                        <td style="padding:6px 0; font-size:14px; color:#3d4a42; line-height:1.5;" class="dark-muted">✅ ${tip}</td>
                      </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${speakersBlock}

          <!-- FOOTER PARTNERS & FUNDING -->
          <tr>
            <td style="padding:28px 32px; border-top:1px solid #d1d9e0; border-left:1px solid #d1d9e0; border-right:1px solid #d1d9e0; background-color:#f8fafc;" class="dark-card dark-border mobile-padding">
              
              <!-- Dúvidas -->
              <p style="margin:0 0 20px 0; font-size:13px; color:#3d4a42; line-height:1.5; text-align:center;" class="dark-muted">
                ${isPt ? 'Dúvidas? Contacte-nos em' : 'Questions? Contact us at'} 
                <a href="mailto:kto@tecminho.uminho.pt" style="color:#006c4b; text-decoration:underline; font-weight:700;">kto@tecminho.uminho.pt</a>
              </p>

              <!-- Partners -->
              <div style="text-align:center; margin-bottom:20px;">
                <p style="margin:0 0 10px 0; font-size:11px; font-weight:700; color:#1a3b5d; text-transform:uppercase; letter-spacing:0.08em;" class="dark-text">
                  ${isPt ? 'Parceiros do ecossistema' : 'Ecosystem partners'}
                </p>
                <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                  <tr>
                    <td style="padding:0 12px; vertical-align:middle;">
                      <img src="${siteUrl}/tcminho-logo.png" alt="TecMinho" height="28" style="display:block; height:28px; max-width:110px; width:auto;" />
                    </td>
                    <td style="padding:0 12px; vertical-align:middle; border-left:1px solid #d1d9e0;" class="dark-border">
                      <img src="${siteUrl}/logo-Blockchain-pt.png" alt="Blockchain.PT" height="24" style="display:block; height:24px; max-width:130px; width:auto;" />
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Funding -->
              <div style="text-align:center; border-top:1px solid #d1d9e0; padding-top:20px;" class="dark-border">
                <p style="margin:0 0 8px 0; font-size:10px; font-weight:700; color:#1a3b5d; text-transform:uppercase; letter-spacing:0.06em;" class="dark-text">
                  ${isPt ? 'Financiamento' : 'Funding'}
                </p>
                <img src="${siteUrl}/financiadores-3logos.png" alt="PRR, República Portuguesa, NextGenerationEU" width="220" style="display:block; margin:0 auto 12px; max-width:220px; height:auto; opacity:0.85;" />
                <p style="margin:0 0 8px 0; font-size:11px; color:#3d4a42; line-height:1.4;" class="dark-muted">
                  TecMinho — Campus de Azurém, Guimarães, Portugal
                </p>
                <p style="margin:0; font-size:10px; color:#8FAFC7; line-height:1.4;" class="dark-muted">
                  ${isPt 
                    ? 'Os seus dados são tratados ao abrigo do RGPD (UE) 2016/679 para gestão desta iniciativa.<br>Para exercer os seus direitos, contacte kto@tecminho.uminho.pt'
                    : 'Your data is processed under GDPR (EU) 2016/679 for the management of this initiative.<br>To exercise your rights, contact kto@tecminho.uminho.pt'}
                </p>
              </div>

            </td>
          </tr>

          <!-- FOOTER LINKS (DARK BOTTOM BAR) -->
          <tr>
            <td style="background-color:#0E1E2E; padding: 24px 32px; border-radius: 0 0 8px 8px; text-align:center;" class="mobile-padding">
              <p style="margin:0 0 6px 0; font-size:14px; font-weight:600; color:#E8F4F0;">Portuguese Digital Wallet</p>
              <p style="margin:0 0 16px 0; font-size:11px; color:#8FAFC7; line-height:1.4;">
                ${isPt ? 'Da Blockchain à Carteira: o futuro da confiança digital' : 'From Blockchain to Wallet: the future of digital trust'}
              </p>
              <p style="margin:0; font-size:11px; color:#8FAFC7;">
                <a href="https://www.digitalwallet.pt/" style="color:#22A66B; text-decoration:underline;">https://www.digitalwallet.pt/</a>
              </p>
              <p style="margin:14px 0 0 0; font-size:10px; color:#8FAFC7;">
                ${isPt ? 'Recebeu este email porque se registou no evento.' : 'You received this email because you registered for the event.'}<br>
                <a href="mailto:kto@tecminho.uminho.pt?subject=Cancelar%20Subscri%C3%A7%C3%A3o%20—%20Portuguese%20Digital%20Wallet" style="color:#8FAFC7; text-decoration:underline;">
                  ${isPt ? 'Cancelar subscrição' : 'Unsubscribe'}
                </a>
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
