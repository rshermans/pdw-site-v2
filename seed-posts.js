// seed-posts.js
// Exportado da BD de produção: data/pdw.db (19/05/2026)
// Uso: node seed-posts.js [--db caminho/para/outra.db]
//
// Por defeito cria: data/test.db  (para não tocar na produção)
// Exemplo:  node seed-posts.js --db data/test.db

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbArg = process.argv.indexOf('--db');
const DB_PATH = dbArg !== -1
  ? path.resolve(process.argv[dbArg + 1])
  : path.join(__dirname, 'data', 'test.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`\n📦 Seed → ${DB_PATH}\n`);

// ── Schema (idempotente) ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    institution TEXT NOT NULL,
    email       TEXT NOT NULL,
    subject     TEXT,
    message     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    type             TEXT NOT NULL CHECK (type IN ('imagem','youtube','spotify','linkedin','instagram','x','evento','pdw')),
    title            TEXT NOT NULL,
    excerpt          TEXT,
    embed_json       TEXT,
    source_url       TEXT,
    status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','archived')),
    scheduled_at     TEXT,
    published_at     TEXT,
    pinned           INTEGER NOT NULL DEFAULT 0,
    likes_count      INTEGER NOT NULL DEFAULT 0,
    comments_enabled INTEGER NOT NULL DEFAULT 0,
    comments_count   INTEGER NOT NULL DEFAULT 0,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    author           TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON posts(status, published_at DESC);
  CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);

  CREATE TABLE IF NOT EXISTS post_likes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    visitor_hash  TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(post_id, visitor_hash)
  );
  CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

  CREATE TABLE IF NOT EXISTS post_comments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name   TEXT NOT NULL,
    author_email  TEXT,
    body          TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','spam')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_post_comments_post_status ON post_comments(post_id, status);

  CREATE TABLE IF NOT EXISTS media (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    kind         TEXT NOT NULL CHECK (kind IN ('video','logo','image')),
    filename     TEXT NOT NULL,
    public_path  TEXT NOT NULL,
    alt          TEXT,
    mime         TEXT,
    size_bytes   INTEGER,
    slot         TEXT,
    uses         INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_media_kind_slot ON media(kind, slot);

  CREATE TABLE IF NOT EXISTS site_sections (
    key          TEXT PRIMARY KEY,
    enabled      INTEGER NOT NULL DEFAULT 1,
    content_json TEXT,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── posts ─────────────────────────────────────────────────────────────────────
const insertPost = db.prepare(`
  INSERT OR IGNORE INTO posts
    (id, type, title, excerpt, embed_json, source_url, status, scheduled_at, published_at,
     pinned, likes_count, comments_enabled, comments_count, created_at, updated_at, author)
  VALUES
    (@id, @type, @title, @excerpt, @embed_json, @source_url, @status, @scheduled_at, @published_at,
     @pinned, @likes_count, @comments_enabled, @comments_count, @created_at, @updated_at, @author)
`);

[
  {
    id: 1,
    type: "linkedin",
    title: "A questão já não é apenas tecnológica.  É institucional.",
    excerpt: "Estamos a desenvolver reflexões, protótipos e investigação sobre o futuro da confiança digital no ecossistema académico e profissional.\n\nEste é apenas o início da conversa.\n\n#DigitalIdentity #SSI #Blockchain #HigherEducation #DigitalTrust #VerifiableCredentials #EUDIWallet #Interoperability",
    embed_json: '{"url":"https://www.linkedin.com/posts/portuguese-digital-wallet-by-tecminho-linkedin-share-7461814521175736320-P1qs","postId":"portuguese-digital-wallet-by-tecminho-linkedin-share-7461814521175736320-P1qs"}',
    source_url: "https://www.linkedin.com/posts/portuguese-digital-wallet-by-tecminho-linkedin-share-7461814521175736320-P1qs",
    status: "published",
    scheduled_at: null,
    published_at: "2026-05-18T10:37:35.229Z",
    pinned: 0,
    likes_count: 0,
    comments_enabled: 0,
    comments_count: 0,
    created_at: "2026-05-18T10:37:35.229Z",
    updated_at: "2026-05-18T10:37:35.229Z",
    author: null,
  },
  {
    id: 2,
    type: "instagram",
    title: "A confiança digital está a mudar.",
    excerpt: "Este é o início dessa transformação.\n\n🚀 Bem-vindos à nova geração da confiança digital.\n\n#Blockchain\n#Web3\n#DigitalWallet\n#EducaçãoDigital\n#IdentidadeDigital\n#Inovação\n#Portugal\n#Universidade\n#FutureOfEducation\n#TecMinho",
    embed_json: '{"postId":"DYemm7BS3W_"}',
    source_url: "https://www.instagram.com/p/DYemm7BS3W_/",
    status: "published",
    scheduled_at: null,
    published_at: "2026-05-18T11:24:24.443Z",
    pinned: 0,
    likes_count: 0,
    comments_enabled: 0,
    comments_count: 0,
    created_at: "2026-05-18T11:24:24.443Z",
    updated_at: "2026-05-18T11:24:24.443Z",
    author: null,
  },
  {
    id: 3,
    type: "pdw",
    title: "🚀 Bem-vindo à comunidade oficial do PWD",
    excerpt: "Um espaço para explorar o futuro da identidade digital, blockchain e Web3 em Portugal 🇵🇹\n\n🔐 Confiança – Dados sob o teu controlo\n💡 Inovação – Tecnologia ao serviço das pessoas\n🌐 Descentralização – Sem intermediários, mais autonomia\n🤝 Comunidade – Construção coletiva do futuro digital",
    embed_json: null,
    source_url: "https://chat.whatsapp.com/JyjCwcWsNNe5w4oP4QEvZW",
    status: "published",
    scheduled_at: null,
    published_at: "2026-05-18T11:25:11.852Z",
    pinned: 0,
    likes_count: 0,
    comments_enabled: 0,
    comments_count: 0,
    created_at: "2026-05-18T11:25:11.852Z",
    updated_at: "2026-05-18T11:25:11.852Z",
    author: null,
  },
].forEach(r => insertPost.run(r));

console.log('  ✓ posts (3)');

// ── media ─────────────────────────────────────────────────────────────────────
db.prepare(`
  INSERT OR IGNORE INTO media (id, kind, filename, public_path, alt, mime, size_bytes, slot, uses, created_at)
  VALUES (@id, @kind, @filename, @public_path, @alt, @mime, @size_bytes, @slot, @uses, @created_at)
`).run({
  id: 2,
  kind: "video",
  filename: "youtube-ozqJt4FAkVQ",
  public_path: "https://www.youtube.com/embed/ozqJt4FAkVQ",
  alt: null,
  mime: "video/youtube",
  size_bytes: null,
  slot: "homepage-demo",
  uses: 0,
  created_at: "2026-05-18 15:27:38",
});

console.log('  ✓ media (1)');

// ── site_sections ─────────────────────────────────────────────────────────────
const insertSection = db.prepare(`
  INSERT OR IGNORE INTO site_sections (key, enabled, content_json, updated_at)
  VALUES (@key, @enabled, @content_json, @updated_at)
`);

[
  {
    key: "github",
    enabled: 1,
    content_json: '{"repo_url":"https://github.com/tecminho","repo_name":"tecminho/pdw","description":"Sistema de credenciais verificáveis W3C VC conforme EBSI e eIDAS 2.0. Transparente, auditável e pronto para integrar."}',
    updated_at: "2026-05-18 15:05:27",
  },
  {
    key: "contact-form",
    enabled: 1,
    content_json: null,
    updated_at: "2026-05-18 15:05:27",
  },
].forEach(r => insertSection.run(r));

console.log('  ✓ site_sections (2)');

// ── leads ─────────────────────────────────────────────────────────────────────
const insertLead = db.prepare(`
  INSERT OR IGNORE INTO leads (id, name, institution, email, subject, message, created_at)
  VALUES (@id, @name, @institution, @email, @subject, @message, @created_at)
`);

[
  { id: 1, name: "Romulo Sherman", institution: "TecMinho", email: "rmagalhaes@tecminho.uminho.pt", subject: "Teste", message: "Esta e uma mensagem de teste do formulario PDW.", created_at: "2026-05-14 15:51:01" },
  { id: 2, name: "Domingos", institution: "TECMINHO", email: "dfreitas@tecminho.uminho.pt", subject: "Teste", message: "Teste por parte do Rômulo.", created_at: "2026-05-14 17:01:30" },
  { id: 3, name: "Teste Logos", institution: "TecMinho", email: "rmagalhaes@tecminho.uminho.pt", subject: "Logos no email", message: "Teste para verificar logos nos templates de email.", created_at: "2026-05-14 17:14:49" },
  { id: 4, name: "Rômulo Sherman Magalhães Mota", institution: "TECMINHO", email: "rmagalhaes@tecminho.uminho.pt", subject: "Teste", message: "Como podemos solicitar o contacto", created_at: "2026-05-17 00:22:28" },
].forEach(r => insertLead.run(r));

console.log('  ✓ leads (4)');

// ── sumário ───────────────────────────────────────────────────────────────────
const c = {
  posts: db.prepare(`SELECT COUNT(*) c FROM posts`).get().c,
  media: db.prepare(`SELECT COUNT(*) c FROM media`).get().c,
  sections: db.prepare(`SELECT COUNT(*) c FROM site_sections`).get().c,
  leads: db.prepare(`SELECT COUNT(*) c FROM leads`).get().c,
};
console.log(`\n✅ Concluído: posts=${c.posts}  media=${c.media}  sections=${c.sections}  leads=${c.leads}`);
console.log(`   BD: ${DB_PATH}\n`);

db.close();