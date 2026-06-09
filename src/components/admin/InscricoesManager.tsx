"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import type { Inscricao, Evento } from "@/lib/eventos-db";

const TIPOS_LABEL: Record<string, string> = {
  publico_geral: "Público geral",
  universidade:  "Universidade / Investigação",
  empresa:       "Empresa",
  admin_publica: "Administração pública",
  outro:         "Outro",
};

const INTERESSES_LABEL: Record<string, string> = {
  tecnologia: "Tecnologia",
  diplomas:   "Diplomas digitais",
  onboarding: "Onboarding digital",
  piloto:     "Projeto piloto",
  parceria:   "Parceria",
  imprensa:   "Imprensa",
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-PT", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function InscricoesManager() {
  const [inscricoes, setInscricoes]           = useState<Inscricao[]>([]);
  const [eventos, setEventos]                 = useState<Evento[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [eventoFiltro, setEventoFiltro]       = useState<string>("");
  const [tipoFiltro, setTipoFiltro]           = useState<string>("");
  const [interesseFiltro, setInteresseFiltro] = useState<string>("");
  const [search, setSearch]                   = useState("");
  const [expandedId, setExpandedId]           = useState<number | null>(null);

  // Resend / delete state
  const [resendingId, setResendingId]         = useState<number | null>(null);
  const [resendOkId, setResendOkId]           = useState<number | null>(null);
  const [deletingId, setDeletingId]           = useState<number | null>(null);
  const [isBulkSending, setIsBulkSending]     = useState(false);
  const [bulkResult, setBulkResult]           = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/inscricoes")
      .then((r) => r.json())
      .then((data) => {
        setInscricoes(data.inscricoes ?? []);
        setEventos(data.eventos ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return inscricoes.filter((i) => {
      if (eventoFiltro && String(i.evento_id) !== eventoFiltro) return false;
      if (tipoFiltro && i.tipo_participante !== tipoFiltro) return false;
      if (interesseFiltro && i.interesse_principal !== interesseFiltro) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !i.nome.toLowerCase().includes(q) &&
          !i.email.toLowerCase().includes(q) &&
          !(i.organizacao ?? "").toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [inscricoes, eventoFiltro, tipoFiltro, interesseFiltro, search]);

  // KPIs
  const kpiTotal    = filtered.length;
  const kpiLeads    = filtered.filter((i) => i.interesse_principal === "piloto" || i.interesse_principal === "parceria").length;
  const kpiWhatsApp = filtered.filter((i) => i.whatsapp_consent).length;

  const byTipo = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of filtered) {
      counts[i.tipo_participante] = (counts[i.tipo_participante] ?? 0) + 1;
    }
    return counts;
  }, [filtered]);

  function csvUrl() {
    const params = new URLSearchParams();
    if (eventoFiltro) params.set("evento_id", eventoFiltro);
    params.set("formato", "csv");
    return `/api/admin/inscricoes?${params}`;
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Apagar esta inscrição? Esta ação não pode ser desfeita.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/inscricoes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInscricoes((prev) => prev.filter((i) => i.id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        alert("Erro ao apagar inscrição.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleResend(id: number) {
    setResendingId(id);
    setResendOkId(null);
    try {
      const res = await fetch(`/api/admin/inscricoes/${id}`, { method: "POST" });
      if (res.ok) {
        setResendOkId(id);
        setTimeout(() => setResendOkId((cur) => (cur === id ? null : cur)), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao reenviar email.");
      }
    } finally {
      setResendingId(null);
    }
  }

  async function handleBulkResend() {
    if (filtered.length === 0) return;
    if (!window.confirm(`Reenviar email de confirmação a ${filtered.length} inscrito(s)?\n\nEsta operação pode demorar alguns segundos.`)) return;
    setIsBulkSending(true);
    setBulkResult(null);
    try {
      const res = await fetch("/api/admin/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: filtered.map((i) => i.id) }),
      });
      if (res.ok) {
        const data = await res.json();
        setBulkResult({ sent: data.sent, failed: data.failed });
      } else {
        alert("Erro no reenvio em massa.");
      }
    } finally {
      setIsBulkSending(false);
    }
  }

  const pill = (color: string, label: string) => (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      background: `${color}18`, color,
    }}>
      {label}
    </span>
  );

  const btnBase: React.CSSProperties = {
    border: "none", borderRadius: 6, cursor: "pointer",
    fontSize: 12, fontWeight: 600, fontFamily: "inherit",
    padding: "5px 10px", transition: "opacity 0.15s",
  };

  return (
    <div className="admin-card">
      <div className="admin-card__head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Inscrições em eventos</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {bulkResult && (
            <span style={{ fontSize: 12, color: bulkResult.failed > 0 ? "#f59e0b" : "#22c55e" }}>
              ✓ {bulkResult.sent} enviados{bulkResult.failed > 0 ? `, ${bulkResult.failed} falharam` : ""}
            </span>
          )}
          <button
            onClick={handleBulkResend}
            disabled={isBulkSending || filtered.length === 0}
            style={{
              ...btnBase,
              background: "rgba(37,99,235,0.12)",
              color: "var(--color-primary)",
              border: "1px solid rgba(37,99,235,0.25)",
              opacity: isBulkSending || filtered.length === 0 ? 0.5 : 1,
            }}
          >
            {isBulkSending ? "A enviar…" : `↩ Reenviar a filtrados (${filtered.length})`}
          </button>
          <a
            href={csvUrl()}
            download
            className="admin-btn admin-btn--secondary"
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            ↓ Exportar CSV
          </a>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 16, padding: "16px 24px", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
        {[
          { label: "Total filtrado", value: kpiTotal, color: "var(--color-primary)" },
          { label: "Leads (piloto/parceria)", value: kpiLeads, color: "#f59e0b" },
          { label: "Querem WhatsApp", value: kpiWhatsApp, color: "#25D366" },
        ].map((k) => (
          <div key={k.label} style={{ minWidth: 120 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {Object.entries(byTipo).sort((a, b) => b[1] - a[1]).map(([tipo, n]) => (
            <span key={tipo} style={{ fontSize: 12, color: "var(--color-muted)" }}>
              {TIPOS_LABEL[tipo] ?? tipo}: <strong style={{ color: "var(--color-text)" }}>{n}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Pesquisar nome, email, organização…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 220px", padding: "7px 12px", borderRadius: 8,
            border: "1px solid var(--color-border)", fontSize: 13,
            background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "inherit",
          }}
        />
        <select
          value={eventoFiltro}
          onChange={(e) => setEventoFiltro(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "inherit" }}
        >
          <option value="">Todos os eventos</option>
          {eventos.map((ev) => (
            <option key={ev.id} value={String(ev.id)}>{ev.titulo}</option>
          ))}
        </select>
        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "inherit" }}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TIPOS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select
          value={interesseFiltro}
          onChange={(e) => setInteresseFiltro(e.target.value)}
          style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 13, background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "inherit" }}
        >
          <option value="">Todos os interesses</option>
          {Object.entries(INTERESSES_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <p style={{ padding: "32px 24px", color: "var(--color-muted)", textAlign: "center" }}>A carregar…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "32px 24px", color: "var(--color-muted)", textAlign: "center" }}>
            {inscricoes.length === 0 ? "Ainda não há inscrições." : "Nenhum resultado para os filtros aplicados."}
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.02)" }}>
                {["Nome", "Email", "Organização", "Tipo", "Interesse", "WhatsApp", "Data"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <Fragment key={i.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                    style={{
                      borderBottom: expandedId === i.id ? "none" : "1px solid var(--color-border)",
                      cursor: "pointer",
                      background: expandedId === i.id ? "rgba(37,99,235,0.04)" : undefined,
                      opacity: deletingId === i.id ? 0.4 : 1,
                    }}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap" }}>
                      {i.nome}
                      {(i.interesse_principal === "piloto" || i.interesse_principal === "parceria") && (
                        <span title="Lead qualificado" style={{ marginLeft: 6, color: "#f59e0b", fontSize: 12 }}>⭐</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--color-muted)" }}>
                      <a href={`mailto:${i.email}`} style={{ color: "var(--color-primary)" }} onClick={(e) => e.stopPropagation()}>
                        {i.email}
                      </a>
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--color-muted)" }}>{i.organizacao ?? "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {pill("#3b82f6", TIPOS_LABEL[i.tipo_participante] ?? i.tipo_participante)}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {i.interesse_principal
                        ? pill(
                            i.interesse_principal === "piloto" || i.interesse_principal === "parceria" ? "#f59e0b" : "#64748b",
                            INTERESSES_LABEL[i.interesse_principal] ?? i.interesse_principal
                          )
                        : <span style={{ color: "var(--color-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      {i.whatsapp_consent ? <span style={{ color: "#25D366", fontSize: 15 }}>✓</span> : <span style={{ color: "var(--color-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--color-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                      {fmtDate(i.created_at)}
                    </td>
                  </tr>
                  {expandedId === i.id && (
                    <tr style={{ background: "rgba(37,99,235,0.03)" }}>
                      <td colSpan={7} style={{ padding: "12px 14px 16px 32px", borderBottom: "1px solid var(--color-border)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Evento</div>
                            <div style={{ fontSize: 13, color: "var(--color-text)" }}>{i.evento_titulo}</div>
                          </div>
                          {i.telemovel && (
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Telemóvel</div>
                              <div style={{ fontSize: 13, color: "var(--color-text)" }}>{i.telemovel}</div>
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Idioma</div>
                            <div style={{ fontSize: 13, color: "var(--color-text)" }}>{(i.lang || "pt").toUpperCase()}</div>
                          </div>
                          {i.origem && (
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Origem</div>
                              <div style={{ fontSize: 13, color: "var(--color-text)" }}>{i.origem}</div>
                            </div>
                          )}
                        </div>

                        {i.pergunta_speakers && (
                          <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(0,0,0,0.04)", borderRadius: 8, borderLeft: "3px solid var(--color-primary)" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Pergunta para speakers</div>
                            <div style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>{i.pergunta_speakers}</div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleResend(i.id); }}
                            disabled={resendingId === i.id}
                            style={{
                              ...btnBase,
                              background: "rgba(37,99,235,0.1)",
                              color: "#60a5fa",
                              border: "1px solid rgba(37,99,235,0.25)",
                              opacity: resendingId === i.id ? 0.6 : 1,
                            }}
                          >
                            {resendingId === i.id ? "A enviar…" : "↩ Reenviar email"}
                          </button>
                          {resendOkId === i.id && (
                            <span style={{ fontSize: 12, color: "#22c55e" }}>✓ Email enviado</span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }}
                            disabled={deletingId === i.id}
                            style={{
                              ...btnBase,
                              background: "rgba(239,68,68,0.08)",
                              color: "#ef4444",
                              border: "1px solid rgba(239,68,68,0.2)",
                              marginLeft: "auto",
                              opacity: deletingId === i.id ? 0.6 : 1,
                            }}
                          >
                            {deletingId === i.id ? "A apagar…" : "✕ Apagar inscrição"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
