/**
 * pdw-site-v2/src/components/sections/HeroInstitutional.tsx
 *
 * SUBSTITUI o existente. Hero editorial com:
 *   - Badge "Em produção" com ponto pulsante
 *   - Título em 2 linhas (linha 1 normal + linha 2 com gradiente)
 *   - Lead em 2 níveis (subtitle + description)
 *   - Mini-stats (72,9 M€ · 27 · −90 %)
 *   - Imagem grande à direita com rotação ligeira e legenda flutuante
 *
 * Client Component porque usa onClick para abrir o VideoModal.
 */
"use client";

import Image from "next/image";

interface HeroInstitutionalProps {
  /** Chamado quando o utilizador clica em "Ver vídeo conceito". */
  onPlayDemo: () => void;
  dict: any;
  lang: string;
}

export function HeroInstitutional({ onPlayDemo, dict, lang }: HeroInstitutionalProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg-grid" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" aria-hidden="true" />
          {lang === "pt"
            ? "Em produção · Agenda Blockchain.PT"
            : "In production · Blockchain.PT Agenda"}
        </div>
        <h1 id="hero-title">
          <span className="hero-title-line">
            {lang === "pt"
              ? "Acesso a serviços digitais"
              : "Digital services access"}
          </span>
          <span className="hero-title-accent">
            {lang === "pt" ? "sem fricção." : "without friction."}
          </span>
        </h1>
        <p className="hero-subtitle">{dict.hero.subtitle}</p>
        <p className="hero-description">{dict.hero.description}</p>
        <div className="btn-row">
          <button className="cta cta-disruptive" onClick={onPlayDemo} type="button">
            <span aria-hidden="true">▶</span>{" "}
            {lang === "pt" ? "Ver vídeo conceito" : "Watch concept video"}
          </button>
          <a className="btn-secondary" href={`/${lang}/contactos`}>
            {lang === "pt" ? "Falar com a equipa" : "Talk to the team"}{" "}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <dl
          className="hero-mini-stats"
          aria-label={lang === "pt" ? "Estatísticas do consórcio" : "Consortium statistics"}
        >
          <div>
            <dt>72,9 M€</dt>
            <dd>
              {lang === "pt" ? "Investimento total" : "Total investment"}
              <br />
              {lang === "pt" ? "do consórcio" : "of the consortium"}
            </dd>
          </div>
          <div>
            <dt>27</dt>
            <dd>
              {lang === "pt" ? "Estados-Membros" : "Member States"}
              <br />
              {lang === "pt" ? "de reconhecimento" : "of recognition"}
            </dd>
          </div>
          <div>
            <dt>−90 %</dt>
            <dd>
              {lang === "pt" ? "Tempo de" : "Reduction in"}
              <br />
              {lang === "pt" ? "verificação académica" : "academic verification"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="hero-image-frame">
        <Image
          src={lang === "en" ? "/EN/Imagem-home-EN1.png" : "/Imagem-home.png"}
          alt={
            lang === "pt"
              ? "Diploma universitário digital exibido na aplicação PDW"
              : "Digital university diploma shown in the PDW app"
          }
          width={520}
          height={520}
          priority
        />
        <div className="hero-image-caption">
          <span className="hero-image-caption-dot" aria-hidden="true" />
          <span>
            {lang === "pt"
              ? "Diploma da Universidade do Minho · verificado em 1,2 s"
              : "University of Minho diploma · verified in 1.2 s"}
          </span>
        </div>
      </div>
    </section>
  );
}
