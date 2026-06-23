-- migrations/007_webinar_link_acesso.sql
-- Define o link de acesso Zoom para o webinar-pdw na base de dados.
UPDATE eventos
SET link_acesso = 'https://us02web.zoom.us/j/85469234422?pwd=ruHNC6dxcI6RMkSsP1KmKNOFY2nNxT.1'
WHERE slug = 'webinar-pdw'
  AND (link_acesso IS NULL OR link_acesso = '');
