import Link from "next/link";
import { Locale } from "@/i18n/config";

interface ContactCTAProps {
  lang: Locale;
  dict: any;
}

export function ContactCTA({ lang, dict }: ContactCTAProps) {
  return (
    <section
      className="diploma-case-section"
      aria-labelledby="contact-cta-title"
      style={{
        marginTop: 16,
        background: "linear-gradient(135deg, #006c4b 0%, #1a3b5d 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 32,
        alignItems: "center",
        border: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block",
          fontSize: 12, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.14em",
          color: "#cbd5e1",
          marginBottom: 8,
        }}>
          Próximo passo
        </span>
        <h2 id="contact-cta-title" style={{ margin: "0 0 8px", color: "#fff", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 800, lineHeight: 1.2 }}>
          {dict.contactCTA.title}
        </h2>
        <p style={{ margin: 0, color: "#ffffff", fontSize: 15, lineHeight: 1.6, maxWidth: 540 }}>
          {dict.contactCTA.subtitle}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
        <Link
          href={`/${lang}/contactos`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            color: "#006c4b",
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 28px",
            borderRadius: 999,
            textDecoration: "none",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s",
          }}
        >
          {dict.contactCTA.button} →
        </Link>
      </div>
    </section>
  );
}
