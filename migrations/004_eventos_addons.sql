-- migrations/004_eventos_addons.sql
-- Campos adicionais para webinar: telemóvel, WhatsApp, imagens, controlo do banner popup.

-- Inscrições: telemóvel + consentimento WhatsApp
ALTER TABLE evento_inscricoes ADD COLUMN telemovel      TEXT;
ALTER TABLE evento_inscricoes ADD COLUMN whatsapp_consent INTEGER DEFAULT 0;

-- Eventos: imagens visuais (cartaz + cronograma) + datas do popup de anúncio
ALTER TABLE eventos ADD COLUMN imagem_cartaz     TEXT;
ALTER TABLE eventos ADD COLUMN imagem_cronograma TEXT;
ALTER TABLE eventos ADD COLUMN anuncio_inicio    TEXT;
ALTER TABLE eventos ADD COLUMN anuncio_fim       TEXT;
