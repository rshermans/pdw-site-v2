const CHANGELOG = [
  {
    version: "v2.1.0",
    date: "25/05/2026",
    changes: [
      "Nova página 'Sobre' com KPIs do projeto, grelha da equipa e parceiros institucionais",
      "Novo componente de Gestão de Leads na área de administração (LeadsManager)",
      "Adicionados estilos de Acessibilidade/Alto Contraste para o Triângulo de Confiança e nós associados",
      "Otimização e correção de avisos do React (keys e Fragment) no LeadsManager e SobreContent",
      "Otimizações de build para Netlify (dynamic rendering nas rotas SQLite e fallback para Resend API Key)",
      "Novos tokens de design system, global CSS framework e novos componentes de layout",
      "Atualização de imagens e perfis dos membros da equipa com conversão para formato PNG e suporte multi-idioma (i18n)",
    ],
  },
  {
    version: "v2.0.0",
    date: "18/05/2026",
    changes: [
      "Painel de Administração com autenticação por password (login dedicado em /admin/login)",
      "Gestão de Leads/Contactos — listagem, filtros e exportação de todos os formulários submetidos",
      "API de leads com persistência em base de dados local (SQLite via better-sqlite3)",
      "Gestão de Secções dinâmicas do site via CMS interno (edição inline sem deploy)",
      "Changelog movido para área exclusiva de administração (removido da navegação pública)",
    ],
  },
  {
    version: "v1.9.0",
    date: "17/05/2026",
    changes: [
      "Integração completa do designer handoff: Casos de Uso com timeline, Diplomas Digitais variante A, feed Atualidades com design atual-*",
      "Novos componentes de homepage: HomeHero, PullQuote e StatsBanner (PR3)",
      "Componente TweaksPanel — painel de controlos de UI reutilizável para ajustes de design em runtime",
      "Integração de LegalDocument, feed de atualidades e estrutura de CMS admin completa",
      "Refactorização geral da estrutura de código para maior legibilidade e manutenibilidade",
    ],
  },
  {
    version: "v1.8.0",
    date: "15/05/2026",
    changes: [
      "Correção de CSS em falta para novas páginas: page-hero, kpi, team, legal, admin, flow e video modal",
      "Restauro do redirect i18n perdido após introdução do admin gate",
      "Sincronização de todas as alterações pendentes; exclusão de .claude/ do tracking git",
    ],
  },
  {
    version: "v1.7.3",
    date: "14/05/2026",
    changes: [
      "Formulário de contacto/lead com persistência em base de dados e notificações por email via Resend",
      "Página de Contactos com formulário full-stack, suporte i18n e acessibilidade",
      "Integração total da Homepage com secções de Casos de Uso, Demonstração em Vídeo e Formulário de Lead",
      "Correção de bugs estruturais no CSS global (herança de estilos e sintaxe)",
      "Otimização de metadados para o novo domínio digitalwallet.pt",
    ],
  },
  {
    version: "v1.7.2",
    date: "14/05/2026",
    changes: [
      "Otimização profunda de acessibilidade (WCAG 2.1)",
      "Correção de inconsistências visuais no Dark Mode em múltiplos componentes",
      "Refinamento de variáveis de cor para melhor contraste",
    ],
  },
  {
    version: "v1.7.1",
    date: "13/05/2026",
    changes: [
      "Navegação dinâmica com destaque para página ativa (Active Links)",
      "Deteção inteligente de rota na troca de idioma (manutenção da página atual)",
      "Refinamento do leitor de vídeo com parâmetros de marca limpa (YouTube Modest Branding)",
      "Reestruturação visual e interativa da secção de financiadores no rodapé",
      "Implementação do Simulador Interativo e Widget de Acessibilidade",
    ],
  },
  {
    version: "v1.6.0",
    date: "13/05/2026",
    changes: [
      "Correção do posicionamento do Modal de Changelog (agora centrado no ecrã)",
      "Integração do YouTube (formato Short) no pop-up de Demonstração",
      "Substituição de vídeo local por iFrame para melhor performance",
    ],
  },
  {
    version: "v1.5.0",
    date: "12/05/2026",
    changes: [
      "Integração del Changelog Timeline",
      "Adicionada badge de versão dinâmica no cabeçalho",
      "Atualização das redes sociais no rodapé com ícone dedicado para comunidade",
    ],
  },
  {
    version: "v1.4.0",
    date: "10/05/2026",
    changes: [
      "Otimização visual do Footer (Glassmorphism e hover effects nas logos dos parceiros)",
      "Refactorização de links institucionais e navegação inferior",
    ],
  },
  {
    version: "v1.3.0",
    date: "09/05/2026",
    changes: [
      "Integração de Imagem Disruptiva na Homepage com animações",
      "Atualização de nomenclaturas de estado no roadmap (de 'research' para 'development')",
    ],
  },
  {
    version: "v1.2.0",
    date: "08/05/2026",
    changes: [
      "Otimização do Site e SEO (Sitemaps, estruturação de páginas, Open Graph)",
      "Resolução de vulnerabilidades Next.js para deploy na Netlify (CVE-2025-55182)",
    ],
  },
  {
    version: "v1.1.0",
    date: "08/05/2026",
    changes: [
      "Criação de repositórios independentes no GitHub e sincronismo",
      "Estruturação da Estratégia B2B2C e regras de negócio base",
    ],
  },
  {
    version: "v1.0.0",
    date: "07/05/2026",
    changes: [
      "Lançamento do MVP (Minimum Viable Product)",
      "Implementação base da arquitetura e i18n (Internacionalização pt/en)",
    ],
  },
];

export function AdminChangelog() {
  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Changelog do Projeto</h2>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 10px",
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          color: "#38bdf8",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 700,
          border: "1px solid rgba(56, 189, 248, 0.25)",
        }}>
          v2.1.0 · atual
        </span>
      </div>

      <p style={{ padding: "0 24px 8px", color: "var(--color-muted)", fontSize: 14 }}>
        Histórico de versões do portal PDW desde o lançamento do MVP. Visível apenas internamente.
      </p>

      <div style={{ padding: "8px 24px 32px" }}>
        {CHANGELOG.map((item, idx) => (
          <div key={item.version} style={{
            display: "flex",
            gap: "20px",
            paddingBottom: idx < CHANGELOG.length - 1 ? "28px" : 0,
          }}>
            {/* Timeline spine */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: idx === 0 ? "#38bdf8" : "var(--color-border)",
                border: idx === 0 ? "2px solid rgba(56,189,248,0.4)" : "2px solid var(--color-border)",
                flexShrink: 0,
                marginTop: 3,
              }} />
              {idx < CHANGELOG.length - 1 && (
                <div style={{ width: 1, flexGrow: 1, backgroundColor: "var(--color-border)", marginTop: 4 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: idx === 0 ? "#38bdf8" : "var(--color-text)" }}>
                  {item.version}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{item.date}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {item.changes.map((change, i) => (
                  <li key={i} style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
