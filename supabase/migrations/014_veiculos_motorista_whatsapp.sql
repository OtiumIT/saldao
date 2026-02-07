-- WhatsApp do motorista (para botões que abrem chat com mensagem pré-definida)
ALTER TABLE veiculos
  ADD COLUMN IF NOT EXISTS motorista_whatsapp TEXT;

COMMENT ON COLUMN veiculos.motorista_whatsapp IS 'Número do WhatsApp do motorista (ex: 5511999999999). Usado para links wa.me com mensagem.';
