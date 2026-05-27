"use client";

import { useState, useEffect, useRef } from "react";

type Theme    = "light" | "dark";
type Contrast = "normal" | "high";
type IconName = "accessibility" | "moon" | "sun" | "contrast" | "close" | "check";

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  accessibility: (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 7v8" />
      <path d="M5 10l7-1.5 7 1.5" />
      <path d="M9 16l-2 5" />
      <path d="M15 16l2 5" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="18.36" x2="5.64" y2="16.92" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </>
  ),
  contrast: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
};

function AccIcon({ name, size = 16, color = "currentColor" }: { name: IconName; size?: number; color?: string }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

const FONT_STEPS = [80, 90, 100, 110, 120, 130, 140];

const TRANSLATIONS = {
  pt: {
    title: "Acessibilidade",
    viewMode: "Modo de visualização",
    light: "Claro",
    dark: "Escuro",
    contrast: "Contraste",
    normal: "Normal",
    highContrast: "Alto contraste",
    fontSize: "Tamanho da fonte",
    reset: "Repor predefinições",
    openWidget: "Abrir opções de acessibilidade",
    closeWidget: "Fechar opções de acessibilidade"
  },
  en: {
    title: "Accessibility",
    viewMode: "View Mode",
    light: "Light",
    dark: "Dark",
    contrast: "Contrast",
    normal: "Normal",
    highContrast: "High Contrast",
    fontSize: "Font Size",
    reset: "Reset Defaults",
    openWidget: "Open accessibility options",
    closeWidget: "Close accessibility options"
  }
};

export function AccessibilityWidget({ lang = "pt" }: { lang?: string }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [theme, setTheme]       = useState<Theme>("light");
  const [contrast, setContrast] = useState<Contrast>("normal");
  const [fontSize, setFontSize] = useState(100);
  const panelRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang as "pt" | "en"] || TRANSLATIONS.pt;

  // Init from localStorage / system preference
  useEffect(() => {
    const saved      = localStorage.getItem("pdw-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial    = saved ?? (prefersDark ? "dark" : "light");
    applyTheme(initial);

    const savedContrast = (localStorage.getItem("pdw-contrast") as Contrast) ?? "normal";
    applyContrast(savedContrast);

    const savedFont = parseInt(localStorage.getItem("pdw-font-size") ?? "100", 10);
    applyFontSize(savedFont);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen]);

  // Escape key and Focus Trap
  useEffect(() => {
    if (!isOpen) return;
    
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      
      if (e.key === "Tab") {
        const panelEl = panelRef.current;
        if (!panelEl) return;
        
        const focusableElements = Array.from(
          panelEl.querySelectorAll("button, input, select, textarea, [tabindex='0']")
        ) as HTMLElement[];
        
        if (focusableElements.length === 0) return;
        
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function applyTheme(val: Theme) {
    setTheme(val);
    document.documentElement.setAttribute("data-theme", val);
    localStorage.setItem("pdw-theme", val);
  }

  function applyContrast(val: Contrast) {
    setContrast(val);
    document.documentElement.setAttribute("data-contrast", val);
    localStorage.setItem("pdw-contrast", val);
  }

  function applyFontSize(val: number) {
    setFontSize(val);
    document.documentElement.style.fontSize = val + "%";
    localStorage.setItem("pdw-font-size", String(val));
  }

  function resetAll() {
    applyTheme("light");
    applyContrast("normal");
    applyFontSize(100);
  }

  const hasChanges = theme !== "light" || contrast !== "normal" || fontSize !== 100;

  const S = {
    root: {
      position: "fixed" as const,
      bottom: 24, right: 24, zIndex: 1000,
      fontFamily: '"Public Sans", system-ui, sans-serif',
    },
    panel: {
      position: "absolute" as const,
      bottom: 64, right: 0,
      width: 284,
      background: "var(--color-surface, #fff)",
      border: "1px solid var(--color-border, #d1d9e0)",
      borderRadius: 16,
      boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)",
      overflow: "hidden" as const,
      animation: "accSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)",
    },
    panelHead: {
      padding: "13px 16px 11px",
      borderBottom: "1px solid var(--color-border, #d1d9e0)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    headLeft: { display: "flex", alignItems: "center", gap: 8 },
    headIcon: {
      width: 28, height: 28, borderRadius: 8,
      background: "var(--color-primary, #006c4b)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    headTitle: { fontSize: 14, fontWeight: 700, color: "var(--color-text, #181c1e)" },
    closeBtn: {
      background: "none", border: 0, cursor: "pointer",
      color: "var(--color-muted, #3d4a42)",
      padding: 4, borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    body: {
      padding: "12px 16px 16px",
      display: "flex", flexDirection: "column" as const, gap: 16,
    },
    sectionLabel: {
      fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
      letterSpacing: "0.08em", color: "var(--color-muted, #3d4a42)",
      marginBottom: 8,
    },
    btnRow: { display: "flex", gap: 6 },
    resetBtn: {
      padding: "8px 12px", borderRadius: 8,
      border: "1px solid var(--color-border, #d1d9e0)",
      background: "transparent",
      color: "var(--color-muted, #3d4a42)",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      width: "100%",
    },
    fab: (open: boolean): React.CSSProperties => ({
      width: 52, height: 52, borderRadius: "50%",
      background: open ? "var(--color-text, #181c1e)" : "var(--color-primary, #006c4b)",
      color: "#fff", border: "none", cursor: "pointer",
      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
      position: "relative" as const,
    }),
    dot: {
      position: "absolute" as const, top: -2, right: -2,
      width: 14, height: 14, borderRadius: "50%",
      background: "#f59e0b",
      border: "2px solid var(--color-bg, #f7fafc)",
      boxShadow: "0 2px 6px rgba(245,158,11,0.5)",
    },
  };

  function themeBtn(opt: { value: Theme; label: string; icon: IconName }): React.CSSProperties {
    const active = theme === opt.value;
    return {
      flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer",
      border: active ? "2px solid var(--color-primary,#006c4b)" : "1px solid var(--color-border,#d1d9e0)",
      background: active ? (opt.value === "dark" ? "#0E1E2E" : "#fff") : "var(--color-bg,#f7fafc)",
      color: active ? (opt.value === "dark" ? "#E8F4F0" : "var(--color-primary,#006c4b)") : "var(--color-muted,#3d4a42)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      fontFamily: "inherit", fontSize: 12, fontWeight: active ? 700 : 500,
      transition: "all 0.2s ease",
    };
  }

  function contrastBtn(opt: { value: Contrast; label: string }): React.CSSProperties {
    const active = contrast === opt.value;
    return {
      flex: 1, padding: "9px 10px", borderRadius: 10, cursor: "pointer",
      border: active ? "2px solid var(--color-primary,#006c4b)" : "1px solid var(--color-border,#d1d9e0)",
      background: active ? (opt.value === "high" ? "#000" : "var(--color-surface,#fff)") : "var(--color-bg,#f7fafc)",
      color: active ? (opt.value === "high" ? "#fff" : "var(--color-primary,#006c4b)") : "var(--color-muted,#3d4a42)",
      fontFamily: "inherit", fontSize: 12, fontWeight: active ? 700 : 500,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      transition: "all 0.2s ease",
    };
  }

  function fontStepBtn(disabled: boolean): React.CSSProperties {
    return {
      width: 36, height: 36, borderRadius: 8,
      border: "1px solid var(--color-border,#d1d9e0)",
      background: "var(--color-bg,#f7fafc)",
      color: "var(--color-text,#181c1e)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "inherit", transition: "all 0.15s",
    };
  }

  const trackFill = `${((fontSize - 80) / 60) * 100}%`;

  return (
    <div style={S.root} ref={panelRef}>
      {isOpen && (
        <div style={S.panel} role="dialog" aria-label={t.title} aria-modal="true">
          {/* Cabeçalho */}
          <div style={S.panelHead}>
            <div style={S.headLeft}>
              <div style={S.headIcon}>
                <AccIcon name="accessibility" size={16} color="#fff" />
              </div>
              <span style={S.headTitle}>{t.title}</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={S.closeBtn} aria-label={t.closeWidget}>
              <AccIcon name="close" size={16} />
            </button>
          </div>

          <div style={S.body}>
            {/* 1. Modo claro / escuro */}
            <div>
              <div style={S.sectionLabel}>{t.viewMode}</div>
              <div style={S.btnRow}>
                {([
                  { value: "light" as Theme, label: t.light, icon: "sun"  as IconName },
                  { value: "dark"  as Theme, label: t.dark,  icon: "moon" as IconName },
                ]).map(opt => (
                  <button key={opt.value} onClick={() => applyTheme(opt.value)} style={themeBtn(opt)}
                    aria-pressed={theme === opt.value}>
                    <AccIcon name={opt.icon} size={18} color={
                      theme === opt.value
                        ? (opt.value === "dark" ? "#22A66B" : "var(--color-primary,#006c4b)")
                        : "var(--color-muted,#3d4a42)"
                    } />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Contraste */}
            <div>
              <div style={S.sectionLabel}>{t.contrast}</div>
              <div style={S.btnRow}>
                {([
                  { value: "normal" as Contrast, label: t.normal },
                  { value: "high"   as Contrast, label: t.highContrast },
                ]).map(opt => (
                  <button key={opt.value} onClick={() => applyContrast(opt.value)} style={contrastBtn(opt)}
                    aria-pressed={contrast === opt.value}>
                    {contrast === opt.value && (
                      <AccIcon name="check" size={13} color={opt.value === "high" ? "#fff" : "var(--color-primary,#006c4b)"} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tamanho da fonte */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={S.sectionLabel}>{t.fontSize}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: fontSize !== 100 ? "var(--color-primary,#006c4b)" : "var(--color-muted,#3d4a42)",
                  padding: "2px 8px", borderRadius: 6,
                  background: fontSize !== 100 ? "rgba(0,108,75,0.08)" : "transparent",
                }}>{fontSize}%</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {/* Diminuir */}
                <button
                  onClick={() => applyFontSize(Math.max(80, fontSize - 10))}
                  disabled={fontSize <= 80}
                  style={fontStepBtn(fontSize <= 80)}
                  aria-label={`${t.fontSize} -`}
                >
                  <span style={{ fontSize: 11, fontWeight: 800 }}>A</span>
                </button>

                {/* Slider */}
                <div style={{ flex: 1, position: "relative", height: 6, background: "var(--color-border,#d1d9e0)", borderRadius: 3 }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: trackFill,
                    background: "var(--color-primary,#006c4b)",
                    borderRadius: 3, transition: "width 0.15s",
                  }} />
                  <input
                    type="range" min={80} max={140} step={10}
                    value={fontSize}
                    onChange={(e) => applyFontSize(Number(e.target.value))}
                    aria-label={t.fontSize}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", margin: 0 }}
                  />
                  {/* Marcas */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", padding: "0 1px", pointerEvents: "none" }}>
                    {FONT_STEPS.map(v => (
                      <div key={v} style={{
                        width: 2, height: v === 100 ? 10 : 6, borderRadius: 1,
                        background: v <= fontSize ? "rgba(0,108,75,0.4)" : "rgba(0,0,0,0.15)",
                        marginTop: v === 100 ? -2 : 0,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Aumentar */}
                <button
                  onClick={() => applyFontSize(Math.min(140, fontSize + 10))}
                  disabled={fontSize >= 140}
                  style={fontStepBtn(fontSize >= 140)}
                  aria-label={`${t.fontSize} +`}
                >
                  <span style={{ fontSize: 18, fontWeight: 800 }}>A</span>
                </button>
              </div>
            </div>

            {/* Repor */}
            {hasChanges && (
              <button onClick={resetAll} style={S.resetBtn}>
                {t.reset}
              </button>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t.closeWidget : t.openWidget}
        aria-expanded={isOpen}
        style={S.fab(isOpen)}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {isOpen
          ? <AccIcon name="close" size={22} color="#fff" />
          : <AccIcon name="accessibility" size={22} color="#fff" />
        }
        {hasChanges && !isOpen && (
          <div style={S.dot} aria-hidden="true" />
        )}
      </button>

      <style>{`
        @keyframes accSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
