import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isPt = lang === "pt";
  return {
    title: isPt
      ? "Casos de Uso | Portuguese Digital Wallet"
      : "Use Cases | Portuguese Digital Wallet",
    description: isPt
      ? "Descubra os casos de uso da PDW: diplomas digitais, saúde, rastreabilidade alimentar, imobiliário e mais."
      : "Discover PDW use cases: digital diplomas, health, food traceability, real estate and more.",
  };
}

const CASES_META = [
  { dictKey: "diplomas",        icon: "🎓", status: "available"   as const, sub: "diplomas-digitais" },
  { dictKey: "studentId",       icon: "🪪", status: "development" as const },
  { dictKey: "microCredentials",icon: "📜", status: "development" as const },
  { dictKey: "health",          icon: "🏥", status: "development" as const },
  { dictKey: "foodChain",       icon: "🌱", status: "development" as const },
  { dictKey: "realEstate",      icon: "🏠", status: "development" as const },
];

export default async function CasosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const cases = CASES_META.map((c) => ({
    ...c,
    title: (dict.useCases as any)[c.dictKey]?.title ?? c.dictKey,
    text:  (dict.useCases as any)[c.dictKey]?.text  ?? "",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* ── Page hero ── */}
      <header className="page-hero" style={{ paddingTop: '24px' }}>
        <span className="eyebrow">{lang === "pt" ? "Casos de uso" : "Use Cases"}</span>
        <h1 className="page-hero-title">
          <span className="text-gradient">
            {lang === "pt" ? "Implementação faseada," : "Phased implementation,"}
          </span>
          <br/>
          {lang === "pt"
            ? "com foco em valor institucional."
            : "focused on institutional value."}
        </h1>
        <p className="page-hero-lead">
          {lang === "pt"
            ? "A PDW tem o seu primeiro piloto operacional com diplomas universitários e está em desenvolvimento ativo em cinco frentes adicionais. Cada caso de uso é construído em parceria com instituições portuguesas reais e validado contra os referenciais europeus."
            : "PDW has its first operational pilot with university diplomas and is in active development across five additional fronts. Each use case is built in partnership with real Portuguese institutions and validated against European frameworks."}
        </p>
      </header>

      {/* ── Featured case: Diplomas ── */}
      <section className="diploma-case-editorial featured-case">
        <div className="diploma-case-photo">
          <Image
            src="/wallet-mockup.png"
            alt={lang === "pt"
              ? "Aplicação PDW a mostrar diploma da Universidade do Minho"
              : "PDW app showing a University of Minho diploma"}
            width={600}
            height={750}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div className="diploma-case-photo-tag">
            <span aria-hidden="true">●</span>{" "}
            {lang === "pt" ? "Em produção · 2026" : "In production · 2026"}
          </div>
        </div>
        <div className="diploma-case-content">
          <span className="diploma-case-eyebrow">
            {lang === "pt" ? "Caso em destaque" : "Featured case"}
          </span>
          <h2 className="diploma-case-title">
            {lang === "pt"
              ? <>A Universidade do Minho<br/>a lançar os primeiros diplomas digitais.</>
              : <>University of Minho<br/>launching its first digital diplomas.</>}
          </h2>
          <p className="diploma-case-lead">
            {lang === "pt" ? (
              <>A primeira aplicação piloto da PDW. Capacidade estimada de <strong>~12 000 diplomas/ano</strong> no
              formato W3C Verifiable Credential, assinados com chave <code>did:ebsi</code> e
              reconhecidos em <strong>27 Estados-Membros</strong> sem novos acordos bilaterais.</>
            ) : (
              <>PDW&apos;s first operational pilot. Capacity for <strong>~12,000 diplomas/year</strong> in
              W3C Verifiable Credential format, signed with a <code>did:ebsi</code> key and
              recognized across <strong>27 EU Member States</strong> without new bilateral agreements.</>
            )}
          </p>
          <div className="diploma-case-metrics">
            <div>
              <div className="diploma-case-metric-num">90 %</div>
              <div className="diploma-case-metric-lbl">
                {lang === "pt" ? <>Menos tempo<br/>de verificação</> : <>Less verification<br/>time</>}
              </div>
            </div>
            <div>
              <div className="diploma-case-metric-num">−85 %</div>
              <div className="diploma-case-metric-lbl">
                {lang === "pt" ? <>Encargo<br/>administrativo</> : <>Administrative<br/>burden</>}
              </div>
            </div>
            <div>
              <div className="diploma-case-metric-num">0 %</div>
              <div className="diploma-case-metric-lbl">
                {lang === "pt" ? <>Risco<br/>de fraude</> : <>Fraud<br/>risk</>}
              </div>
            </div>
          </div>
          <Link href={`/${lang}/casos-de-uso/diplomas-digitais`} className="diploma-case-link">
            {lang === "pt" ? "Ver o caso completo →" : "See the full case →"}
          </Link>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="casos-strip">
        <div>
          <strong>1</strong>
          <span>{lang === "pt" ? "Em produção" : "In production"}</span>
        </div>
        <div>
          <strong>5</strong>
          <span>{lang === "pt" ? "Em desenvolvimento" : "In development"}</span>
        </div>
        <div>
          <strong>0</strong>
          <span>{lang === "pt" ? "Investigação preliminar" : "Preliminary research"}</span>
        </div>
        <div>
          <strong>Q3 2026</strong>
          <span>{lang === "pt" ? "Próximo go-live previsto" : "Next expected go-live"}</span>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section>
        <header className="section-header">
          <span className="eyebrow">
            {lang === "pt" ? "Roadmap por caso de uso" : "Roadmap by use case"}
          </span>
          <h3 className="section-title">
            {lang === "pt" ? "A sequência de adopção" : "The adoption sequence"}
          </h3>
          <p className="section-deck">
            {lang === "pt"
              ? "Cada caso parte de um piloto institucional e progride para escala. Clique para ver o detalhe."
              : "Each case starts from an institutional pilot and scales up. Click to see the details."}
          </p>
        </header>

        <ol className="casos-timeline">
          {cases.map((c) => (
            <li key={c.dictKey} className={`casos-timeline-item is-${c.status}`}>
              <div className="casos-timeline-marker" aria-hidden="true">
                <span className="casos-timeline-emoji">{c.icon}</span>
              </div>
              <div className="casos-timeline-content">
                <header>
                  <StatusBadge status={c.status} dict={dict} />
                  <h4>{c.title}</h4>
                </header>
                <p>{c.text}</p>
                <div className="casos-timeline-cta">
                  {c.sub ? (
                    <Link href={`/${lang}/casos-de-uso/${c.sub}`} className="link-arrow">
                      {lang === "pt" ? "Ver caso completo →" : "See full case →"}
                    </Link>
                  ) : (
                    <span className="muted">
                      {lang === "pt" ? "Detalhes brevemente" : "Details coming soon"}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
