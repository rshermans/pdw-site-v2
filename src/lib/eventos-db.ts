import db from './db';
import crypto from 'crypto';

export interface Evento {
  id: number;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  descricao_curta: string | null;
  descricao_longa: string | null;
  icone: string;
  imagem_destaque: string | null;
  imagem_cartaz: string | null;
  imagem_cronograma: string | null;
  data_inicio: string;
  data_fim: string | null;
  fuso_horario: string;
  formato: string;
  local: string | null;
  plataforma: string | null;
  link_acesso: string | null;
  inscricoes_abertas: boolean;
  capacidade_maxima: number | null;
  estado: 'rascunho' | 'agendado' | 'a_decorrer' | 'encerrado' | 'arquivado';
  video_gravacao_url: string | null;
  slides_url: string | null;
  banner_ativo: boolean;
  banner_texto: string | null;
  banner_cta_texto: string;
  banner_cta_link: string | null;
  anuncio_inicio: string | null;
  anuncio_fim: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventoSpeaker {
  id: number;
  evento_id: number;
  nome: string;
  cargo: string | null;
  bio: string | null;
  foto: string | null;
  linkedin: string | null;
  ordem: number;
}

export interface EventoAgenda {
  id: number;
  evento_id: number;
  intervalo: string | null;
  bloco: string;
  descricao: string | null;
  responsavel: string | null;
  ordem: number;
}

export interface BannerEventoData {
  slug: string;
  titulo: string;
  data_inicio: string;
  plataforma: string | null;
  banner_cta_texto: string;
  banner_cta_link: string | null;
}

function rowToEvento(r: Record<string, unknown>): Evento {
  return {
    ...(r as any),
    inscricoes_abertas: !!r.inscricoes_abertas,
    banner_ativo: !!r.banner_ativo,
  };
}

export function getEventoBySlug(slug: string): Evento | null {
  const r = db.prepare(`SELECT * FROM eventos WHERE slug = ?`).get(slug) as Record<string, unknown> | undefined;
  return r ? rowToEvento(r) : null;
}

export function listEventos(): Evento[] {
  return (db.prepare(`SELECT * FROM eventos ORDER BY data_inicio DESC`).all() as Record<string, unknown>[]).map(rowToEvento);
}

export function getEventoSpeakers(eventoId: number): EventoSpeaker[] {
  return db.prepare(
    `SELECT * FROM evento_speakers WHERE evento_id = ? ORDER BY ordem ASC, id ASC`
  ).all(eventoId) as EventoSpeaker[];
}

export function getEventoAgenda(eventoId: number): EventoAgenda[] {
  return db.prepare(
    `SELECT * FROM evento_agenda WHERE evento_id = ? ORDER BY ordem ASC, id ASC`
  ).all(eventoId) as EventoAgenda[];
}

export function countInscricoes(eventoId: number): number {
  const r = db.prepare(
    `SELECT COUNT(*) as c FROM evento_inscricoes WHERE evento_id = ?`
  ).get(eventoId) as { c: number };
  return r.c;
}

export function getActiveBannerEvento(): BannerEventoData | null {
  const r = db.prepare(`
    SELECT slug, titulo, data_inicio, plataforma, banner_cta_texto, banner_cta_link
    FROM eventos
    WHERE banner_ativo = 1
      AND estado IN ('agendado', 'a_decorrer')
      AND (anuncio_inicio IS NULL OR anuncio_inicio <= date('now'))
      AND (anuncio_fim   IS NULL OR anuncio_fim   >= date('now'))
    ORDER BY data_inicio ASC
    LIMIT 1
  `).get() as BannerEventoData | undefined;
  return r ?? null;
}

export function createEvento(input: Omit<Evento, 'id' | 'created_at' | 'updated_at'>): number {
  const stmt = db.prepare(`
    INSERT INTO eventos (
      slug, titulo, subtitulo, descricao_curta, descricao_longa, icone,
      imagem_destaque, imagem_cartaz, imagem_cronograma, data_inicio, data_fim,
      fuso_horario, formato, local, plataforma, link_acesso,
      inscricoes_abertas, capacidade_maxima, estado, video_gravacao_url, slides_url,
      banner_ativo, banner_texto, banner_cta_texto, banner_cta_link, anuncio_inicio, anuncio_fim,
      created_at, updated_at
    ) VALUES (
      @slug, @titulo, @subtitulo, @descricao_curta, @descricao_longa, @icone,
      @imagem_destaque, @imagem_cartaz, @imagem_cronograma, @data_inicio, @data_fim,
      @fuso_horario, @formato, @local, @plataforma, @link_acesso,
      @inscricoes_abertas, @capacidade_maxima, @estado, @video_gravacao_url, @slides_url,
      @banner_ativo, @banner_texto, @banner_cta_texto, @banner_cta_link, @anuncio_inicio, @anuncio_fim,
      datetime('now'), datetime('now')
    )
  `);

  const info = stmt.run({
    slug:               input.slug,
    titulo:             input.titulo,
    subtitulo:          input.subtitulo ?? null,
    descricao_curta:    input.descricao_curta ?? null,
    descricao_longa:    input.descricao_longa ?? null,
    icone:              input.icone ?? 'webinar',
    imagem_destaque:    input.imagem_destaque ?? null,
    imagem_cartaz:      input.imagem_cartaz ?? null,
    imagem_cronograma:  input.imagem_cronograma ?? null,
    data_inicio:        input.data_inicio,
    data_fim:           input.data_fim ?? null,
    fuso_horario:       input.fuso_horario ?? 'Europe/Lisbon',
    formato:            input.formato ?? 'online',
    local:              input.local ?? null,
    plataforma:         input.plataforma ?? null,
    link_acesso:        input.link_acesso ?? null,
    inscricoes_abertas: input.inscricoes_abertas ? 1 : 0,
    capacidade_maxima:  input.capacidade_maxima ?? null,
    estado:             input.estado ?? 'rascunho',
    video_gravacao_url: input.video_gravacao_url ?? null,
    slides_url:         input.slides_url ?? null,
    banner_ativo:       input.banner_ativo ? 1 : 0,
    banner_texto:       input.banner_texto ?? null,
    banner_cta_texto:   input.banner_cta_texto ?? 'Inscrever',
    banner_cta_link:    input.banner_cta_link ?? null,
    anuncio_inicio:     input.anuncio_inicio ?? null,
    anuncio_fim:        input.anuncio_fim ?? null,
  });

  return Number(info.lastInsertRowid);
}

export function deleteEvento(id: number): boolean {
  const info = db.prepare(`DELETE FROM eventos WHERE id = ?`).run(id);
  return info.changes > 0;
}

export function updateEvento(id: number, fields: Partial<Omit<Evento, 'id' | 'created_at' | 'updated_at'>>): void {
  // 1. Obter valores antigos caso slug, titulo, data_inicio ou descricao_curta estejam a mudar
  const old = db.prepare(`SELECT slug, titulo, data_inicio, descricao_curta FROM eventos WHERE id = ?`).get(id) as {
    slug: string;
    titulo: string;
    data_inicio: string;
    descricao_curta: string | null;
  } | undefined;

  // Normalizar campos booleanos se passados de forma incompleta ou como boolean
  const payload = { ...fields } as Record<string, any>;
  if (fields.inscricoes_abertas !== undefined) payload.inscricoes_abertas = fields.inscricoes_abertas ? 1 : 0;
  if (fields.banner_ativo !== undefined) payload.banner_ativo = fields.banner_ativo ? 1 : 0;

  const sets = Object.keys(payload).map(k => `${k} = @${k}`).join(', ');
  if (!sets) return;

  db.prepare(`UPDATE eventos SET ${sets}, updated_at = datetime('now') WHERE id = @id`)
    .run({ ...payload, id });

  // 2. Sincronizar com os posts do feed se for alterado slug, titulo, data_inicio ou descricao_curta
  if (old && (fields.slug !== undefined || fields.titulo !== undefined || fields.data_inicio !== undefined || fields.descricao_curta !== undefined)) {
    const newSlug = fields.slug ?? old.slug;
    const newTitulo = fields.titulo ?? old.titulo;
    const newDesc = fields.descricao_curta !== undefined ? fields.descricao_curta : old.descricao_curta;
    const newDate = fields.data_inicio ?? old.data_inicio;

    const postsToSync = db.prepare(`
      SELECT id, source_url, embed_json FROM posts
      WHERE type = 'evento'
        AND (source_url LIKE ? OR source_url LIKE ?)
    `).all(`%/eventos/${old.slug}`, `%/eventos/${old.slug}`) as Array<{ id: number; source_url: string | null; embed_json: string | null }>;

    for (const p of postsToSync) {
      let newUrl = p.source_url;
      if (p.source_url && fields.slug !== undefined) {
        newUrl = p.source_url.replace(new RegExp(`\/eventos\/${old.slug}$`), `/eventos/${newSlug}`);
      }

      let embedObj: Record<string, any> = {};
      try {
        if (p.embed_json) embedObj = JSON.parse(p.embed_json);
      } catch { /* noop */ }

      embedObj.date_iso = newDate;
      embedObj.rsvp_url = newUrl;

      db.prepare(`
        UPDATE posts
        SET title = ?, excerpt = ?, source_url = ?, embed_json = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(newTitulo, newDesc, newUrl, JSON.stringify(embedObj), p.id);
    }
  }
}

export function hashIp(ip: string): string {
  const salt = process.env.PDW_IP_SALT ?? 'pdw-events-ip-salt';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export interface CreateInscricaoInput {
  evento_id: number;
  nome: string;
  email: string;
  organizacao?: string | null;
  cargo?: string | null;
  tipo_participante: string;
  interesse_principal?: string | null;
  consentimento: boolean;
  pergunta_speakers?: string | null;
  telemovel?: string | null;
  whatsapp_consent?: boolean;
  origem?: string | null;
  ip_hash?: string | null;
  lang?: string;
}

export interface Inscricao {
  id: number;
  evento_id: number;
  evento_titulo: string;
  nome: string;
  email: string;
  organizacao: string | null;
  tipo_participante: string;
  interesse_principal: string | null;
  pergunta_speakers: string | null;
  telemovel: string | null;
  whatsapp_consent: boolean;
  consentimento: boolean;
  origem: string | null;
  lang: string;
  created_at: string;
}

export interface InscricaoComEvento extends Inscricao {
  evento_data_inicio: string;
  evento_plataforma: string | null;
}

export function listInscricoes(eventoId?: number): Inscricao[] {
  const rows = eventoId
    ? db.prepare(`
        SELECT ei.*, e.titulo AS evento_titulo
        FROM evento_inscricoes ei
        JOIN eventos e ON e.id = ei.evento_id
        WHERE ei.evento_id = ?
        ORDER BY ei.created_at DESC
      `).all(eventoId)
    : db.prepare(`
        SELECT ei.*, e.titulo AS evento_titulo
        FROM evento_inscricoes ei
        JOIN eventos e ON e.id = ei.evento_id
        ORDER BY ei.created_at DESC
      `).all();

  return (rows as Record<string, unknown>[]).map((r) => ({
    ...(r as unknown as Inscricao),
    whatsapp_consent: !!r.whatsapp_consent,
    consentimento:    !!r.consentimento,
    lang:             (r.lang as string) || 'pt',
  }));
}

export function createInscricao(input: CreateInscricaoInput): number {
  const info = db.prepare(`
    INSERT INTO evento_inscricoes
      (evento_id, nome, email, organizacao, cargo, tipo_participante,
       interesse_principal, consentimento, pergunta_speakers,
       telemovel, whatsapp_consent, origem, ip_hash, lang)
    VALUES
      (@evento_id, @nome, @email, @organizacao, @cargo, @tipo_participante,
       @interesse_principal, @consentimento, @pergunta_speakers,
       @telemovel, @whatsapp_consent, @origem, @ip_hash, @lang)
  `).run({
    evento_id:           input.evento_id,
    nome:                input.nome,
    email:               input.email,
    organizacao:         input.organizacao ?? null,
    cargo:               input.cargo ?? null,
    tipo_participante:   input.tipo_participante,
    interesse_principal: input.interesse_principal ?? null,
    consentimento:       input.consentimento ? 1 : 0,
    pergunta_speakers:   input.pergunta_speakers ?? null,
    telemovel:           input.telemovel ?? null,
    whatsapp_consent:    input.whatsapp_consent ? 1 : 0,
    origem:              input.origem ?? null,
    ip_hash:             input.ip_hash ?? null,
    lang:                input.lang === 'en' ? 'en' : 'pt',
  });
  return Number(info.lastInsertRowid);
}

export function getInscricaoById(id: number): InscricaoComEvento | null {
  const r = db.prepare(`
    SELECT ei.*, e.titulo AS evento_titulo, e.data_inicio AS evento_data_inicio, e.plataforma AS evento_plataforma
    FROM evento_inscricoes ei
    JOIN eventos e ON e.id = ei.evento_id
    WHERE ei.id = ?
  `).get(id) as Record<string, unknown> | undefined;
  if (!r) return null;
  return {
    ...(r as unknown as InscricaoComEvento),
    whatsapp_consent: !!r.whatsapp_consent,
    consentimento:    !!r.consentimento,
    lang:             (r.lang as string) || 'pt',
  };
}

export function deleteInscricao(id: number): boolean {
  const info = db.prepare(`DELETE FROM evento_inscricoes WHERE id = ?`).run(id);
  return info.changes > 0;
}
