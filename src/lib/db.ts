// pdw-site-v2/src/lib/db.ts
// SUBSTITUI o ficheiro existente. Mantém a tabela `leads` e adiciona as novas
// (posts, post_likes, post_comments, media) via migrate síncrono no boot.

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'pdw.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Tabelas existentes ──────────────────────────────────────────────────────
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
`);

// ── Migration tracking table ─────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── Migrate auto no boot (rastreia ficheiros aplicados) ───────────────────────
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');
if (fs.existsSync(MIGRATIONS_DIR)) {
  const applied = new Set(
    (db.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map(r => r.name)
  );
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const f of files) {
    if (!applied.has(f)) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(f);
    }
  }
}

export default db;
