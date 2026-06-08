interface AdminInscricaoProps {
  nome: string;
  email: string;
  organizacao: string | null;
  tipo_participante: string;
  interesse_principal: string | null;
  pergunta_speakers: string | null;
  eventoTitulo: string;
  siteUrl: string;
}

const TIPOS_LABEL: Record<string, string> = {
  publico_geral:  'Público geral',
  universidade:   'Universidade / Investigação',
  empresa:        'Empresa',
  admin_publica:  'Administração pública',
  outro:          'Outro',
};

const INTERESSES_LABEL: Record<string, string> = {
  tecnologia: 'Tecnologia / infraestrutura',
  diplomas:   'Diplomas digitais',
  onboarding: 'Onboarding digital',
  piloto:     'Projeto piloto',
  parceria:   'Parceria / colaboração',
  imprensa:   'Imprensa / comunicação',
};

export function buildAdminInscricaoHtml({
  nome, email, organizacao, tipo_participante, interesse_principal,
  pergunta_speakers, eventoTitulo, siteUrl,
}: AdminInscricaoProps): string {
  const adminUrl = `${siteUrl}/pt/admin`;
  const isLead   = interesse_principal === 'piloto' || interesse_principal === 'parceria';

  const row = (label: string, value: string | null) =>
    value
      ? `<tr>
           <td style="padding:7px 0;font-size:13px;color:#64748b;width:140px;vertical-align:top;">${label}</td>
           <td style="padding:7px 0;font-size:14px;color:#e2e8f0;">${value}</td>
         </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Nova inscrição — ${eventoTitulo}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111118;border-radius:14px;border:1px solid #1e1e2e;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:24px 36px;border-bottom:1px solid rgba(37,99,235,0.2);">
              ${isLead
                ? `<div style="display:inline-block;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:4px 12px;margin-bottom:10px;">
                     <span style="font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em;">⭐ Lead qualificado</span>
                   </div><br>`
                : ''}
              <span style="font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.1em;">Nova inscrição</span>
              <h1 style="margin:6px 0 0;font-size:18px;font-weight:700;color:#f1f5f9;">${eventoTitulo}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 36px;">
              <table cellpadding="0" cellspacing="0" width="100%" style="background:rgba(37,99,235,0.05);border:1px solid rgba(37,99,235,0.15);border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:18px 20px;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    ${row('Nome', nome)}
                    ${row('Email', `<a href="mailto:${email}" style="color:#60a5fa;">${email}</a>`)}
                    ${row('Organização', organizacao)}
                    ${row('Tipo', TIPOS_LABEL[tipo_participante] ?? tipo_participante)}
                    ${row('Interesse', interesse_principal ? (INTERESSES_LABEL[interesse_principal] ?? interesse_principal) : null)}
                  </table>
                </td></tr>
              </table>

              ${pergunta_speakers ? `
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#0d1117;border:1px solid #1e2433;border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:18px 20px;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.1em;">Pergunta para speakers</p>
                  <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">${pergunta_speakers}</p>
                </td></tr>
              </table>` : ''}

              <a href="${adminUrl}" style="display:inline-block;background:rgba(37,99,235,0.2);border:1px solid rgba(37,99,235,0.3);border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;color:#60a5fa;text-decoration:none;">
                Ver todas as inscrições →
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 36px;border-top:1px solid #1e1e2e;text-align:right;">
              <span style="font-size:11px;color:#334155;">PDW · kto@tecminho.uminho.pt</span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
