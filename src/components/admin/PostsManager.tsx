// pdw-site-v2/src/components/admin/PostsManager.tsx
// Client component principal do /admin/atualidades.
// Mostra lista de posts à esquerda, compose bar + preview à direita.
"use client";

import { useState, useEffect } from "react";
import type { Post, PostType } from "@/lib/posts-db";
import type { Evento } from "@/lib/eventos-db";

interface Props {
  initialPosts: Post[];
  eventos?: Evento[];
}

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  pdw: { label: "PDW", color: "var(--color-primary)" },
  youtube: { label: "YouTube", color: "#FF0033" },
  spotify: { label: "Spotify", color: "#1DB954" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
  instagram: { label: "Instagram", color: "#E1306C" },
  x: { label: "X", color: "var(--color-text)" },
  evento: { label: "Evento", color: "var(--color-secondary)" },
  imagem: { label: "Imagem", color: "var(--color-muted)" },
};

type ComposeMode = "link" | "evento";

export function PostsManager({ initialPosts, eventos }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [mode, setMode] = useState<ComposeMode>("link");
  const [url, setUrl] = useState("");
  const [detected, setDetected] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [pinned, setPinned] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [saving, setSaving] = useState(false);
  // evento-mode fields
  const [eventoUrl, setEventoUrl] = useState("");
  const [eventoDate, setEventoDate] = useState("");
  const [associatedEventoId, setAssociatedEventoId] = useState<number | null>(null);

  const handleSelectEvento = (evtId: number) => {
    setAssociatedEventoId(evtId);
    const ev = eventos?.find(e => e.id === evtId);
    if (ev) {
      setEventoUrl(`/pt/eventos/${ev.slug}`);
      const dateStr = ev.data_inicio ? ev.data_inicio.replace(" ", "T").slice(0, 16) : "";
      setEventoDate(dateStr);
      setTitle(ev.titulo);
      setExcerpt(ev.descricao_curta || "");
    } else {
      setEventoUrl("");
      setEventoDate("");
      setTitle("");
      setExcerpt("");
    }
  };

  // debounce paste → /api/admin/embed
  useEffect(() => {
    if (!url) { setDetected(null); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/admin/embed", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await r.json();
        if (data.provider) {
          setDetected(data);
          if (data.payload?.title && !title) setTitle(data.payload.title);
        } else {
          setDetected(null);
        }
      } catch { /* noop */ }
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  async function refresh() {
    const r = await fetch("/api/admin/posts?status=all");
    const data = await r.json();
    setPosts(data.posts);
  }

  function resetForm() {
    setUrl(""); setTitle(""); setExcerpt(""); setPinned(false); setScheduleAt("");
    setDetected(null); setEventoUrl(""); setEventoDate(""); setAssociatedEventoId(null);
  }

  async function submit(status: "draft" | "published" | "scheduled") {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let body: any;
      if (mode === "evento") {
        const pageUrl = eventoUrl.trim() || "/pt/eventos/webinar-pdw";
        body = {
          type: "evento",
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          source_url: pageUrl,
          embed: {
            date_iso: eventoDate || undefined,
            rsvp_url: pageUrl,
          },
          status,
          scheduled_at: status === "scheduled" ? scheduleAt : null,
          pinned,
        };
      } else {
        body = {
          type: detected?.provider ?? "pdw",
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          embed: detected?.payload,
          source_url: detected?.canonicalUrl ?? url,
          status,
          scheduled_at: status === "scheduled" ? scheduleAt : null,
          pinned,
        };
      }
      const r = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        resetForm();
        refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Eliminar este post?")) return;
    const r = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (r.ok) setPosts(posts.filter(p => p.id !== id));
  }

  async function togglePin(p: Post) {
    const r = await fetch(`/api/admin/posts/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pinned: !p.pinned }),
    });
    if (r.ok) refresh();
  }

  return (
    <div className="admin-feed-layout">
      {/* Left: posts list */}
      <section className="admin-card">
        <header className="admin-card__head">
          <h2>Posts</h2>
          <span className="admin-pill">{posts.length}</span>
        </header>
        <ul className="admin-posts-list">
          {posts.map(p => {
            const meta = PROVIDER_META[p.type];
            return (
              <li key={p.id} className="admin-posts-list__row">
                <div className="admin-posts-list__icon" style={{ background: `color-mix(in srgb, ${meta.color} 12%, transparent)`, color: meta.color }}>
                  {meta.label[0]}
                </div>
                <div className="admin-posts-list__main">
                  <strong>{p.title}{p.pinned && " 📌"}</strong>
                  <small>{meta.label} · {p.status} · {p.published_at?.slice(0, 10) ?? p.created_at.slice(0, 10)}</small>
                </div>
                <div className="admin-posts-list__stats">
                  <span>♥ {p.likes_count}</span>
                  <span>💬 {p.comments_count}</span>
                </div>
                <div className="admin-posts-list__actions">
                  <button onClick={() => togglePin(p)} aria-label="Fixar/desafixar">📌</button>
                  <button onClick={() => remove(p.id)} aria-label="Eliminar">🗑</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Right: compose */}
      <aside className="admin-compose">
        <div className="admin-card">
          <header className="admin-card__head"><h2>Compor novo post</h2></header>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {(["link", "evento"] as ComposeMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); resetForm(); }}
                className={`admin-btn ${mode === m ? "admin-btn--primary" : "admin-btn--ghost"}`}
                style={{ flex: 1, fontSize: 13 }}
              >
                {m === "link" ? "Link externo" : "Evento / Webinar"}
              </button>
            ))}
          </div>

          {mode === "link" ? (
            <>
              <label className="admin-field">
                <span>Colar URL (YouTube · Spotify · LinkedIn · Instagram · X)</span>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className={detected ? "is-detected" : ""}
                  style={detected ? { borderColor: PROVIDER_META[detected.provider]?.color } : {}}
                />
                {detected && (
                  <div className="admin-detect" style={{ background: PROVIDER_META[detected.provider]?.color }}>
                    {PROVIDER_META[detected.provider]?.label} detectado
                  </div>
                )}
              </label>
            </>
          ) : (
            <>
              {eventos && eventos.length > 0 && (
                <label className="admin-field">
                  <span>Vincular a Evento Existente (Opcional)</span>
                  <select
                    value={associatedEventoId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleSelectEvento(val ? Number(val) : 0);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      font: "inherit",
                      fontSize: 13,
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                      marginBottom: 12,
                    }}
                  >
                    <option value="">-- Selecione um evento cadastrado --</option>
                    {eventos.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.titulo} ({ev.data_inicio.slice(0, 10)})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="admin-field">
                <span>URL da página do evento</span>
                <input
                  type="text"
                  value={eventoUrl}
                  onChange={(e) => setEventoUrl(e.target.value)}
                  placeholder="/pt/eventos/webinar-pdw"
                />
              </label>
              <label className="admin-field">
                <span>Data e hora do evento</span>
                <input
                  type="datetime-local"
                  value={eventoDate}
                  onChange={(e) => setEventoDate(e.target.value)}
                />
              </label>
            </>
          )}

          <label className="admin-field">
            <span>Título</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título visível no feed" />
          </label>

          <label className="admin-field">
            <span>Excerto / legenda</span>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          </label>

          <label className="admin-field admin-field--inline">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            <span>Fixar no topo</span>
          </label>

          <label className="admin-field">
            <span>Agendar (opcional)</span>
            <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
          </label>

          <div className="admin-actions">
            <button onClick={() => submit("published")} disabled={saving} className="admin-btn admin-btn--primary">
              {saving ? "A publicar…" : "Publicar agora"}
            </button>
            {scheduleAt && (
              <button onClick={() => submit("scheduled")} disabled={saving} className="admin-btn">
                Agendar
              </button>
            )}
            <button onClick={() => submit("draft")} disabled={saving} className="admin-btn admin-btn--ghost">
              Rascunho
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
