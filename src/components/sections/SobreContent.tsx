/**
 * pdw-site-v2/src/components/sections/SobreContent.tsx
 *
 * Server Component. Reúne todas as secções da página Sobre:
 *   - KPI strip (72,9 M€ · 26 · 378 · 44)
 *   - Callout TecMinho + introdução
 *   - Normas técnicas (eIDAS · EBSI · EUDI ARF)
 *   - Equipa core (grelha com placeholders de iniciais)
 *   - Governação + exportação
 *   - Lista de parceiros (TecMinho destacada)
 *
 * Não usa estado nem `useState` — pode ficar como Server Component
 * para SEO e tempo de carregamento.
 */
import Image from "next/image";

interface SobreContentProps {
  dict: any;
}

const KPI_DATA = [
  { value: "72,9 M€", label: "Investimento total do consórcio" },
  { value: "26", label: "Produtos inovadores na Agenda" },
  { value: "378", label: "Profissionais mobilizados" },
  { value: "44", label: "Entidades · PME · RTOs · Estado" },
];

export function SobreContent({ dict }: SobreContentProps) {
  const standards = [
    { tag: "EIDAS 2.0", name: "Identificação eletrónica", body: dict.about.standards.eidas.split(":").slice(1).join(":").trim() },
    { tag: "EBSI", name: "Infraestrutura europeia", body: dict.about.standards.ebsi.split(":").slice(1).join(":").trim() },
    { tag: "EUDI ARF", name: "Architecture & Reference Framework", body: dict.about.standards.eudi.split(":").slice(1).join(":").trim() },
  ];

  const team = dict.about.team.members as Array<{ name: string; role: string; photo?: string; linkedin?: string }>;
  const partners = dict.about.partners.list as Array<{ name: string; role: string; description?: string }>;

  return (
    <>
      {/* KPI strip */}
      <section className="kpi-strip" aria-label="Indicadores do consórcio">
        {KPI_DATA.map((k) => (
          <div className="kpi-stat" key={k.label}>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </section>

      {/* Two-column intro */}
      <section className="two-col">
        <div className="section-card section-card-soft">
          <h2 className="section-title">{dict.about.whatIsPdw.title}</h2>
          <p>{dict.about.whatIsPdw.text}</p>
        </div>
        <div className="section-card section-card-emphasis">
          <span className="callout-tag">Coordenação institucional</span>
          <h2 className="section-title">O papel da TecMinho</h2>
          <p>
            A <strong>TecMinho</strong> — interface da Universidade do Minho para a transferência
            de conhecimento, fundada em 1990 — lidera o desenvolvimento técnico e a coordenação
            institucional da PDW dentro do consórcio.
          </p>
          <p>
            Esta responsabilidade traduz a aposta nacional em colocar o ensino superior público
            no centro de uma infraestrutura crítica de soberania digital.
          </p>
          <a className="callout-link" href="https://www.tecminho.uminho.pt/" target="_blank" rel="noopener noreferrer">
            Conhecer a TecMinho →
          </a>
        </div>
      </section>

      {/* Strategic context */}
      <section className="section-card">
        <h2 className="section-title">{dict.about.strategicContext.title}</h2>
        <p>{dict.about.strategicContext.text}</p>
      </section>

      {/* Standards */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">Fundamentos técnicos</span>
          <h2 className="section-title">{dict.about.standards.title}</h2>
        </header>
        <div className="standards-grid">
          {standards.map((s) => (
            <article className="standard-block" key={s.tag}>
              <span className="standard-tag">{s.tag}</span>
              <h3 className="standard-name">{s.name}</h3>
              <p className="standard-body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Team grid */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">{dict.about.team.title}</span>
          <h2 className="section-title">{dict.about.team.subtitle}</h2>
        </header>
        <div className="team-grid">
          {team.map((member) => {
            const initials = member.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("");
            return member.linkedin ? (
              <a key={member.name} href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${member.name}`} className="team-card-link">
                <article className="team-card">
                  {member.photo ? (
                    <div className="team-photo team-photo-img">
                      <Image src={member.photo} alt={member.name} fill={true} className="team-photo-picture" sizes="(max-width: 768px) 80px, 96px" />
                      <div className="team-photo-linkedin-overlay">
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect width="4" height="12" x="2" y="9"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="team-photo" aria-hidden="true">
                      <span>{initials}</span>
                    </div>
                  )}
                  <div className="team-name">{member.name}</div>
                  <div className="team-role">{member.role}</div>
                  <div className="team-linkedin-badge">
                    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    LinkedIn
                  </div>
                </article>
              </a>
            ) : (
              <article key={member.name} className="team-card">
                {member.photo ? (
                  <div className="team-photo team-photo-img">
                    <Image src={member.photo} alt={member.name} fill={true} className="team-photo-picture" sizes="(max-width: 768px) 80px, 96px" />
                    <div className="team-photo-linkedin-overlay">
                      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect width="4" height="12" x="2" y="9"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="team-photo" aria-hidden="true">
                    <span>{initials}</span>
                  </div>
                )}
                <div className="team-name">{member.name}</div>
                <div className="team-role">{member.role}</div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Governance */}
      <section className="two-col">
        <div className="section-card">
          <h2 className="section-title">{dict.about.governance.title}</h2>
          <p>{dict.about.governance.text}</p>
        </div>
        <div className="section-card">
          <h2 className="section-title">Compromisso de exportação</h2>
          <p>
            Mais de <strong>dois terços das vendas previstas</strong> destinam-se a mercados
            externos, consolidando a PDW como produto português de exportação na identidade
            digital descentralizada.
          </p>
        </div>
      </section>

      {/* Partners list */}
      <section>
        <header className="section-header">
          <span className="page-hero-eyebrow">Consórcio</span>
          <h2 className="section-title">{dict.about.partners.title}</h2>
        </header>
        <div className="partners-list">
          {partners.map((p, i) => (
            <article key={p.name} className={`partner-row${i === 0 ? " partner-row-lead" : ""}`}>
              <div className="partner-meta">
                <div className="partner-name">{p.name}</div>
                <div className="partner-role">{p.role}</div>
              </div>
              {p.description && <p className="partner-desc">{p.description}</p>}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
