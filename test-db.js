// test-db.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'pdw.db');
console.log("A ler base de dados de:", dbPath);

try {
  const db = new Database(dbPath);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("\nTabelas encontradas:", tables.map(t => t.name).join(", "));
  
  for (const table of tables) {
    const count = db.prepare(`SELECT COUNT(*) c FROM ${table.name}`).get().c;
    console.log(`- Tabela '${table.name}': ${count} registos`);
    if (count > 0) {
      const rows = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
      console.log(`  Exemplo (primeiros 3):`, JSON.stringify(rows, null, 2));
    }
  }
  db.close();
} catch (e) {
  console.error("Erro ao ler a base de dados:", e);
}
