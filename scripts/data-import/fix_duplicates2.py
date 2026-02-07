import re

# Ler o arquivo
with open('import-data.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Remover TODAS as cláusulas AND company_id restantes do WHERE NOT EXISTS (com diferentes espaçamentos)
content = re.sub(
    r"\s+AND\s+company_id\s*=\s*\(SELECT id FROM companies WHERE name = '[^']+'\)",
    "",
    content,
    flags=re.MULTILINE
)

# Garantir que todos os clientes usem 'JJ' como company_id (já que são compartilhados)
# Mudar todas as referências de 'Designer 4 You' para 'JJ' nos INSERTs de clients
content = re.sub(
    r"\(SELECT id FROM companies WHERE name = 'Designer 4 You'\)",
    "(SELECT id FROM companies WHERE name = 'JJ')",
    content
)

# Escrever de volta
with open('import-data.sql', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed remaining AND company_id clauses and changed all clients to use JJ company")
