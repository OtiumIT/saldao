import re

# Ler o arquivo
with open('import-data.sql', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Processar linha por linha para mudar company_id dos clients para JJ
output = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Se encontrou INSERT INTO clients, processar o bloco
    if 'INSERT INTO clients' in line:
        # Adicionar a linha do INSERT
        output.append(line)
        i += 1
        
        # Processar as próximas linhas até encontrar WHERE NOT EXISTS
        while i < len(lines) and 'WHERE NOT EXISTS' not in lines[i]:
            processed_line = lines[i]
            
            # Mudar Designer 4 You para JJ apenas nos INSERTs de clients
            if 'Designer 4 You' in processed_line:
                processed_line = processed_line.replace('Designer 4 You', 'JJ')
            
            output.append(processed_line)
            i += 1
        
        # Adicionar a linha WHERE NOT EXISTS e as seguintes
        while i < len(lines) and 'RETURNING' not in lines[i]:
            output.append(lines[i])
            i += 1
        
        # Adicionar RETURNING
        if i < len(lines):
            output.append(lines[i])
            i += 1
    else:
        output.append(line)
        i += 1

# Escrever de volta
with open('import-data.sql', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("Changed all clients company_id to JJ")
