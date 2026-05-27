export interface GitHubContent {
  repo_url: string;
  repo_name: string;
  description: string;
}

interface GitHubSectionProps {
  lang: string;
  content: GitHubContent | null;
}

const DEFAULTS: GitHubContent = {
  repo_url: 'https://github.com/tecminho',
  repo_name: 'tecminho/pdw',
  description: 'Sistema de credenciais verificáveis W3C VC conforme EBSI e eIDAS 2.0. Transparente, auditável e pronto para integrar.',
};

const HIGHLIGHTS = [
  {
    icon: '📦',
    pt: { title: 'SDK de Emissão', text: 'Integra em qualquer sistema de gestão académica ou institucional com poucos endpoints.' },
    en: { title: 'Issuance SDK', text: 'Integrates with any academic or institutional management system via a few endpoints.' },
  },
  {
    icon: '✅',
    pt: { title: 'Verificador EBSI', text: 'Valida credenciais contra a rede europeia em menos de 1 segundo, sem intermediários.' },
    en: { title: 'EBSI Verifier', text: 'Validates credentials against the European network in under 1 second, without intermediaries.' },
  },
  {
    icon: '📱',
    pt: { title: 'Mobile Wallet', text: 'Aplicação iOS e Android com armazenamento cifrado no dispositivo. O utilizador controla os seus dados.' },
    en: { title: 'Mobile Wallet', text: 'iOS and Android app with encrypted on-device storage. The user stays in control of their data.' },
  },
];

export function GitHubSection({ lang, content }: GitHubSectionProps) {
  const c = content ?? DEFAULTS;
  const isPt = lang === 'pt';

  return (
    <section>
      <header className="section-header">
        <span className="page-hero-eyebrow">Open Source</span>
        <h2 className="section-title">
          {isPt ? 'Transparência verificável.' : 'Verifiable transparency.'}
        </h2>
        <p className="section-deck">
          {isPt
            ? 'O código é público. Audite, contribua e construa sobre a PDW — sem caixas negras, sem dependências opacas.'
            : 'The code is public. Audit, contribute, and build on PDW — no black boxes, no opaque dependencies.'}
        </p>
      </header>

      <div className="github-repo-card">
        <div className="github-repo-card__header">
          <svg className="github-repo-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.216.694.825.576C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          <a href={c.repo_url} target="_blank" rel="noopener noreferrer" className="github-repo-name">
            {c.repo_name}
          </a>
          <span className="github-repo-badge">Public</span>
        </div>
        <p className="github-repo-desc">{c.description}</p>
        <div className="github-repo-meta">
          <span className="github-repo-license">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 5, verticalAlign: 'middle' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            MIT License
          </span>
          <a href={c.repo_url} target="_blank" rel="noopener noreferrer" className="github-repo-cta">
            {isPt ? 'Ver repositório' : 'View repository'} →
          </a>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 24 }}>
        {HIGHLIGHTS.map((h) => {
          const t = isPt ? h.pt : h.en;
          return (
            <article key={h.icon} className="section-card">
              <div className="github-highlight-icon" aria-hidden="true">{h.icon}</div>
              <h3 className="feature-title">{t.title}</h3>
              <p>{t.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
