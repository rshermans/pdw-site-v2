/**
 * pdw-site-v2/src/components/sections/PageHero.tsx
 *
 * Server Component partilhado pelas páginas Sobre / Solução.
 * Header de página com eyebrow + título grande (com text-gradient
 * opcional) + lead. Substitui o uso de SectionHeading nestes contextos.
 */
import { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  /** Parte do título em verde gradiente (opcional). Render como <span>. */
  titleGradient?: string;
  /** Resto do título, mostrado depois de uma quebra de linha. */
  title: string;
  lead: ReactNode;
}

export function PageHero({ eyebrow, titleGradient, title, lead }: PageHeroProps) {
  return (
    <header className="page-hero" style={{ paddingTop: '24px' }}>
      <span className="page-hero-eyebrow">{eyebrow}</span>
      <h1 className="page-hero-title">
        {titleGradient && (
          <>
            <span className="text-gradient">{titleGradient}</span>
            <br />
          </>
        )}
        {title}
      </h1>
      <p className="page-hero-lead">{lead}</p>
    </header>
  );
}
