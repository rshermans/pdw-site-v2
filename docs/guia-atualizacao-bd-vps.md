# Guia de Atualização de Código e Migração de Base de Dados na VPS
**Destinado a:** Domingos (Administrador de Sistemas / Infraestrutura)
**Projeto:** PDW Site (Next.js + SQLite via `better-sqlite3` + PM2)

Este documento descreve os procedimentos necessários para atualizar o código da aplicação na VPS e garantir que a base de dados SQLite (`data/pdw.db`) seja migrada e atualizada de forma segura, sem perda de dados ou necessidade de importação ("feed") manual.

---

## 💡 Como Funciona o Sistema de Base de Dados e Migrações

1. **Persistência de Dados**:
   * Toda a informação dinâmica do site (leads, inscrições em webinars, eventos, etc.) está guardada no ficheiro SQLite localizado em `data/pdw.db`.
   * **Atenção**: Esta pasta `data/` está incluída no `.gitignore`. Isto significa que a base de dados de produção **nunca** deve ser sincronizada com bases de dados de teste locais e **não** será sobrescrita por comandos como `git pull`.

2. **Migrações Automáticas (In-Place)**:
   * A aplicação possui um motor de migrações automáticas configurado no ficheiro `src/lib/db.ts`.
   * Sempre que o servidor Next.js inicia (ou reinicia), ele lê todos os ficheiros `.sql` presentes na pasta `migrations/` na raiz do projeto.
   * A aplicação regista as migrações aplicadas numa tabela interna chamada `_migrations`.
   * As migrações que ainda não foram aplicadas são executadas de forma sequencial e incremental (usando comandos como `ALTER TABLE` e `CREATE TABLE IF NOT EXISTS`).
   * **Conclusão**: **Não é necessário recriar a base de dados ou transferir dados manualmente.** A base de dados existente é atualizada diretamente ("in-place") mantendo todos os registos anteriores intactos.

---

## ⚠️ Avisos Críticos de Segurança

* **Nunca substitua a pasta `data/`** da VPS por uma pasta local de desenvolvimento. Se carregar os ficheiros via FTP/SFTP ou Zip, **exclua a pasta `data/`** para evitar apagar as inscrições e os contactos reais.
* **Pare o processo da aplicação no PM2 antes de fazer cópias de segurança**. O SQLite em produção utiliza o modo WAL (Write-Ahead Logging), gerando os ficheiros temporários `pdw.db-wal` e `pdw.db-shm`. Copiar a base de dados com a aplicação ativa pode resultar num backup corrompido.

---

## 🛠️ Procedimento de Atualização Passo a Passo

Siga estes passos exatos na VPS para atualizar o código e aplicar as alterações na estrutura da base de dados de forma segura.

### Passo 1: Ligar à VPS e Parar a Aplicação
Ligue-se via SSH à VPS, aceda à diretoria do projeto e pare temporariamente o serviço no PM2 para libertar os bloqueios de ficheiros da base de dados:

```bash
# Entrar na diretoria do projeto (ajuste o caminho se necessário)
cd /caminho/para/o/projeto/pdw-site-v2

# Parar o processo da aplicação para fechar acessos à BD
pm2 stop pdw-site
```

### Passo 2: Criar Cópia de Segurança (Backup) da BD
Com o serviço parado, crie uma cópia de segurança do ficheiro `pdw.db` numa diretoria externa segura (por exemplo, na pasta home do utilizador):

```bash
# Criar uma pasta para backups se não existir
mkdir -p ~/pdw_db_backups

# Copiar a base de dados com a data e hora atual no nome
cp data/pdw.db ~/pdw_db_backups/pdw_backup_$(date +%F_%H-%M-%S).db

# Confirmar se o backup foi criado
ls -la ~/pdw_db_backups/
```

### Passo 3: Atualizar o Código Fonte
Atualize o código da aplicação a partir do repositório Git ou copiando os novos ficheiros:

* **Se utilizar Git (Recomendado)**:
  ```bash
  git pull origin main
  ```
  *(Como `data/` está no `.gitignore`, os dados reais de produção estarão totalmente protegidos).*

* **Se transferir por FTP/SFTP/Zip**:
  Certifique-se de carregar todos os ficheiros, mas **NÃO envie nem substitua a pasta `data/`**.

### Passo 4: Instalar Novas Dependências e Compilar (Build)
Execute a instalação de dependências e a compilação do Next.js. Como o `better-sqlite3` compila binários C++ nativos, as dependências devem ser sempre compiladas diretamente no sistema de produção (VPS Linux):

```bash
# Limpar pastas temporárias antigas
rm -rf .next

# Instalar dependências (recompilando better-sqlite3 para o ambiente Linux se necessário)
npm install

# Compilar a aplicação para produção
npm run build
```

### Passo 5: Iniciar a Aplicação e Aplicar Migrações
Inicie a aplicação utilizando o PM2. No arranque, o script de base de dados irá ler os novos ficheiros da pasta `migrations/` e atualizar a base de dados de produção automaticamente:

```bash
# Iniciar a aplicação
pm2 start pdw-site
```
> **Nota de Configuração**: Lembre-se que o PM2 deve ter sido configurado com a flag `--cwd` apontando para a pasta raiz da aplicação para que o Next.js consiga mapear corretamente as pastas `data/` e `migrations/` em runtime.

---

## 🔍 Verificação e Testes Pós-Atualização

Após iniciar a aplicação, deve verificar se tudo correu conforme esperado:

### 1. Monitorizar os Logs de Inicialização
Acompanhe os logs em tempo real para verificar se o Next.js iniciou e se as migrações foram aplicadas sem erros:
```bash
pm2 logs pdw-site --lines 50
```
*Procure por erros relacionados com base de dados ou queries falhadas. Se inicializou corretamente, a aplicação estará pronta.*

### 2. Executar o Script de Teste da Base de Dados
O projeto inclui um utilitário para testar a leitura de tabelas e contagem de registos. Execute o seguinte comando na VPS:
```bash
npm run db:test
```
**O que deve ver no output:**
* Uma listagem com as tabelas existentes (incluindo as novas tabelas como `eventos`, `evento_inscricoes`, `evento_speakers`, `evento_agenda`, etc.).
* O número de registos em cada tabela.
* A listagem de colunas para confirmar se as novas colunas (como `telemovel`, `whatsapp_consent` e `lang` em `evento_inscricoes`, ou os links de acesso em `eventos`) foram devidamente adicionadas.

---

## 🚨 Plano de Recuperação (Rollback)

Se ocorrer algum erro grave durante a atualização do código ou se as migrações da base de dados falharem (corrompendo os dados ou impedindo o arranque da aplicação):

1. **Parar a aplicação**:
   ```bash
   pm2 stop pdw-site
   ```

2. **Limpar a base de dados danificada e ficheiros temporários**:
   ```bash
   rm -f data/pdw.db data/pdw.db-wal data/pdw.db-shm
   ```

3. **Restaurar o backup feito no Passo 2**:
   ```bash
   # Substitua pelo nome real do ficheiro de backup criado
   cp ~/pdw_db_backups/pdw_backup_FICHEIRO_CORRETO.db data/pdw.db
   ```

4. **Reverter o código para a versão estável anterior** (se necessário):
   ```bash
   # Caso utilize Git, reverter para o commit estável anterior
   git checkout HEAD@{1}
   npm run build
   ```

5. **Iniciar a aplicação novamente**:
   ```bash
   pm2 start pdw-site
   ```
