-- migrations/006_inscricoes_lang.sql
-- Adiciona coluna de idioma à tabela de inscrições para personalizar emails por língua.
ALTER TABLE evento_inscricoes ADD COLUMN lang TEXT DEFAULT 'pt';
