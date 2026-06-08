// pdw-site-v2/src/app/[lang]/admin/page.tsx
// SUBSTITUI o ficheiro existente. Dashboard com tabs:
//   · Feed (atualidades)
//   · Vídeos
//   · Logos
// O changelog antigo passa para um card colapsado.

import type { Metadata } from "next";
import { listPosts } from "@/lib/posts-db";
import { listEventos } from "@/lib/eventos-db";
import { PostsManager } from "@/components/admin/PostsManager";
import { EventosManager } from "@/components/admin/EventosManager";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { SectionsManager } from "@/components/admin/SectionsManager";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { AdminChangelog } from "@/components/admin/AdminChangelog";
import { InscricoesManager } from "@/components/admin/InscricoesManager";

export const metadata: Metadata = {
  title: "Administração | PDW",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "feed" } = await searchParams;
  const initialPosts   = listPosts({ status: "all", limit: 50 });
  const initialEventos = listEventos();

  return (
    <>
      <header className="page-hero">
        <span className="page-hero-eyebrow">Painel interno</span>
        <h1 className="page-hero-title">Administração · Conteúdo</h1>
        <p className="page-hero-lead">
          Gere o feed de atualidades, vídeos e logos do site. Mudanças aplicadas em
          produção sem deploy.
        </p>
      </header>

      <AdminTabs active={tab} />

      {tab === "feed"       && <PostsManager initialPosts={initialPosts} eventos={initialEventos} />}
      {tab === "eventos"    && <EventosManager initialEventos={initialEventos} />}
      {tab === "inscricoes" && <InscricoesManager />}
      {tab === "videos"   && <MediaLibrary kind="video" title="Biblioteca de vídeos" slotOptions={["homepage-demo"]} />}
      {tab === "sections" && <SectionsManager />}
      {tab === "logos"    && (
        <MediaLibrary
          kind="logo"
          title="Logos de parceiros e financiadores"
          slotOptions={["header", "footer-partners", "trustbar", "funders"]}
        />
      )}
      {tab === "contactos" && <LeadsManager />}
      {tab === "changelog" && <AdminChangelog />}
      {tab === "stats" && (
        <div className="admin-card admin-stats-placeholder">
          <div className="admin-card__head"><h2>Estatísticas</h2></div>
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--color-muted)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 16px", display: "block", opacity: 0.4 }}>
              <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>
            </svg>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              Métricas por post (vistas, likes, tempo no feed) — disponível na fase 2.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
