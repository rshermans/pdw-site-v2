"use client";

import { useState, useEffect } from "react";
import type { Evento } from "@/lib/eventos-db";

interface Props {
  initialEventos: Evento[];
}

const ESTADOS = ["rascunho", "agendado", "a_decorrer", "encerrado", "arquivado"] as const;
const ESTADO_COLORS: Record<string, string> = {
  rascunho:   "#64748b",
  agendado:   "#22c55e",
  a_decorrer: "#f59e0b",
  encerrado:  "#94a3b8",
  arquivado:  "#475569",
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

type FormTab = "geral" | "descricao" | "recursos" | "divulgacao";

export function EventosManager({ initialEventos }: Props) {
  const [eventos, setEventos] = useState(initialEventos);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [formTab, setFormTab] = useState<FormTab>("geral");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [subtitulo, setSubtitulo] = useState("");
  const [descricaoCurta, setDescricaoCurta] = useState("");
  const [descricaoLonga, setDescricaoLonga] = useState("");
  const [icone, setIcone] = useState("webinar");
  const [imagemDestaque, setImagemDestaque] = useState("");
  const [imagemCartaz, setImagemCartaz] = useState("");
  const [imagemCronograma, setImagemCronograma] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [fusoHorario, setFusoHorario] = useState("Europe/Lisbon");
  const [formato, setFormato] = useState("online");
  const [local, setLocal] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [linkAcesso, setLinkAcesso] = useState("");
  const [inscricoesAbertas, setInscricoesAbertas] = useState(true);
  const [capacidadeMaxima, setCapacidadeMaxima] = useState("");
  const [estado, setEstado] = useState<typeof ESTADOS[number]>("rascunho");
  const [videoGravacaoUrl, setVideoGravacaoUrl] = useState("");
  const [slidesUrl, setSlidesUrl] = useState("");
  const [bannerAtivo, setBannerAtivo] = useState(false);
  const [bannerTexto, setBannerTexto] = useState("");
  const [bannerCtaTexto, setBannerCtaTexto] = useState("Inscrever");
  const [bannerCtaLink, setBannerCtaLink] = useState("");
  const [anuncioInicio, setAnuncioInicio] = useState("");
  const [anuncioFim, setAnuncioFim] = useState("");
  const [divulgarFeed, setDivulgarFeed] = useState(true); // for creation only

  // Load selected event into form
  useEffect(() => {
    if (selectedId) {
      const ev = eventos.find((e) => e.id === selectedId);
      if (ev) {
        setTitulo(ev.titulo);
        setSlug(ev.slug);
        setSlugManuallyEdited(true);
        setSubtitulo(ev.subtitulo || "");
        setDescricaoCurta(ev.descricao_curta || "");
        setDescricaoLonga(ev.descricao_longa || "");
        setIcone(ev.icone || "webinar");
        setImagemDestaque(ev.imagem_destaque || "");
        setImagemCartaz(ev.imagem_cartaz || "");
        setImagemCronograma(ev.imagem_cronograma || "");
        setDataInicio(ev.data_inicio ? ev.data_inicio.replace(" ", "T").slice(0, 16) : "");
        setDataFim(ev.data_fim ? ev.data_fim.replace(" ", "T").slice(0, 16) : "");
        setFusoHorario(ev.fuso_horario || "Europe/Lisbon");
        setFormato(ev.formato || "online");
        setLocal(ev.local || "");
        setPlataforma(ev.plataforma || "");
        setLinkAcesso(ev.link_acesso || "");
        setInscricoesAbertas(ev.inscricoes_abertas);
        setCapacidadeMaxima(ev.capacidade_maxima ? String(ev.capacidade_maxima) : "");
        setEstado(ev.estado);
        setVideoGravacaoUrl(ev.video_gravacao_url || "");
        setSlidesUrl(ev.slides_url || "");
        setBannerAtivo(ev.banner_ativo);
        setBannerTexto(ev.banner_texto || "");
        setBannerCtaTexto(ev.banner_cta_texto || "Inscrever");
        setBannerCtaLink(ev.banner_cta_link || "");
        setAnuncioInicio(ev.anuncio_inicio || "");
        setAnuncioFim(ev.anuncio_fim || "");
        setErrorMsg("");
        setSuccessMsg("");
      }
    } else {
      // Clear form for new event
      setTitulo("");
      setSlug("");
      setSlugManuallyEdited(false);
      setSubtitulo("");
      setDescricaoCurta("");
      setDescricaoLonga("");
      setIcone("webinar");
      setImagemDestaque("");
      setImagemCartaz("");
      setImagemCronograma("");
      setDataInicio("");
      setDataFim("");
      setFusoHorario("Europe/Lisbon");
      setFormato("online");
      setLocal("");
      setPlataforma("");
      setLinkAcesso("");
      setInscricoesAbertas(true);
      setCapacidadeMaxima("");
      setEstado("rascunho");
      setVideoGravacaoUrl("");
      setSlidesUrl("");
      setBannerAtivo(false);
      setBannerTexto("");
      setBannerCtaTexto("Inscrever");
      setBannerCtaLink("");
      setAnuncioInicio("");
      setAnuncioFim("");
      setDivulgarFeed(true);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [selectedId, eventos]);

  const handleTitleChange = (val: string) => {
    setTitulo(val);
    if (!slugManuallyEdited && !selectedId) {
      setSlug(slugify(val));
    }
  };

  async function refresh() {
    try {
      const r = await fetch("/api/admin/eventos");
      if (r.ok) {
        const data = await r.json();
        setEventos(data.eventos);
      }
    } catch { /* noop */ }
  }

  function handleCancel() {
    setSelectedId(null);
  }

  async function remove(id: number, e: React.MouseEvent) {
    e.stopPropagation(); // prevent selecting the event
    if (!confirm("Eliminar este evento permanentemente? As inscrições associadas serão perdidas!")) return;
    try {
      const r = await fetch(`/api/admin/eventos/${id}`, { method: "DELETE" });
      if (r.ok) {
        setEventos(eventos.filter((ev) => ev.id !== id));
        if (selectedId === id) setSelectedId(null);
        setSuccessMsg("Evento eliminado com sucesso.");
      } else {
        const err = await r.json();
        setErrorMsg(err.error || "Erro ao eliminar o evento.");
      }
    } catch {
      setErrorMsg("Erro de rede ao tentar eliminar.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !slug.trim() || !dataInicio) {
      setErrorMsg("Por favor, preencha os campos obrigatórios (Título, Slug e Data Início).");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    // ISO strings formatting
    const formattedInicio = dataInicio.replace("T", " ") + ":00";
    const formattedFim = dataFim ? dataFim.replace("T", " ") + ":00" : null;

    const payload = {
      titulo: titulo.trim(),
      slug: slug.trim(),
      subtitulo: subtitulo.trim() || null,
      descricao_curta: descricaoCurta.trim() || null,
      descricao_longa: descricaoLonga.trim() || null,
      icone,
      imagem_destaque: imagemDestaque.trim() || null,
      imagem_cartaz: imagemCartaz.trim() || null,
      imagem_cronograma: imagemCronograma.trim() || null,
      data_inicio: formattedInicio,
      data_fim: formattedFim,
      fuso_horario: fusoHorario,
      formato,
      local: local.trim() || null,
      plataforma: plataforma.trim() || null,
      link_acesso: linkAcesso.trim() || null,
      inscricoes_abertas: inscricoesAbertas ? 1 : 0,
      capacidade_maxima: capacidadeMaxima ? Number(capacidadeMaxima) : null,
      estado,
      video_gravacao_url: videoGravacaoUrl.trim() || null,
      slides_url: slidesUrl.trim() || null,
      banner_ativo: bannerAtivo ? 1 : 0,
      banner_texto: bannerTexto.trim() || null,
      banner_cta_texto: bannerCtaTexto.trim() || "Inscrever",
      banner_cta_link: bannerCtaLink.trim() || null,
      anuncio_inicio: anuncioInicio || null,
      anuncio_fim: anuncioFim || null,
      divulgar_feed: selectedId ? undefined : divulgarFeed,
    };

    try {
      const url = selectedId ? `/api/admin/eventos/${selectedId}` : "/api/admin/eventos";
      const method = selectedId ? "PATCH" : "POST";

      const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await r.json();
      if (r.ok) {
        setSuccessMsg(selectedId ? "Evento guardado com sucesso!" : "Evento criado com sucesso!");
        if (!selectedId) setSelectedId(null); // clear
        await refresh();
      } else {
        if (res.error === "slug_exists") {
          setErrorMsg("Este Slug já está em uso noutro evento. Escolha um slug único.");
        } else {
          setErrorMsg(res.error || "Ocorreu um erro ao guardar.");
        }
      }
    } catch {
      setErrorMsg("Erro de rede ao tentar submeter.");
    } finally {
      setSaving(false);
    }
  }

  // Filter list
  const filteredEventos = eventos.filter(
    (e) =>
      e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      e.slug.toLowerCase().includes(search.toLowerCase())
  );

  const formTabStyle = (tab: FormTab) => ({
    padding: "8px 12px",
    borderRadius: 6,
    border: "0",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    background: formTab === tab ? "var(--color-primary)" : "transparent",
    color: formTab === tab ? "#fff" : "var(--color-muted)",
    transition: "all 0.2s ease",
  });

  return (
    <div className="admin-feed-layout">
      {/* Left Column: Events list */}
      <section className="admin-card">
        <header className="admin-card__head" style={{ marginBottom: 12 }}>
          <h2>Eventos / Webinars</h2>
          <span className="admin-pill">{eventos.length}</span>
          <button
            onClick={() => setSelectedId(null)}
            className="admin-btn admin-btn--primary"
            style={{ padding: "6px 12px", fontSize: 12, marginLeft: "auto" }}
          >
            + Novo Evento
          </button>
        </header>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Procurar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 13,
              background: "var(--color-bg)",
              color: "var(--color-text)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Events list container */}
        <ul className="admin-posts-list">
          {filteredEventos.map((e) => (
            <li
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={`admin-posts-list__row ${selectedId === e.id ? "is-active" : ""}`}
              style={{
                cursor: "pointer",
                background: selectedId === e.id ? "rgba(37,99,235,0.06)" : undefined,
                borderColor: selectedId === e.id ? "rgba(37,99,235,0.2)" : undefined,
              }}
            >
              <div
                className="admin-posts-list__icon"
                style={{
                  background: `${ESTADO_COLORS[e.estado]}15`,
                  color: ESTADO_COLORS[e.estado],
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  borderRadius: 6,
                  width: 38,
                  height: 38,
                }}
              >
                {e.estado.slice(0, 3)}
              </div>
              <div className="admin-posts-list__main">
                <strong>{e.titulo}</strong>
                <small>
                  /{e.slug} · {fmtDate(e.data_inicio)}
                </small>
              </div>
              <div className="admin-posts-list__actions" style={{ marginLeft: "auto" }}>
                <button
                  onClick={(event) => remove(e.id, event)}
                  aria-label="Eliminar evento"
                  style={{ color: "#ef4444", opacity: 0.7 }}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
          {filteredEventos.length === 0 && (
            <div className="admin-empty">Nenhum evento encontrado.</div>
          )}
        </ul>
      </section>

      {/* Right Column: Editor form */}
      <aside className="admin-compose">
        <form onSubmit={handleSubmit} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <header className="admin-card__head">
            <h2>{selectedId ? "Editar Evento" : "Compor Novo Evento"}</h2>
            {selectedId && (
              <span className="admin-pill" style={{ background: "rgba(37,99,235,0.1)", color: "var(--color-primary)" }}>
                ID: {selectedId}
              </span>
            )}
          </header>

          {/* Feedback alerts */}
          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fee2e2", color: "#b91c1c", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ background: "#ecfdf5", border: "1px solid #d1fae5", color: "#065f46", padding: "10px 12px", borderRadius: 8, fontSize: 13 }}>
              {successMsg}
            </div>
          )}

          {/* Form Internal Tabs */}
          <div style={{ display: "flex", background: "var(--color-bg)", padding: 4, borderRadius: 8, gap: 2, border: "1px solid var(--color-border)" }}>
            <button type="button" onClick={() => setFormTab("geral")} style={formTabStyle("geral")}>Geral</button>
            <button type="button" onClick={() => setFormTab("descricao")} style={formTabStyle("descricao")}>Descrição</button>
            <button type="button" onClick={() => setFormTab("recursos")} style={formTabStyle("recursos")}>Recursos</button>
            <button type="button" onClick={() => setFormTab("divulgacao")} style={formTabStyle("divulgacao")}>Popup</button>
          </div>

          {/* TAB 1: Geral */}
          {formTab === "geral" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="admin-field">
                <span>Título *</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Webinar sobre Identidade Digital"
                  value={titulo}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>Subtitle</span>
                <input
                  type="text"
                  placeholder="Ex: O Futuro da Confiança Europeia"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Slug URL (único) *</span>
                  <input
                    type="text"
                    required
                    placeholder="webinar-identidade"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugManuallyEdited(true);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Formato</span>
                  <select
                    value={formato}
                    onChange={(e) => setFormato(e.target.value)}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 8,
                      border: "1px solid var(--color-border)", font: "inherit",
                      fontSize: 13, background: "var(--color-bg)", color: "var(--color-text)",
                    }}
                  >
                    <option value="online">Online</option>
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Localização (Física)</span>
                  <input
                    type="text"
                    placeholder="Auditório X"
                    disabled={formato === "online"}
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Plataforma (Digital)</span>
                  <input
                    type="text"
                    placeholder="Teams, Zoom, etc"
                    disabled={formato === "presencial"}
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Data/Hora Início *</span>
                  <input
                    type="datetime-local"
                    required
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Data/Hora Fim</span>
                  <input
                    type="datetime-local"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Fuso Horário</span>
                  <input
                    type="text"
                    value={fusoHorario}
                    onChange={(e) => setFusoHorario(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Capacidade Máxima</span>
                  <input
                    type="number"
                    placeholder="Sem limite"
                    value={capacidadeMaxima}
                    onChange={(e) => setCapacidadeMaxima(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Descrição */}
          {formTab === "descricao" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="admin-field">
                <span>Descrição Curta (Excerto / Chamada)</span>
                <textarea
                  placeholder="Escreva um breve resumo que convide os utilizadores a registarem-se..."
                  value={descricaoCurta}
                  onChange={(e) => setDescricaoCurta(e.target.value)}
                  rows={3}
                />
              </label>

              <label className="admin-field">
                <span>Descrição Longa (Detalhada)</span>
                <textarea
                  placeholder="Explique os temas, cronograma detalhado ou detalhes importantes sobre o evento..."
                  value={descricaoLonga}
                  onChange={(e) => setDescricaoLonga(e.target.value)}
                  rows={8}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Ícone</span>
                  <input
                    type="text"
                    placeholder="webinar"
                    value={icone}
                    onChange={(e) => setIcone(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>URL Imagem Destaque</span>
                  <input
                    type="text"
                    placeholder="/uploads/destaque.jpg"
                    value={imagemDestaque}
                    onChange={(e) => setImagemDestaque(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Recursos */}
          {formTab === "recursos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label className="admin-field">
                <span>Link de Acesso Direto (Teams/Zoom/Youtube)</span>
                <input
                  type="url"
                  placeholder="https://teams.microsoft.com/l/meetup-join/..."
                  value={linkAcesso}
                  onChange={(e) => setLinkAcesso(e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>URL da Imagem do Cartaz (Poster)</span>
                <input
                  type="text"
                  placeholder="/uploads/cartaz-evento.jpg"
                  value={imagemCartaz}
                  onChange={(e) => setImagemCartaz(e.target.value)}
                />
              </label>

              <label className="admin-field">
                <span>URL da Imagem do Cronograma</span>
                <input
                  type="text"
                  placeholder="/uploads/cronograma-evento.jpg"
                  value={imagemCronograma}
                  onChange={(e) => setImagemCronograma(e.target.value)}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Link de Vídeo de Gravação</span>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoGravacaoUrl}
                    onChange={(e) => setVideoGravacaoUrl(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Link dos Slides do Evento</span>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/presentation/..."
                    value={slidesUrl}
                    onChange={(e) => setSlidesUrl(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Divulgação e Popup */}
          {formTab === "divulgacao" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Estado do Evento</span>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: 8,
                      border: "1px solid var(--color-border)", font: "inherit",
                      fontSize: 13, background: "var(--color-bg)", color: "var(--color-text)",
                    }}
                  >
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
                  <label className="admin-field admin-field--inline">
                    <input
                      type="checkbox"
                      checked={inscricoesAbertas}
                      onChange={(e) => setInscricoesAbertas(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#22c55e" }}
                    />
                    <span>Inscrições abertas</span>
                  </label>
                  <label className="admin-field admin-field--inline">
                    <input
                      type="checkbox"
                      checked={bannerAtivo}
                      onChange={(e) => setBannerAtivo(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#d4af37" }}
                    />
                    <span>Popup Banner ativo</span>
                  </label>
                </div>
              </div>

              <label className="admin-field">
                <span>Texto do Banner Popup (opcional)</span>
                <input
                  type="text"
                  placeholder="Ex: Não perca o nosso próximo webinar! Inscreva-se já!"
                  disabled={!bannerAtivo}
                  value={bannerTexto}
                  onChange={(e) => setBannerTexto(e.target.value)}
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Texto do CTA do Banner</span>
                  <input
                    type="text"
                    placeholder="Inscrever"
                    disabled={!bannerAtivo}
                    value={bannerCtaTexto}
                    onChange={(e) => setBannerCtaTexto(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Link do CTA do Banner</span>
                  <input
                    type="text"
                    placeholder="Deixe em branco para apontar ao evento"
                    disabled={!bannerAtivo}
                    value={bannerCtaLink}
                    onChange={(e) => setBannerCtaLink(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label className="admin-field">
                  <span>Mostrar popup a partir de</span>
                  <input
                    type="date"
                    disabled={!bannerAtivo}
                    value={anuncioInicio}
                    onChange={(e) => setAnuncioInicio(e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Mostrar popup até</span>
                  <input
                    type="date"
                    disabled={!bannerAtivo}
                    value={anuncioFim}
                    onChange={(e) => setAnuncioFim(e.target.value)}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Creation-only Option */}
          {!selectedId && (
            <label className="admin-field admin-field--inline" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
              <input
                type="checkbox"
                checked={divulgarFeed}
                onChange={(e) => setDivulgarFeed(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span>Divulgar automaticamente no Feed (Atualidades)</span>
            </label>
          )}

          {/* Form Actions */}
          <div className="admin-actions" style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn--primary"
            >
              {saving ? "A guardar..." : selectedId ? "Guardar alterações" : "Criar Evento"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={handleCancel}
                className="admin-btn admin-btn--ghost"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </aside>
    </div>
  );
}
