import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventoBySlug, getEventoSpeakers, getEventoAgenda, countInscricoes, type Evento } from "@/lib/eventos-db";
import { WebinarInscricaoForm } from "@/components/eventos/WebinarInscricaoForm";
import { Locale } from "@/i18n/config";

export const revalidate = 60;

// Dynamic English translation helper for webinars
function getLocalizedEvento(evento: Evento, lang: Locale): Evento {
  if (lang === "pt") return evento;

  if (evento.slug === "webinar-pdw") {
    return {
      ...evento,
      titulo: "Webinar — From Blockchain to Wallet: Digital Trust in Practice (updated)",
      subtitulo: "Digital trust is transforming how we identify, share credentials and interact online.",
      descricao_curta: "Join us in this online session to discover how the Portuguese Digital Wallet is transforming digital identity in Portugal. A unique opportunity to learn, debate, and ask your questions directly to our experts.",
      descricao_longa: "The Portuguese Digital Wallet (PDW) is Portugal's sovereign digital wallet — an open infrastructure that allows citizens and institutions to manage and share verifiable credentials securely and in compliance with eIDAS 2.0 and the European EBSI network.\n\nIn this webinar, we will explore how PDW is democratizing access to digital services: from issuing verifiable university diplomas, to frictionless digital onboarding, to creating a trust ecosystem between citizens, universities, and businesses.\n\nTopics covered:\n• What is the Portuguese Digital Wallet and how it works\n• Verifiable credentials and digital diplomas: real cases\n• eIDAS 2.0 and the European digital identity wallet\n• How your institution or company can integrate PDW\n• Live platform demo",
    };
  }

  return evento;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const rawEvento = getEventoBySlug(slug);
  if (!rawEvento) return {};
  const evento = getLocalizedEvento(rawEvento, lang as Locale);
  return {
    title: `${evento.titulo} · PDW`,
    description: evento.descricao_curta ?? undefined,
  };
}

function fmtData(iso: string, lang: Locale): string {
  try {
    const locale = lang === "pt" ? "pt-PT" : "en-GB";
    return new Date(iso).toLocaleDateString(locale, {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    }) + (lang === "pt" ? " às " : " at ") + new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getEstadoBadge(estado: string, isPt: boolean) {
  const badgeMap: Record<string, { label: string; color: string; bg: string }> = {
    rascunho:    { label: isPt ? "Rascunho" : "Draft",          color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
    agendado:    { label: isPt ? "Inscrições abertas" : "Open for registration", color: "#4ade80", bg: "rgba(74,222,128,0.15)"  },
    a_decorrer:  { label: isPt ? "Ao vivo agora" : "Live now",      color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
    encerrado:   { label: isPt ? "Encerrado" : "Ended",          color: "#cbd5e1", bg: "rgba(203,213,225,0.1)" },
    arquivado:   { label: isPt ? "Arquivo" : "Archived",            color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
  };
  return badgeMap[estado] ?? { label: isPt ? "Inscrições abertas" : "Open for registration", color: "#4ade80", bg: "rgba(74,222,128,0.15)" };
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const rawEvento = getEventoBySlug(slug);
  if (!rawEvento || rawEvento.estado === "rascunho") notFound();

  const evento = getLocalizedEvento(rawEvento, lang as Locale);

  const speakers = getEventoSpeakers(evento.id);
  const agenda   = getEventoAgenda(evento.id);
  const total    = countInscricoes(evento.id);

  const isPt    = lang === "pt";
  const badge   = getEstadoBadge(evento.estado, isPt);
  const dataStr = fmtData(evento.data_inicio, lang as Locale);

  const mostrarForm =
    evento.estado === "agendado" &&
    evento.inscricoes_abertas &&
    (evento.capacidade_maxima === null || total < evento.capacidade_maxima);

  const mostrarGravacao = evento.estado === "encerrado" || evento.estado === "arquivado";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>

      {/* ── Hero (Premium and fully accessible contrast) ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: 16,
        padding: "40px 40px 32px",
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(0, 108, 75, 0.15)",
      }}>
        {/* Decorative golden thread line */}
        <div aria-hidden="true" style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent 0%, #d4af37 30%, #f5d060 60%, transparent 100%)",
          opacity: 0.7,
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {/* Event icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>

          {/* Estado badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: 12, fontWeight: 700, color: "#ffffff",
          }}>
            {evento.estado === "a_decorrer" && (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} aria-hidden="true" />
            )}
            {badge.label}
          </span>

          {evento.formato && (
            <span style={{
              fontSize: 12, color: "#e2e8f0",
              background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 20, padding: "4px 10px",
            }}>
              {evento.formato === "online" ? "Online" : evento.formato === "presencial" ? (isPt ? "Presencial" : "In Person") : (isPt ? "Híbrido" : "Hybrid")}
            </span>
          )}
        </div>

        <h1 style={{ margin: "0 0 10px", fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.25 }}>
          {evento.titulo}
        </h1>

        {evento.subtitulo && (
          <p style={{ margin: "0 0 20px", fontSize: 17, color: "#cbd5e1", lineHeight: 1.5 }}>
            {evento.subtitulo}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#e2e8f0" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <time dateTime={evento.data_inicio}>{dataStr}</time>
          </div>

          {evento.plataforma && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#e2e8f0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
              {evento.plataforma}
            </div>
          )}

          {evento.inscricoes_abertas && evento.estado === "agendado" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4ade80", fontWeight: 700 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {total} {isPt ? "inscritos" : "registered"}
              {evento.capacidade_maxima && ` / ${evento.capacidade_maxima}`}
            </div>
          )}
        </div>
      </div>

      {/* ── Descrição curta ── */}
      {evento.descricao_curta && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 17, color: "var(--color-text)", lineHeight: 1.7, margin: 0 }}>
            {evento.descricao_curta}
          </p>
        </div>
      )}

      {/* ── Descrição longa (Light Card) ── */}
      {evento.descricao_longa && (
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 32,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        }}>
          {evento.descricao_longa.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} style={{ margin: "0 0 12px", fontSize: 15, color: "var(--color-muted)", lineHeight: 1.7 }}>
              {line}
            </p>
          ))}
        </div>
      )}

      {/* ── Imagens: cartaz + cronograma ── */}
      {(evento.imagem_cartaz || evento.imagem_cronograma) && (
        <div style={{
          display: "grid",
          gridTemplateColumns: evento.imagem_cartaz && evento.imagem_cronograma ? "1fr 1fr" : "1fr",
          gap: 20,
          marginBottom: 40,
        }}>
          {evento.imagem_cartaz && (
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)" }}>
                {isPt ? "Cartaz" : "Poster"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evento.imagem_cartaz}
                alt={`${evento.titulo} — cartaz`}
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--color-border)", display: "block" }}
              />
            </div>
          )}
          {evento.imagem_cronograma && (
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)" }}>
                {isPt ? "Cronograma" : "Schedule"}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={evento.imagem_cronograma}
                alt={`${evento.titulo} — cronograma`}
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--color-border)", display: "block" }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Agenda ── */}
      {agenda.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>
            {isPt ? "Agenda" : "Schedule"}
          </h2>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            {/* Golden thread line */}
            <div aria-hidden="true" style={{
              position: "absolute", left: 7, top: 8, bottom: 8,
              width: 2,
              background: "linear-gradient(to bottom, #d4af37, #f5d060, #d4af37)",
              borderRadius: 2,
            }} />
            {agenda.map((item, i) => (
              <div key={item.id} style={{
                position: "relative",
                paddingBottom: i < agenda.length - 1 ? 20 : 0,
              }}>
                {/* Dot on thread */}
                <div aria-hidden="true" style={{
                  position: "absolute", left: -25, top: 6,
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#d4af37", border: "2px solid var(--color-bg)",
                  boxShadow: "0 0 0 2px rgba(212, 175, 87, 0.25)",
                }} />
                <div style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10, padding: "16px 20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}>
                  {item.intervalo && (
                    <span style={{ fontSize: 11, color: "var(--color-primary)", fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
                      {item.intervalo}
                    </span>
                  )}
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.bloco}</p>
                  {item.descricao && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5 }}>{item.descricao}</p>
                  )}
                  {item.responsavel && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-muted)", fontStyle: "italic" }}>{item.responsavel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Speakers ── */}
      {speakers.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>
            {isPt ? "Oradores" : "Speakers"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {speakers.map((s) => (
              <div key={s.id} style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12, padding: "20px 18px",
                display: "flex", flexDirection: "column", gap: 8,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
              }}>
                {s.foto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={s.foto} alt={s.nome} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(0, 108, 75, 0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>{s.nome}</p>
                  {s.cargo && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>{s.cargo}</p>}
                </div>
                {s.bio && <p style={{ margin: 0, fontSize: 13, color: "var(--color-muted)", lineHeight: 1.5 }}>{s.bio}</p>}
                {s.linkedin && (
                  <a href={s.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none", marginTop: "auto" }}>
                    LinkedIn →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Formulário de inscrição ── */}
      {mostrarForm && (
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "32px",
          marginBottom: 40,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
          scrollMarginTop: 80,
        }} id="inscricao">
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>
            {isPt ? "Inscrição" : "Register"}
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--color-muted)", lineHeight: 1.6 }}>
            {isPt
              ? "Preencha o formulário para garantir o seu lugar. É gratuito."
              : "Fill in the form to secure your place. It's free."}
          </p>
          <WebinarInscricaoForm
            slug={slug}
            inscricoesAbertas={evento.inscricoes_abertas}
            capacidadeMaxima={evento.capacidade_maxima}
            totalInscritos={total}
            lang={lang as Locale}
          />
        </div>
      )}

      {/* ── Pós-evento: gravação + slides ── */}
      {mostrarGravacao && (
        <div style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16, padding: "32px",
          marginBottom: 40,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
        }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>
            {isPt ? "Recursos do evento" : "Event resources"}
          </h2>
          {evento.video_gravacao_url && (
            <div style={{ marginBottom: 16 }}>
              <a href={evento.video_gravacao_url} target="_blank" rel="noopener noreferrer" className="cta cta-disruptive" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                {isPt ? "Ver gravação" : "Watch recording"}
              </a>
            </div>
          )}
          {evento.slides_url && (
            <a href={evento.slides_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--color-primary)", fontWeight: 600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              {isPt ? "Descarregar slides" : "Download slides"}
            </a>
          )}
          {!evento.video_gravacao_url && !evento.slides_url && (
            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 15 }}>
              {isPt ? "Os recursos serão disponibilizados em breve." : "Resources will be available soon."}
            </p>
          )}
        </div>
      )}

      {/* ── Durante: acesso ao vivo ── */}
      {evento.estado === "a_decorrer" && evento.link_acesso && (
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 16, padding: "28px 32px",
          marginBottom: 40, textAlign: "center",
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>
            {isPt ? "O webinar está a decorrer agora!" : "The webinar is live now!"}
          </p>
          <a href={evento.link_acesso} target="_blank" rel="noopener noreferrer" className="cta cta-disruptive"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            {isPt ? "Entrar agora" : "Join now"}
          </a>
        </div>
      )}

    </div>
  );
}
