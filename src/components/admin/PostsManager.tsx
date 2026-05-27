// pdw-site-v2/src/components/admin/PostsManager.tsx
// Client component principal do /admin/atualidades.
// Mostra lista de posts à esquerda, compose bar + preview à direita.
"use client";

import { useState, useEffect } from "react";
import type { Post, PostType } from "@/lib/posts-db";

interface Props {
  initialPosts: Post[];
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

export function PostsManager({ initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [url, setUrl] = useState("");
  const [detected, setDetected] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [pinned, setPinned] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function submit(status: "draft" | "published" | "scheduled") {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const body: any = {
        type: detected?.provider ?? "pdw",
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        embed: detected?.payload,
        source_url: detected?.canonicalUrl ?? url,
        status,
        scheduled_at: status === "scheduled" ? scheduleAt : null,
        pinned,
      };
      const r = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setUrl(""); setTitle(""); setExcerpt(""); setPinned(false); setScheduleAt("");
        setDetected(null);
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
