// pdw-site-v2/src/components/admin/AdminTabs.tsx
import Link from "next/link";

const TABS = [
  { id: "feed",        label: "Feed · Atualidades" },
  { id: "eventos",     label: "Eventos" },
  { id: "inscricoes",  label: "Inscrições" },
  { id: "videos",      label: "Vídeos" },
  { id: "logos",       label: "Logos" },
  { id: "sections",    label: "Secções" },
  { id: "contactos",   label: "Contactos" },
  { id: "stats",       label: "Estatísticas" },
  { id: "changelog",   label: "Changelog" },
];

export function AdminTabs({ active }: { active: string }) {
  return (
    <nav className="admin-tabs" aria-label="Áreas de administração">
      {TABS.map(t => (
        <Link
          key={t.id}
          href={`?tab=${t.id}`}
          className={"admin-tab" + (active === t.id ? " is-active" : "")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
