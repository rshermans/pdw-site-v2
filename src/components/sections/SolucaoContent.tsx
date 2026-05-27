import { TrustTriangle } from "@/components/sections/TrustTriangle";
import { FlowImage } from "@/components/sections/FlowImage";
import { GitHubSection } from "@/components/sections/GitHubSection";
import { getSectionEnabled, getSectionContent } from "@/lib/sections-db";
import type { GitHubContent } from "@/components/sections/GitHubSection";

interface SolucaoContentProps {
  dict: any;
  lang: string;
}

export function SolucaoContent({ dict, lang }: SolucaoContentProps) {
  let githubEnabled = true;
  let githubContent: GitHubContent | null = null;
  try {
    githubEnabled = getSectionEnabled('github');
    githubContent = getSectionContent<GitHubContent>('github');
  } catch { /* DB ainda não inicializada na primeira renderização */ }

  return (
    <>
      {/* Wallet + VCs intro */}
      <section className="two-col">
        <div className="section-card section-card-soft">
          <h2 className="section-title">{dict.solution.whatIsWallet.title}</h2>
          <p>{dict.solution.whatIsWallet.text}</p>
        </div>
        <div className="section-card section-card-soft">
          <h2 className="section-title">{dict.solution.whatAreVCs.title}</h2>
          <p>{dict.solution.whatAreVCs.text}</p>
        </div>
      </section>

      {/* Trust Triangle */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">Ecossistema de confiança</span>
          <h2 className="section-title">O triângulo de confiança</h2>
          <p className="section-deck">
            Três papéis, uma camada comum de confiança. Selecione cada um para perceber como
            interage com a PDW.
          </p>
        </header>
        <TrustTriangle />
      </section>

      {/* Flow — infográfico Como-funciona.png */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">Como funciona</span>
          <h2 className="section-title">{dict.solution.flow.title}</h2>
        </header>
        <FlowImage lang={lang} />
      </section>

      {/* Features */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">Características</span>
          <h2 className="section-title">{dict.solution.features.title}</h2>
        </header>
        <div className="grid-3">
          <article className="section-card">
            <h3 className="feature-title">{dict.solution.features.interoperability.label}</h3>
            <p>{dict.solution.features.interoperability.text}</p>
          </article>
          <article className="section-card">
            <h3 className="feature-title">{dict.solution.features.security.label}</h3>
            <p>{dict.solution.features.security.text}</p>
          </article>
          <article className="section-card">
            <h3 className="feature-title">{dict.solution.features.privacy.label}</h3>
            <p>{dict.solution.features.privacy.text}</p>
          </article>
        </div>
      </section>

      {/* GitHub / Open Source — controlado pela BD */}
      {githubEnabled && <GitHubSection lang={lang} content={githubContent} />}
    </>
  );
}
