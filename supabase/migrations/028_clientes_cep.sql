-- CEP em clientes: armazenar CEP do endereço de entrega
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cep TEXT;
