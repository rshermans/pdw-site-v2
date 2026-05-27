# Guia de Configuração e Deployment em VPS (OVH)
**Projeto:** PDW Site (Next.js + SQLite via `better-sqlite3` + Resend)

Este documento contém as instruções necessárias para o responsável pela infraestrutura e configuração da máquina virtual (VPS OVH) colocar o site em funcionamento sem erros.

---

## 🔍 Causas dos Erros Atuais (Status 500)

1. **Incompatibilidade Binária (`better-sqlite3`)**:
   * O módulo `better-sqlite3` compila ligações nativas em C++ (ficheiros `.node`) durante a instalação (`npm install`). 
   * **Problema**: Se a pasta `node_modules` foi copiada diretamente do ambiente de desenvolvimento local (ex.: Windows) para a VPS Linux (ou se foi compilada com versões desfasadas do Node), a aplicação falhará imediatamente ao carregar a base de dados, devolvendo erros **500 (Internal Server Error)** nas rotas que dependem do SQLite (Admin, Likes, Contactos).
2. **Falta de Escrita na Diretoria `/data` (WAL Journaling)**:
   * O SQLite está configurado para o modo **WAL (Write-Ahead Logging)** para suportar acessos concorrentes rápidos.
   * **Problema**: Neste modo, o SQLite cria e remove ficheiros temporários (`pdw.db-wal` e `pdw.db-shm`) na **mesma pasta** do ficheiro `.db`. Se o utilizador do processo do Node não tiver permissões de escrita na pasta `data/` (ou se a pasta for propriedade do `root`), a base de dados falhará ao inicializar.
3. **Bloqueio no Envio de Emails**:
   * O formulário de contactos escreve o lead na base de dados (`insertLead.run(...)`) **antes** de enviar os emails via Resend. Se a base de dados der erro, o script aborta e o email nunca é disparado. Além disso, as variáveis de ambiente (como `RESEND_API_KEY`) precisam de estar corretamente carregadas no ambiente de produção da VPS.

---

## 🛠️ Passo a Passo para Resolução e Deployment na VPS

### Passo 1: Instalar Ferramentas de Compilação Nativas na VPS
Como o `better-sqlite3` compila código C++, a VPS precisa de ter as ferramentas básicas do compilador (geralmente ausentes em instalações mínimas Linux).
Ligue-se via SSH à VPS e execute:

```bash
sudo apt update
sudo apt install -y build-essential python3
```

### Passo 2: Limpar e Reinstalar Dependências (Não copiar `node_modules`)
**Nunca** transfira a pasta `node_modules` do seu computador de desenvolvimento para a VPS.
No diretório do projeto na VPS, limpe tudo e reinstale diretamente no sistema Linux:

```bash
# Apagar pasta local de dependências e builds anteriores
rm -rf node_modules .next

# Instalar dependências compilando os binários nativos na VPS
npm install
```

### Passo 3: Configurar Variáveis de Ambiente (`.env`)
Como o `.env.local` é ignorado no repositório, deve criar um ficheiro `.env` ou `.env.production` no diretório raiz do projeto na VPS com os seguintes dados de produção:

```ini
# URL pública do site (sem barra no fim)
NEXT_PUBLIC_SITE_URL=https://pdw.tecminho.uminho.pt

# Chave API do Resend (Produção)
RESEND_API_KEY=re_sua_chave_producao_aqui

# Email que receberá os alertas de leads
ADMIN_EMAIL=rmagalhaes@tecminho.uminho.pt

# Token de acesso ao Painel de Administração (escolha uma palavra-passe forte)
PDW_ADMIN_TOKEN=defina_uma_senha_forte_de_admin

# Segredo de Likes (Salt para hashing de IP anónimo)
PDW_LIKES_SECRET=um_segredo_aleatorio_e_longo
```

### Passo 4: Ajustar Permissões da Pasta de Base de Dados
A pasta `data/` precisa de permissões totais de leitura/escrita pelo utilizador do sistema Linux que executa o processo da aplicação (por exemplo, se correr como o utilizador `ubuntu` ou `debian`):

```bash
# Garantir que o utilizador correto é dono da diretoria do projeto e da pasta de dados
sudo chown -R $USER:$USER /caminho/para/o/projeto

# Garantir permissões de leitura, escrita e execução na pasta 'data'
chmod -R 755 /caminho/para/o/projeto/data
```

### Passo 5: Inicializar e Semear a Base de Dados (Seeding)
Para garantir que as tabelas de posts, atualidades e secções do site estão configuradas e povoadas com o conteúdo inicial:

```bash
# Executa o script que cria e popula a base de dados em data/pdw.db
npm run db:seed

# Opcional: Testa se a base de dados lê sem erros e lista os registos criados
npm run db:test
```
*(Nota: O script de seed é agora completamente idempotente e não falhará se já contiver registos).*

### Passo 6: Build de Produção
Agora que os binários nativos estão compilados para Linux e a BD está semeada, execute a build de produção do Next.js:

```bash
npm run build
```

---

## 🚀 Manutenção do Servidor (Recomendado)

### 1. Utilizar o PM2 para Gestão de Processos
Para evitar que o site caia quando a sessão SSH for fechada e garantir reinícios automáticos após reinicializações da VPS:

Instalar PM2 globalmente:
```bash
sudo npm install -g pm2
```

Iniciar a aplicação Next.js a partir do diretório raiz:
```bash
pm2 start npm --name "pdw-site" --cwd "/caminho/para/o/projeto" -- run start
```
> **Nota Crítica**: Certifique-se de passar a flag `--cwd "/caminho/para/o/projeto"`. Desta forma, o Next.js carrega com a diretoria de trabalho correta e consegue encontrar a pasta `migrations/` e a pasta `data/` localizadas no projeto.

Salvar a lista do PM2 e configurar o arranque automático no boot da máquina:
```bash
pm2 save
pm2 startup
# (Siga a instrução impressa no terminal pelo pm2 startup para concluir o registo no systemd)
```

Verificar logs em tempo real se surgirem novos problemas:
```bash
pm2 logs pdw-site
```

### 2. Configuração do Reverse Proxy (Nginx)
Como o Next.js corre por padrão na porta 3000, o Nginx deve redirecionar o tráfego HTTP/HTTPS:

Exemplo de bloco de configuração do Nginx (`/etc/nginx/sites-available/pdw`):
```nginx
server {
    listen 80;
    server_name pdw.tecminho.uminho.pt;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pdw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Obtenha o certificado SSL gratuito via Let's Encrypt (Certbot):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pdw.tecminho.uminho.pt
```
