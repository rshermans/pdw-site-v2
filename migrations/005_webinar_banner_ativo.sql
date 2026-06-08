-- migrations/005_webinar_banner_ativo.sql
-- Activa o banner popup para o webinar PDW que foi inserido sem banner_ativo = 1.
UPDATE eventos
SET banner_ativo = 1
WHERE slug = 'webinar-pdw'
  AND banner_ativo = 0;
