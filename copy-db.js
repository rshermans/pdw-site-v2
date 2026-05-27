// copy-db.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'data', 'test.db');
const dest = path.join(__dirname, 'data', 'pdw.db');

console.log(`Copiando base de dados:\nOrigem:  ${src}\nDestino: ${dest}\n`);

try {
  if (!fs.existsSync(src)) {
    console.error("❌ Erro: O ficheiro de origem 'data/test.db' não existe!");
    process.exit(1);
  }
  
  // Criar backup do destino caso exista
  if (fs.existsSync(dest)) {
    const backupPath = dest + '.bak';
    fs.copyFileSync(dest, backupPath);
    console.log(`✓ Backup de segurança de 'pdw.db' criado em: ${backupPath}`);
  }
  
  // Copiar ficheiro
  fs.copyFileSync(src, dest);
  
  // Remover os ficheiros WAL temporários do sqlite se existirem para evitar conflitos de cache
  const walFile = dest + '-wal';
  const shmFile = dest + '-shm';
  if (fs.existsSync(walFile)) {
    fs.unlinkSync(walFile);
    console.log(`✓ Ficheiro WAL temporário limpo.`);
  }
  if (fs.existsSync(shmFile)) {
    fs.unlinkSync(shmFile);
    console.log(`✓ Ficheiro SHM temporário limpo.`);
  }
  
  console.log("\n🚀 Sucesso! O conteúdo de 'test.db' foi copiado para 'pdw.db'.");
} catch (e) {
  console.error("❌ Erro ao copiar a base de dados:", e.message);
}
