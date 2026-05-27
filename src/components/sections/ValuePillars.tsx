/**
 * pdw-site-v2/src/components/sections/ValuePillars.tsx
 *
 * SUBSTITUI o existente. Layout editorial:
 *   - Painel azul-escuro à esquerda com Imagem-isometrica.png
 *   - 3 valores em lista numerada (01/02/03) à direita
 *   - NÃO usa 3 cards iguais — quebra o "AI-feel" da versão anterior
 *
 * Server Component (sem estado).
 */
import Image from "next/image";

interface ValuePillarsProps {
  lang: string;
}

export function ValuePillars({ lang }: ValuePillarsProps) {
  const pillars =
    lang === "pt"
      ? [
          {
            tag: "01",
            title: "Privacidade por desenho",
            text: "Os seus dados são processados localmente no dispositivo. Você decide o que partilha, com quem e durante quanto tempo. Nada sai sem consentimento explícito.",
          },
          {
            tag: "02",
            title: "Conformidade europeia",
            text: "Alinhada com eIDAS 2.0, EBSI e EUDI ARF — garante validade jurídica e reconhecimento em todos os 27 Estados-Membros da União Europeia.",
          },
          {
            tag: "03",
            title: "Soberania digital",
            text: "Infraestrutura nacional crítica, coordenada pela TecMinho. Portugal mantém o controlo da camada de execução de credenciais — sem dependência externa.",
          },
        ]
      : [
          {
            tag: "01",
            title: "Privacy by design",
            text: "Your data is processed locally on the device. You decide what to share, with whom, and for how long. Nothing leaves without explicit consent.",
          },
          {
            tag: "02",
            title: "European compliance",
            text: "Aligned with eIDAS 2.0, EBSI and EUDI ARF — ensures legal validity and recognition in all 27 EU Member States.",
          },
          {
            tag: "03",
            title: "Digital sovereignty",
            text: "National critical infrastructure, coordinated by TecMinho. Portugal retains control of the credential execution layer — with no external dependency.",
          },
        ];

  return (
    <section className="pillars-editorial" aria-labelledby="pillars-title">
      <div className="pillars-visual">
        <Image
          src="/Imagem-isometrica.png"
          alt={
            lang === "pt"
              ? "Aplicação PDW com camadas de privacidade, conformidade e educação"
              : "PDW app with privacy, compliance and education layers"
          }
          width={520}
          height={520}
          loading="lazy"
        />
      </div>
      <div className="pillars-content">
        <header className="pillars-header">
          <span className="pillars-eyebrow">
            {lang === "pt" ? "Os três pilares da PDW" : "The three pillars of PDW"}
          </span>
          <h2 id="pillars-title" className="pillars-title">
            {lang === "pt"
              ? "Construída sobre três decisões não-negociáveis."
              : "Built on three non-negotiable decisions."}
          </h2>
        </header>
        <ol className="pillars-list">
          {pillars.map((p) => (
            <li key={p.tag} className="pillars-item">
              <div className="pillars-item-tag">{p.tag}</div>
              <div className="pillars-item-body">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
