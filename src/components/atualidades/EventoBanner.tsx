"use client";

import { useState, useEffect } from "react";
import type { BannerEventoData } from "@/lib/eventos-db";
import type { Locale } from "@/i18n/config";

interface Props {
  evento: BannerEventoData;
  lang: Locale;
}

function fmtDataBanner(iso: string, lang: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB", {
      day: "2-digit", month: "long", year: "numeric",
    }) + " · " + new Date(iso).toLocaleTimeString(lang === "pt" ? "pt-PT" : "en-GB", {
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function EventoBanner({ evento, lang }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dismissKey = `pdw-banner-dismissed-${evento.slug}`;

  useEffect(() => {
    setMounted(true);
    const dismissed = sessionStorage.getItem(dismissKey);
    if (!dismissed) setVisible(true);
  }, [dismissKey]);

  function dismiss() {
    sessionStorage.setItem(dismissKey, "1");
    setVisible(false);
  }

  if (!mounted || !visible) return null;

  const ctaHref = evento.banner_cta_link ?? `/${lang}/eventos/${evento.slug}`;
  const ctaLabel = evento.banner_cta_texto ?? (lang === "pt" ? "Inscrever" : "Register");
  const dataStr = fmtDataBanner(evento.data_inicio, lang);
  const displayTitle = (lang === "en" && evento.slug === "webinar-pdw")
    ? "Webinar — From Blockchain to Wallet: Digital Trust in Practice (updated)"
    : evento.titulo;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 998,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.3s ease",
        }}
      />
      <div
        role="dialog"
        aria-label={lang === "pt" ? "Anúncio de evento" : "Event announcement"}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 999,
          width: 320,
          background: "var(--color-bg)",
          border: "1px solid rgba(212,175,55,0.4)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.15)",
          overflow: "hidden",
          animation: "slideUpFade 0.35s ease",
        }}
      >
        {/* Golden thread top border */}
      <div aria-hidden="true" style={{
        height: 3,
        background: "linear-gradient(90deg, transparent 0%, #d4af37 30%, #f5d060 60%, transparent 100%)",
      }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#d4af37",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            {lang === "pt" ? "Próximo webinar" : "Upcoming webinar"}
          </span>
          <button
            onClick={dismiss}
            aria-label={lang === "pt" ? "Fechar" : "Close"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-muted)",
              fontSize: 16,
              lineHeight: 1,
              padding: "0 2px",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        {/* Title */}
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.4 }}>
          {displayTitle}
        </p>

        {/* Date + platform */}
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-muted)", lineHeight: 1.4 }}>
          {dataStr}
          {evento.plataforma && ` · ${evento.plataforma}`}
        </p>

        {/* CTA */}
        <a
          href={ctaHref}
          style={{
            display: "block",
            textAlign: "center",
            background: "linear-gradient(135deg, #d4af37, #f5d060)",
            color: "#1a1200",
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 8,
            padding: "10px 16px",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          {ctaLabel} →
        </a>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
    </>
  );
}
