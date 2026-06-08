# Orientações de Implementação — Módulo de Eventos / Webinar PDW

> **Objetivo:** dar ao desenvolvimento (vibe coding) um plano claro, aditivo e não-destrutivo para inserir no website:
> 1. um **banner** de evento ativável pelo admin,
> 2. uma **página de evento** acedida como uma **atualidade**,
> 3. um **conjunto de ícones** selecionáveis pelo admin,
> 4. uma **nova tabela SQLite** para inscrições,
> 5. uma **estrutura de acompanhamento** do evento no admin.
>
> **Princípio mestre:** *só adicionar, nunca partir.* Tudo é feature nova, isolada, ligada à página de atualidades já existente sem alterar o seu comportamento atual.

---

## 0. Princípios não-negociáveis

1. **Aditivo, não destrutivo.** Nenhuma coluna/tabela existente é apagada ou renomeada. Só se criam tabelas e rotas novas. Se for preciso tocar em `atualidades`, é apenas por **adição** de colunas opcionais com `DEFAULT` seguro.
2. **Reaproveitar o que já existe.** O evento aparece no feed de atualidades através do mesmo mecanismo que já mostra posts e participações. Não se cria um segundo sistema de listagem.
3. **Seguir os padrões do projeto.** Antes de escrever uma linha, ver a secção [§1](#1-antes-de-comecar-descoberta-do-stack) e replicar convenções existentes (ORM, routing, auth do admin, templating, naming).
4. **Reutilizável.** Não é um one-off para "o webinar PDW". É um *tipo de conteúdo Evento* que serve este e todos os próximos eventos.
5. **Estado único como fonte de verdade.** O banner, os badges da página e os CTAs derivam todos do **estado do evento** (ver [§10](#10-maquina-de-estados-do-evento-coracao-do-sistema)). O admin define datas e estado uma vez; o resto reage automaticamente.

---

## 1. Antes de começar: descoberta do stack

O agente que implementar deve **primeiro inspecionar o repositório** e preencher mentalmente esta tabela, porque tudo o que se segue deve imitar o que já existe:

| O que descobrir | Onde procurar | Porquê |
| --- | --- | --- |
| Linguagem/framework backend | `package.json`, `requirements.txt`, `app.py`, `server.js`, `manage.py` | Define sintaxe de rotas e migrações |
| ORM ou SQL direto | imports tipo `sqlalchemy`, `prisma`, `sequelize`, `better-sqlite3`, queries cruas | Define como criar a tabela nova |
| Ficheiro da BD SQLite | `*.db`, `*.sqlite`, config de ligação | Onde correm as migrações |
| Esquema atual de `atualidades` | migração/modelo existente | Para ligar o evento sem partir o feed |
| Autenticação do admin | middleware/decorators de rotas `/admin` | Reutilizar **exatamente** o mesmo guard |
| Motor de templates / framework frontend | `.html`, `.jsx`, `.vue`, `.ejs`, blade, etc. | Página e banner seguem o mesmo motor |
| Biblioteca de ícones já usada | imports de `lucide`, `bootstrap-icons`, `font-awesome`, `heroicons`, SVGs locais | O picker usa a biblioteca já presente, não introduz outra |
| Padrão de validação de formulários | libs existentes | Validar a inscrição com o mesmo padrão |

> ⚠️ **Regra:** se alguma coisa abaixo (nomes de colunas, estilo de endpoint) divergir do que já existe no projeto, **vence o padrão do projeto**. Este documento descreve *contratos e comportamento*, não impõe sintaxe.

---

## 2. Arquitetura: como o evento encaixa em "Atualidades"

```
                       ┌─────────────────────────┐
                       │      FEED ATUALIDADES     │  (já existe)
                       │  posts | participações |  │
                       │       EVENTO (novo)       │
                       └────────────┬──────────────┘
                                    │ clica
                                    ▼
        ┌───────────────────────────────────────────────┐
        │   PÁGINA DE ATUALIDADE — variante "evento"      │
        │   (mesma rota /atualidades/{slug}, layout rico) │
        │   título · data · descrição · speakers · agenda │
        │   FORMULÁRIO DE INSCRIÇÃO · CTAs                 │
        └───────────────────────────────────────────────┘

   BANNER GLOBAL (topo do site)  ──► aponta para a página do evento
   estado/textos derivados do mesmo registo do evento
```

**Decisão de modelação recomendada (mais segura e não-destrutiva):**

- Mantém-se a tabela `atualidades` como está.
- Cria-se uma tabela **`eventos`** com os campos ricos do evento, ligada **opcionalmente** a uma linha de `atualidades` via `atualidade_id`.
- Quando o admin publica um evento, o sistema cria/atualiza a entrada correspondente em `atualidades` (com um marcador de tipo) para ele aparecer no feed. A página de detalhe deteta que essa atualidade tem `evento` associado e renderiza o layout rico em vez do layout normal.

Vantagem: o feed e a página de atualidades **não mudam de schema** (no máximo ganham 1 coluna opcional `tipo`/`evento_id`), e toda a complexidade do evento vive em tabelas novas e isoladas.

---

## 3. Modelo de dados (SQLite)

> DDL em SQLite "cru" para servir de contrato. **Se o projeto usa um ORM, traduzir para a migração do ORM** mantendo nomes e tipos equivalentes. Datas em texto ISO-8601 (`YYYY-MM-DD HH:MM:SS`) ou UNIX, conforme o padrão já usado no projeto.

### 3.1 Tabela `eventos`

```sql
CREATE TABLE IF NOT EXISTS eventos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    atualidade_id         INTEGER REFERENCES atualidades(id) ON DELETE SET NULL,
    slug                  TEXT NOT NULL UNIQUE,
    titulo                TEXT NOT NULL,
    subtitulo             TEXT,
    descricao_curta       TEXT,
    descricao_longa       TEXT,                 -- markdown/html conforme padrão do projeto
    icone                 TEXT DEFAULT 'webinar', -- chave do conjunto de ícones (ver §4)
    imagem_destaque       TEXT,                 -- caminho/URL

    -- agendamento
    data_inicio           TEXT NOT NULL,        -- ISO-8601
    data_fim              TEXT,
    fuso_horario          TEXT DEFAULT 'Europe/Lisbon',
    formato               TEXT DEFAULT 'online',-- online | presencial | hibrido
    local                 TEXT,                 -- morada se presencial
    plataforma            TEXT,                 -- Teams | Zoom | YouTube...
    link_acesso           TEXT,                 -- link da sala (privado até ao dia)

    -- inscrições
    inscricoes_abertas    INTEGER DEFAULT 1,    -- 0/1
    link_inscricao_externo TEXT,               -- se usarem form externo, senão NULL
    capacidade_maxima     INTEGER,              -- NULL = ilimitado

    -- estado e ciclo de vida (ver §10)
    estado                TEXT NOT NULL DEFAULT 'rascunho',
                          -- rascunho|agendado|a_decorrer|encerrado|arquivado

    -- pós-evento
    video_gravacao_url    TEXT,
    slides_url            TEXT,

    -- banner (ver §5)
    banner_ativo          INTEGER DEFAULT 0,    -- 0/1
    banner_texto          TEXT,
    banner_cta_texto      TEXT DEFAULT 'Inscrever',
    banner_cta_link       TEXT,                 -- NULL = usa a página do evento

    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio ON eventos(data_inicio);
```

### 3.2 Tabela `evento_speakers` (opcional mas recomendada)

Permite gerir os oradores do dossier (Miguel, Nuno Fernandes, Pedro Xavier, speaker PDW/TecMinho) com bio, foto e LinkedIn.

```sql
CREATE TABLE IF NOT EXISTS evento_speakers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id   INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nome        TEXT NOT NULL,
    cargo       TEXT,
    bio         TEXT,
    foto        TEXT,
    linkedin    TEXT,
    ordem       INTEGER DEFAULT 0
);
```

### 3.3 Tabela `evento_agenda` (opcional)

Para a agenda minuto-a-minuto da página pública.

```sql
CREATE TABLE IF NOT EXISTS evento_agenda (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id   INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    intervalo   TEXT,            -- ex: "00:05-00:15"
    bloco       TEXT NOT NULL,   -- ex: "A evolução da Internet"
    descricao   TEXT,
    responsavel TEXT,
    ordem       INTEGER DEFAULT 0
);
```

### 3.4 Tabela `evento_inscricoes` — **a tabela central pedida**

Campos alinhados com o `05_textos_inscricao_cta.md`.

```sql
CREATE TABLE IF NOT EXISTS evento_inscricoes (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id                INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,

    -- dados do formulário
    nome                     TEXT NOT NULL,
    email                    TEXT NOT NULL,
    organizacao              TEXT,
    cargo                    TEXT,
    tipo_participante        TEXT,   -- publico_geral|universidade|empresa|admin_publica|outro
    interesse_principal      TEXT,   -- tecnologia|diplomas|onboarding|piloto|parceria|imprensa
    consentimento            INTEGER DEFAULT 0,  -- RGPD: 0/1 (obrigatório aceitar)
    pergunta_speakers        TEXT,

    -- acompanhamento do participante (ver §8)
    estado_participacao      TEXT DEFAULT 'inscrito',
                             -- inscrito|confirmado|compareceu|ausente|cancelado

    -- acompanhamento de lead de piloto (ver §8)
    estado_lead              TEXT DEFAULT 'novo',
                             -- novo|contactado|em_conversa|ganho|perdido|sem_interesse
    notas_lead               TEXT,

    -- origem / anti-abuso (RGPD-friendly)
    origem                   TEXT,   -- utm_source ou canal (linkedin, newsletter...)
    ip_hash                  TEXT,   -- HASH do IP, nunca o IP em claro (ver §12)

    created_at               TEXT DEFAULT (datetime('now')),

    UNIQUE(evento_id, email)         -- evita inscrição duplicada por email
);

CREATE INDEX IF NOT EXISTS idx_insc_evento ON evento_inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_insc_interesse ON evento_inscricoes(interesse_principal);
CREATE INDEX IF NOT EXISTS idx_insc_estado_lead ON evento_inscricoes(estado_lead);
```

### 3.5 Ligação opcional ao feed `atualidades`

Se a tabela `atualidades` ainda não distingue tipos, adicionar **por adição** (não obrigatório se já houver um campo `tipo`):

```sql
-- só correr se estas colunas NÃO existirem ainda
ALTER TABLE atualidades ADD COLUMN tipo TEXT DEFAULT 'post';      -- post|participacao|evento
ALTER TABLE atualidades ADD COLUMN evento_id INTEGER REFERENCES eventos(id);
```

> ✅ `DEFAULT 'post'` garante que **todas as linhas existentes continuam exatamente iguais** e que o feed atual não muda. SQLite só permite `ADD COLUMN` (não `DROP`/`RENAME` simples em versões antigas), por isso esta abordagem aditiva é a mais segura.

### 3.6 Migrações

- Criar **um ficheiro de migração novo** seguindo o padrão do projeto (numeração/timestamp como os existentes).
- A migração só faz `CREATE TABLE IF NOT EXISTS` e os `ALTER ... ADD COLUMN` guardados por verificação de existência.
- **Não** mexer em migrações antigas.
- Incluir migração de *rollback* (DROP das tabelas novas) que **nunca** toca em `atualidades` a não ser para remover as 2 colunas adicionadas, se o sistema de migração suportar.

---

## 4. Conjunto de ícones selecionável

O admin escolhe um ícone para o evento a partir de uma **lista curada e temática**. Guardamos só a **chave** (`eventos.icone`); o render mapeia a chave para o componente da biblioteca de ícones já usada no projeto.

**Não introduzir uma biblioteca nova.** Mapear estas chaves para o que existir (Lucide / Bootstrap Icons / Font Awesome / SVG locais).

| Chave (`icone`) | Significado | Lucide | Bootstrap Icons | Font Awesome |
| --- | --- | --- | --- | --- |
| `webinar` | webinar / vídeo ao vivo | `video` | `camera-video` | `fa-video` |
| `calendario` | data / agenda | `calendar` | `calendar-event` | `fa-calendar` |
| `identidade` | identidade digital | `id-card` | `person-vcard` | `fa-id-card` |
| `confianca` | confiança / segurança | `shield-check` | `shield-check` | `fa-shield` |
| `wallet` | carteira digital | `wallet` | `wallet2` | `fa-wallet` |
| `credencial` | credencial verificável | `badge-check` | `patch-check` | `fa-certificate` |
| `universidade` | educação / diplomas | `graduation-cap` | `mortarboard` | `fa-graduation-cap` |
| `empresa` | empresas | `building-2` | `building` | `fa-building` |
| `admin_publica` | setor público | `landmark` | `bank` | `fa-landmark` |
| `comunidade` | comunidade | `users` | `people` | `fa-users` |
| `podcast` | podcast / áudio | `mic` | `mic` | `fa-microphone` |
| `fio_dourado` | Fio Dourado Digital | `git-commit-horizontal` | `bezier2` | `fa-link` |
| `gravacao` | gravação disponível | `play-circle` | `play-circle` | `fa-circle-play` |

**Implementação do picker no admin:**
- Definir a lista numa única constante partilhada (ex: `EVENT_ICONS = [{key, label, component}]`).
- O picker mostra grelha de botões com o ícone + label; estado selecionado destacado.
- Guardar `key` em `eventos.icone`.
- Um helper `renderEventIcon(key)` resolve a chave → componente, com **fallback** para `webinar` se a chave for desconhecida (proteção contra dados antigos).

---

## 5. Sistema de banner

**Comportamento:**
- O banner é controlado por evento (`banner_ativo`, `banner_texto`, `banner_cta_texto`, `banner_cta_link`).
- **Regra de unicidade:** no máximo **um** evento com `banner_ativo = 1` é mostrado. Se houver mais que um, mostrar o de `data_inicio` mais próxima no futuro. (Em alternativa, ao ativar um banner no admin, desativar automaticamente os outros — recomendado, mais previsível.)
- O banner renderiza num *layout/partial global* (header do site), por isso surge em todas as páginas. Deve ser **dispensável** (botão "fechar") guardando a preferência em `localStorage` por `evento.id`, para não irritar quem já fechou.
- Se `banner_cta_link` for `NULL`, o CTA aponta para a página do evento (`/atualidades/{slug}`).
- O **texto e o CTA mudam conforme o estado** do evento (ver [§10](#10-maquina-de-estados-do-evento-coracao-do-sistema)) — uma só fonte de verdade.

**Não-quebrar:** o partial do banner é **incluído** no layout, com guarda `if (eventoBannerAtivo)`. Sem evento ativo → não renderiza nada e o layout fica idêntico ao atual.

---

## 6. Página pública do evento (como atualidade)

Mesma rota das atualidades (`/atualidades/{slug}`). O controlador deteta `atualidade.tipo === 'evento'` (ou `evento_id` presente) e usa o template rico.

**Secções (ordem alinhada com `04_plano_apresentacao_e_producao.md`):**

1. **Hero** — ícone escolhido + título + subtítulo + badge de estado dinâmico ("Inscrições abertas" / "Ao vivo agora" / "Gravação disponível") + data/hora com fuso + contagem decrescente quando aplicável.
2. **Descrição curta** (o "porquê me interessa").
3. **Descrição longa** (a transição plataformas → economia de confiança).
4. **Quem deve participar** (os 4 públicos).
5. **Agenda** (de `evento_agenda`) — render como timeline; *toque visual do Fio Dourado* (linha dourada a ligar os blocos — ver §11).
6. **Speakers** (de `evento_speakers`) — cartões com foto, cargo, LinkedIn.
7. **Formulário de inscrição** (ver §7) — ou, pós-evento, substituído por **gravação + slides + CTAs**.
8. **CTAs** — Comunidade, Newsletter, Podcast, Pilotos (textos do doc 05).

**Estados visuais da página (automáticos):**
- *Antes:* mostra formulário + contagem decrescente.
- *Durante (`a_decorrer`):* badge "Ao vivo", botão grande para `link_acesso`.
- *Depois (`encerrado`):* esconde formulário, mostra `video_gravacao_url`, `slides_url` e CTAs de seguimento.

---

## 7. Formulário de inscrição

**Campos** (mapeiam 1:1 para `evento_inscricoes`):

| Campo | Tipo UI | Obrigatório | Notas |
| --- | --- | --- | --- |
| Nome | texto | ✅ | |
| Email | email | ✅ | validar formato |
| Organização | texto | ❌ | |
| Cargo / função | texto | ❌ | |
| Tipo de participante | select | ✅ | público geral / universidade / empresa / admin pública / outro |
| Interesse principal | select | ❌ | tecnologia / diplomas / onboarding / piloto / parceria / imprensa |
| Pergunta para speakers | textarea | ❌ | alimenta o Q&A |
| Consentimento comunicações | checkbox | ✅ | **RGPD** — texto explícito (ver §12) |

**Comportamento:**
- `POST` para o endpoint de inscrição (ver §9). Validação no cliente **e** no servidor.
- Anti-spam: honeypot (campo escondido) + rate-limit por IP/sessão. Sem CAPTCHA de terceiros se possível.
- Duplicados: a constraint `UNIQUE(evento_id, email)` impede; tratar o erro com mensagem amigável ("Já está inscrito com este email").
- Sucesso: mensagem de confirmação + (opcional) envio de email de confirmação seguindo o padrão de envio já existente no projeto.
- Respeitar `inscricoes_abertas` e `capacidade_maxima`: se fechado/cheio, esconder o form e mostrar estado adequado.

---

## 8. Admin: gestão e acompanhamento

Reutilizar **o mesmo guard de autenticação** e o mesmo layout do admin existente. Adicionar uma secção "Eventos".

### 8.1 CRUD de Eventos
- Lista de eventos com estado, data, nº de inscritos, e toggles rápidos (`banner_ativo`, `inscricoes_abertas`).
- Formulário de criação/edição com todos os campos de `eventos`, **picker de ícones** (§4), gestão de speakers e linhas de agenda (sub-formulários), e campos de banner.
- Ao publicar (passar a `agendado`/`a_decorrer`), garantir/atualizar a entrada em `atualidades` para aparecer no feed.

### 8.2 Inscrições (acompanhamento de participantes)
- Tabela de inscritos por evento, com filtros por `tipo_participante`, `interesse_principal`, `estado_participacao`, `estado_lead`.
- Edição inline de `estado_participacao` (inscrito → compareceu / ausente) — útil no pós-evento para a métrica de **taxa de presença**.
- **Exportar CSV** (para cruzar com a plataforma do webinar e enviar follow-ups).

### 8.3 Leads de piloto (mini-CRM)
- Vista filtrada de inscrições com `interesse_principal IN ('piloto','parceria')`.
- Editar `estado_lead` (novo → contactado → em_conversa → ganho/perdido) e `notas_lead`.
- Liga diretamente à métrica "5+ contactos qualificados para pilotos".

### 8.4 Painel de KPIs (mapeado ao `03_plano_divulgacao.md`)
Mostrar por evento:
- Total de inscrições · meta 150+
- Inscritos por canal/`origem`
- Inscritos por `tipo_participante` (gráfico simples)
- Subscrições de newsletter (consentimentos)
- Compareceram / taxa de presença (após marcar presenças)
- Leads de piloto e respetivo funil

> Usar a biblioteca de gráficos já presente; se não houver, barras CSS simples bastam para o MVP.

---

## 9. Contratos de API / endpoints

> Nomes ilustrativos — adaptar ao estilo de routing do projeto (REST, RPC, etc.).

**Público**
- `GET /atualidades/{slug}` → página (detecta evento e usa template rico).
- `POST /api/eventos/{slug}/inscricoes` → cria inscrição.
  - body: `{ nome, email, organizacao?, cargo?, tipo_participante, interesse_principal?, pergunta_speakers?, consentimento, _hp? }`
  - 201 `{ ok: true }` | 409 duplicado | 422 validação | 403 fechado/cheio.
- `GET /api/banner-ativo` *(opcional, só se o banner for carregado via JS)* → `{ ativo, texto, cta_texto, cta_link, evento_id }` ou `{ ativo:false }`.

**Admin (atrás do guard existente)**
- `GET/POST/PUT/DELETE /admin/eventos[/{id}]`
- `GET /admin/eventos/{id}/inscricoes` (+ `?formato=csv`)
- `PATCH /admin/inscricoes/{id}` → atualizar `estado_participacao`, `estado_lead`, `notas_lead`
- `POST /admin/eventos/{id}/banner` → ativar/desativar (desativa os outros).

---

## 10. Máquina de estados do evento (coração do sistema)

Um único campo `eventos.estado` (com auto-derivação por datas) controla banner, página e CTAs. **Isto elimina trabalho manual e inconsistências.**

```
rascunho ──publicar──► agendado ──[data_inicio chega]──► a_decorrer
                                                              │
                                              [data_fim passa]│
                                                              ▼
                                                          encerrado ──► arquivado
```

| Estado | Banner | Página pública | CTA principal |
| --- | --- | --- | --- |
| `rascunho` | oculto | não listado/404 | — |
| `agendado` | "Faltam X dias — inscreve-te" | form + contagem decrescente | Inscrever |
| `a_decorrer` | "Estamos AO VIVO" | botão para `link_acesso` | Entrar agora |
| `encerrado` | "Vê a gravação" | gravação + slides + CTAs | Ver gravação |
| `arquivado` | oculto | acessível, sem destaque | Comunidade/Podcast |

**Auto-derivação recomendada:** uma função `estadoEfetivo(evento)` compara `now` com `data_inicio`/`data_fim` e devolve o estado a mostrar, sem depender de um cron. Assim o site reage sozinho à passagem do tempo. O campo `estado` na BD serve de override manual (ex: forçar `rascunho`/`arquivado`).

---

## 11. Toques inovadores (alinhados ao "Fio Dourado Digital")

1. **Motivo visual "Fio Dourado":** uma linha/gradiente dourado que percorre a timeline da agenda e liga os blocos — reforça a marca *Fio Dourado Digital* sem custo funcional. Puramente CSS/SVG.
2. **Contagem decrescente viva + badge "Ao vivo":** muda sozinho pela máquina de estados; cria urgência (apoia a métrica de presença).
3. **Tipo de conteúdo reutilizável:** depois deste webinar, qualquer evento futuro usa a mesma estrutura — banner, página, inscrições, KPIs — sem novo desenvolvimento.
4. **Funil de KPIs no admin** ligado às metas reais do plano de divulgação.
5. **[Fase 2 — opcional, mas on-brand]** *Credencial de participação verificável:* emitir a quem compareceu uma credencial "Participei no Webinar PDW" — é literalmente o tema do evento (credenciais verificáveis) a ser dogfooded. Marcar como módulo posterior; não bloqueia o MVP.

---

## 12. Segurança e RGPD

Estão a recolher dados pessoais na UE — tratar com cuidado:
- **Consentimento explícito e granular:** checkbox não pré-marcada, com texto a indicar finalidade (comunicações da comunidade/newsletter) e link para a política de privacidade. Guardar em `consentimento` (e idealmente data/versão do texto aceite).
- **Minimização:** só pedir o necessário; campos sensíveis ficam opcionais.
- **IP:** nunca guardar IP em claro — guardar `ip_hash` (hash com salt) apenas para anti-abuso, ou dispensar de todo.
- **Nunca** colocar dados pessoais em parâmetros de URL/query string.
- **Acesso restrito:** listas de inscritos e export CSV só atrás do guard de admin existente.
- **Direito ao esquecimento:** prever ação no admin para apagar/anonimizar uma inscrição a pedido.
- **Validação no servidor sempre**, mesmo com validação no cliente.

---

## 13. Ordem de implementação (faseada)

**Fase 1 — Fundação (não visível ainda)**
1. Migração: criar `eventos`, `evento_inscricoes` (+ `evento_speakers`, `evento_agenda`); `ALTER` aditivo opcional em `atualidades`.
2. Constante do conjunto de ícones + helper de render.

**Fase 2 — Admin**
3. CRUD de eventos + picker de ícones + gestão de speakers/agenda + campos de banner.
4. Lista de inscrições + filtros + export CSV + estados (participação e lead).

**Fase 3 — Público**
5. Template rico da página de evento na rota de atualidades.
6. Formulário de inscrição + endpoint + validação + anti-spam.
7. Banner global (partial condicional).

**Fase 4 — Inteligência e polish**
8. Máquina de estados (badges, contagem, auto-derivação).
9. Painel de KPIs.
10. Motivo visual Fio Dourado.

**Fase 5 — Opcional**
11. Email de confirmação automático.
12. Credencial de participação verificável.

> Cada fase deve ser entregue **atrás de feature-flag** ou só ativada quando existir pelo menos um evento publicado, garantindo que o site se mantém idêntico até estar tudo pronto.

---

## 14. Checklist "não quebrar" / QA

- [ ] Migração corre em cópia da BD sem erros e é **idempotente** (`IF NOT EXISTS`).
- [ ] Feed de atualidades existente continua a mostrar posts/participações exatamente como antes.
- [ ] Páginas de atualidades **não-evento** renderizam com o template antigo, sem alterações.
- [ ] Sem evento com banner ativo → o layout/header fica visualmente idêntico ao atual.
- [ ] Rotas e guard do admin reutilizam o mecanismo existente (sem novo sistema de auth).
- [ ] Ícone inválido/antigo cai no fallback sem rebentar a página.
- [ ] Inscrição duplicada por email tratada com mensagem amigável.
- [ ] Formulário valida no servidor; honeypot ativo; rate-limit testado.
- [ ] Estados do evento testados nas 3 fases temporais (antes/durante/depois) alterando datas.
- [ ] Export CSV abre corretamente e contém só dados autorizados.
- [ ] Consentimento RGPD obrigatório e registado.
- [ ] Rollback da migração não afeta dados de `atualidades` existentes.

---

## 15. Perguntas em aberto (confirmar com a equipa)

1. **Stack exato** (backend/ORM/templating) — para traduzir DDL e endpoints aos padrões reais.
2. A tabela `atualidades` já tem campo `tipo` ou semelhante? Se sim, evitamos o `ALTER`.
3. As **inscrições** ficam só na BD, ou também integram a plataforma do webinar (Teams/Zoom/YouTube)? Há link de inscrição externo?
4. O banner é **server-rendered** no header (recomendado) ou carregado por JS?
5. Já existe biblioteca de ícones e de gráficos no projeto? Quais?
6. Há sistema de envio de email reutilizável para a confirmação de inscrição?
7. Texto e versão da **política de privacidade** a referenciar no consentimento.
8. Os campos `TODO_DATA` / `TODO_LINK` do dossier — já há valores, ou ficam editáveis no admin (recomendado) até serem definidos?

---

*Documento de orientação. Descreve contratos e comportamento; a sintaxe final deve seguir os padrões do repositório.*