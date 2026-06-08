-- migrations/003_eventos.sql
-- Módulo de Eventos/Webinars — aditivo, só CREATE TABLE IF NOT EXISTS.
-- Não altera tabelas existentes.

CREATE TABLE IF NOT EXISTS eventos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    slug                  TEXT NOT NULL UNIQUE,
    titulo                TEXT NOT NULL,
    subtitulo             TEXT,
    descricao_curta       TEXT,
    descricao_longa       TEXT,
    icone                 TEXT DEFAULT 'webinar',
    imagem_destaque       TEXT,

    data_inicio           TEXT NOT NULL,
    data_fim              TEXT,
    fuso_horario          TEXT DEFAULT 'Europe/Lisbon',
    formato               TEXT DEFAULT 'online',
    local                 TEXT,
    plataforma            TEXT,
    link_acesso           TEXT,

    inscricoes_abertas    INTEGER DEFAULT 1,
    capacidade_maxima     INTEGER,
    estado                TEXT NOT NULL DEFAULT 'rascunho',

    video_gravacao_url    TEXT,
    slides_url            TEXT,

    banner_ativo          INTEGER DEFAULT 0,
    banner_texto          TEXT,
    banner_cta_texto      TEXT DEFAULT 'Inscrever',
    banner_cta_link       TEXT,

    created_at            TEXT DEFAULT (datetime('now')),
    updated_at            TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_eventos_estado       ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_data_inicio  ON eventos(data_inicio);

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

CREATE TABLE IF NOT EXISTS evento_agenda (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id   INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    intervalo   TEXT,
    bloco       TEXT NOT NULL,
    descricao   TEXT,
    responsavel TEXT,
    ordem       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS evento_inscricoes (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id                INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,

    nome                     TEXT NOT NULL,
    email                    TEXT NOT NULL,
    organizacao              TEXT,
    cargo                    TEXT,
    tipo_participante        TEXT,
    interesse_principal      TEXT,
    consentimento            INTEGER NOT NULL DEFAULT 0,
    pergunta_speakers        TEXT,

    estado_participacao      TEXT DEFAULT 'inscrito',
    estado_lead              TEXT DEFAULT 'novo',
    notas_lead               TEXT,

    origem                   TEXT,
    ip_hash                  TEXT,

    created_at               TEXT DEFAULT (datetime('now')),

    UNIQUE(evento_id, email)
);

CREATE INDEX IF NOT EXISTS idx_insc_evento      ON evento_inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_insc_estado_lead ON evento_inscricoes(estado_lead);

-- Seed do webinar PDW (idempotente — OR IGNORE)
INSERT OR IGNORE INTO eventos (
    slug,
    titulo,
    subtitulo,
    descricao_curta,
    descricao_longa,
    data_inicio,
    formato,
    plataforma,
    estado,
    inscricoes_abertas,
    banner_ativo,
    banner_cta_texto
) VALUES (
    'webinar-pdw',
    'Webinar — Portuguese Digital Wallet: O Fio Dourado Digital',
    'Identidade Digital, Diplomas Verificáveis e o Futuro da Confiança Online',
    'Junte-se a nós nesta sessão online para descobrir como a Portuguese Digital Wallet está a transformar a identidade digital em Portugal. Uma oportunidade única de aprender, debater e colocar as suas questões diretamente aos especialistas.',
    'A Portuguese Digital Wallet (PDW) é a carteira digital soberana de Portugal — uma infraestrutura aberta que permite a cidadãos e instituições gerir e partilhar credenciais verificáveis de forma segura e conforme com o eIDAS 2.0 e a rede europeia EBSI.

Neste webinar, exploraremos como a PDW está a democratizar o acesso a serviços digitais: desde a emissão de diplomas universitários verificáveis, ao onboarding digital sem fricção, até à criação de um ecossistema de confiança entre cidadãos, universidades e empresas.

Temas abordados:
• O que é a Portuguese Digital Wallet e como funciona
• Credenciais verificáveis e diplomas digitais: casos reais
• eIDAS 2.0 e a carteira europeia de identidade digital
• Como a sua instituição ou empresa pode integrar a PDW
• Demonstração ao vivo da plataforma',
    '2026-07-01 10:00:00',
    'online',
    'Microsoft Teams',
    'agendado',
    1,
    1,
    'Inscrever'
);
