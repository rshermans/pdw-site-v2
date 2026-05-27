"use client";

import { useState } from "react";
import Image from "next/image";
import type { Post, PostType } from "@/lib/posts-db";
import type { Locale } from "@/i18n/config";

// ── Provider metadata ──────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  youtube:   "#FF0033",
  spotify:   "#1DB954",
  linkedin:  "#0A66C2",
  instagram: "#E1306C",
  x:         "#000000",
  pdw:       "#006c4b",
  evento:    "#1a3b5d",
  imagem:    "#3d4a42",
};

const TYPE_LABELS: Record<string, string> = {
  youtube:   "YouTube",
  spotify:   "Podcast",
  linkedin:  "LinkedIn",
  instagram: "Instagram",
  x:         "X",
  pdw:       "PDW",
  evento:    "Evento",
  imagem:    "Imagem",
};

// Bento size per type
function getCardSize(type: PostType): "wide" | "tall" | "normal" {
  if (type === "youtube" || type === "x") return "wide";
  if (type === "evento") return "tall";
  return "normal";
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const YT_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z"/>
  </svg>
);
const LI_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.78 1.78 0 0 1 6.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
  </svg>
);
const IG_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const POD_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <path d="M12 19v4"/><path d="M8 23h8"/>
  </svg>
);
const PRESS_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z"/>
    <path d="M18 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2"/>
    <path d="M8 8h6M8 12h6M8 16h4"/>
  </svg>
);
const X_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M4 4l16 16M20 4L4 20"/>
  </svg>
);
const CAL_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M3 9h18M8 3v4M16 3v4"/>
  </svg>
);
const IMG_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);
const STAR_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>
  </svg>
);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  youtube:   YT_ICON,
  spotify:   POD_ICON,
  linkedin:  LI_ICON,
  instagram: IG_ICON,
  x:         X_ICON,
  pdw:       STAR_ICON,
  evento:    CAL_ICON,
  imagem:    IMG_ICON,
};

// ── Heart / Chat / Share icons ─────────────────────────────────────────────────
const HEART_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CHAT_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SHARE_ICON = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49"/>
  </svg>
);
const PIN_ICON = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 2l-2 7H4l5 4-2 7 5-4 5 4-2-7 5-4h-6z"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null, lang: Locale): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Card header badge ──────────────────────────────────────────────────────────
function CardHeader({ post, lang }: { post: Post; lang: Locale }) {
  const color = TYPE_COLORS[post.type] ?? "#3d4a42";
  const label = TYPE_LABELS[post.type] ?? post.type;
  const icon  = TYPE_ICONS[post.type] ?? PRESS_ICON;
  const date  = fmtDate(post.published_at ?? post.created_at, lang);
  return (
    <div className="atual-card-header">
      <div className="atual-card-badge" style={{ "--badge-color": color } as React.CSSProperties}>
        {icon} {label}
      </div>
      {post.pinned && (
        <div className="atual-card-pinned">
          {PIN_ICON} {lang === "pt" ? "Fixado" : "Pinned"}
        </div>
      )}
      <time className="atual-date" dateTime={post.published_at ?? post.created_at ?? ""} style={{ marginLeft: "auto" }}>
        {date}
      </time>
    </div>
  );
}

// ── LikeBar ────────────────────────────────────────────────────────────────────
function LikeBar({
  liked, likeCount, onLike, commentsCount, lang,
}: {
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  commentsCount: number;
  lang: Locale;
}) {
  return (
    <div className="atual-engagement">
      <button
        onClick={onLike}
        aria-pressed={liked}
        className={"atual-eng-btn" + (liked ? " is-liked" : "")}
        aria-label={lang === "pt" ? "Gostei" : "Like"}
      >
        {HEART_ICON}
        <span>{likeCount}</span>
      </button>
      <button className="atual-eng-btn" aria-label={lang === "pt" ? "Comentários" : "Comments"}>
        {CHAT_ICON}
        <span>{commentsCount}</span>
      </button>
      <button className="atual-eng-btn" style={{ marginLeft: "auto" }} aria-label={lang === "pt" ? "Partilhar" : "Share"}>
        {SHARE_ICON}
      </button>
    </div>
  );
}

// ── Main PostCard ──────────────────────────────────────────────────────────────
export function PostCard({ post, lang, compact = false }: { post: Post; lang: Locale; compact?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const e = post.embed ?? {} as Record<string, string>;
  const size = getCardSize(post.type);
  const sizeClass = size === "wide" ? " atual-card--wide" : size === "tall" ? " atual-card--tall" : "";

  async function onLike() {
    setLiked(!liked);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
    try {
      const r = await fetch("/api/public/likes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });
      const data = await r.json();
      setLiked(data.liked);
      setLikeCount(data.total);
    } catch { /* optimistic UI applied */ }
  }

  const engagement = (
    <LikeBar
      liked={liked}
      likeCount={likeCount}
      onLike={onLike}
      commentsCount={post.comments_count}
      lang={lang}
    />
  );

  // ── Compact / list layout ──────────────────────────────────────────────────
  if (compact) {
    return (
      <article className="atual-card atual-card-compact">
        <div className="atual-card-compact-media">
          <CompactMedia post={post} e={e} />
        </div>
        <div className="atual-card-compact-info">
          <CardHeader post={post} lang={lang} />
          <h3 className="atual-title" style={{ fontSize: 14 }}>{post.title}</h3>
          {post.excerpt && <p className="atual-desc" style={{ fontSize: 12, marginTop: 4 }}>{post.excerpt}</p>}
          {engagement}
        </div>
      </article>
    );
  }

  // ── YouTube ─────────────────────────────────────────────────────────────────
  if (post.type === "youtube") {
    return (
      <article className={"atual-card atual-card-youtube" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <div className="atual-embed">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${e.videoId}`}
            title={post.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
          {post.excerpt && <p className="atual-desc">{post.excerpt}</p>}
        </div>
        {engagement}
      </article>
    );
  }

  // ── Spotify ──────────────────────────────────────────────────────────────────
  if (post.type === "spotify") {
    return (
      <article className={"atual-card atual-card-podcast" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <div className="atual-podcast-player">
          <div className="atual-podcast-art" aria-hidden="true">{POD_ICON}</div>
          <div className="atual-podcast-info">
            <div className="atual-podcast-source">{post.excerpt?.slice(0, 40) ?? "Podcast"}</div>
            <div className="atual-podcast-title">{post.title}</div>
          </div>
          <a
            href={post.source_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="atual-podcast-play"
            aria-label="Abrir podcast"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </a>
        </div>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
        </div>
        {engagement}
      </article>
    );
  }

  // ── LinkedIn ─────────────────────────────────────────────────────────────────
  if (post.type === "linkedin") {
    return (
      <article className={"atual-card atual-card-linkedin" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <a className="atual-social-link" href={post.source_url ?? "#"} target="_blank" rel="noopener noreferrer">
          <div className="atual-social-header">
            <span className="atual-social-platform">{LI_ICON} LinkedIn</span>
            <span className="atual-social-handle">{e.author ?? "TecMinho"}</span>
          </div>
          <div className="atual-social-body">
            {post.excerpt && <p>{post.excerpt}</p>}
            <span className="atual-social-cta">
              {lang === "pt" ? "Ler publicação no LinkedIn →" : "Read post on LinkedIn →"}
            </span>
          </div>
        </a>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
        </div>
        {engagement}
      </article>
    );
  }

  // ── Instagram ─────────────────────────────────────────────────────────────────
  if (post.type === "instagram") {
    return (
      <article className={"atual-card atual-card-instagram" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <a className="atual-social-link" href={post.source_url ?? "#"} target="_blank" rel="noopener noreferrer">
          <div className="atual-social-header">
            <span className="atual-social-platform">{IG_ICON} Instagram</span>
            <span className="atual-social-handle">{e.author ? `@${e.author}` : "@tecminho"}</span>
          </div>
          <div className="atual-social-body">
            {post.excerpt && <p>{post.excerpt}</p>}
            <span className="atual-social-cta">
              {lang === "pt" ? "Ver no Instagram →" : "View on Instagram →"}
            </span>
          </div>
        </a>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
        </div>
        {engagement}
      </article>
    );
  }

  // ── X (Twitter) ───────────────────────────────────────────────────────────────
  if (post.type === "x") {
    return (
      <article className={"atual-card atual-card-x" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <div className="atual-x-body" style={{ padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {X_ICON}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{e.author ?? "@PDW_PT"}</div>
            </div>
          </div>
          {post.excerpt && (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--color-text)" }}>
              {post.excerpt}
            </p>
          )}
          {post.source_url && (
            <a href={post.source_url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#0A66C2", fontWeight: 600 }}>
              {lang === "pt" ? "Ver no X →" : "View on X →"}
            </a>
          )}
        </div>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
        </div>
        {engagement}
      </article>
    );
  }

  // ── Imagem ────────────────────────────────────────────────────────────────────
  if (post.type === "imagem" && e.src) {
    return (
      <article className={"atual-card atual-card-press" + sizeClass}>
        <CardHeader post={post} lang={lang} />
        <div className="atual-press-image">
          <Image src={e.src} alt={e.alt ?? post.title} width={800} height={450}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="atual-card-body">
          <h3 className="atual-title">{post.title}</h3>
          {post.excerpt && <p className="atual-desc">{post.excerpt}</p>}
        </div>
        {engagement}
      </article>
    );
  }

  // ── Press / PDW / Evento / fallback ──────────────────────────────────────────
  return (
    <article className={"atual-card atual-card-press" + sizeClass}>
      <CardHeader post={post} lang={lang} />
      {post.source_url && e.image && (
        <div className="atual-press-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.image} alt={post.title} />
        </div>
      )}
      <div className="atual-card-body">
        <h3 className="atual-title">{post.title}</h3>
        {post.excerpt && <p className="atual-desc">{post.excerpt}</p>}
        {post.source_url && (
          <div className="atual-source">
            {new URL(post.source_url).hostname.replace("www.", "")}
          </div>
        )}
      </div>
      {engagement}
    </article>
  );
}

// ── Compact media thumbnails ───────────────────────────────────────────────────
function CompactMedia({ post, e }: { post: Post; e: Record<string, string> }) {
  const color = TYPE_COLORS[post.type] ?? "#3d4a42";
  const icon  = TYPE_ICONS[post.type] ?? PRESS_ICON;

  if (post.type === "youtube" && e.videoId) {
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>
    );
  }
  if (post.type === "imagem" && e.src) {
    return (
      <Image src={e.src} alt={post.title} width={200} height={120}
        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 10 }} />
    );
  }
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", background: `${color}10`, borderRadius: 10, border: `1px dashed ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
      {icon}
    </div>
  );
}
