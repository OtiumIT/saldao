/**
 * Script para classificar produtos em categorias (Cozinha, Quarto, Lavanderia, etc.)
 * usando regras por palavras-chave ou LLM (OpenAI) quando OPENAI_API_KEY está definida.
 *
 * Uso:
 *   API_URL=http://localhost:3055 TEST_EMAIL=... TEST_PASSWORD=... npx tsx scripts/classificar-categorias-produtos.ts
 *   API_URL=... API_TOKEN=Bearer ... npx tsx scripts/classificar-categorias-produtos.ts
 * Com LLM (recomendado para melhor precisão):
 *   OPENAI_API_KEY=sk-... API_URL=... TEST_EMAIL=... TEST_PASSWORD=... npx tsx scripts/classificar-categorias-produtos.ts
 *
 * Opções:
 *   DRY_RUN=1  — apenas exibe o que seria alterado, não envia PATCH
 */

async function loadEnv(): Promise<void> {
  try {
    const dotenv = (await import('dotenv')).default;
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    const apiEnvPath = join(process.cwd(), 'api', '.env');
    const rootEnvPath = join(process.cwd(), '.env');
    if (existsSync(apiEnvPath)) dotenv.config({ path: apiEnvPath });
    else if (existsSync(rootEnvPath)) dotenv.config({ path: rootEnvPath });
    dotenv.config();
  } catch {
    // dotenv não instalado na raiz; use variáveis de ambiente diretamente
  }
}

function getConfig(): {
  API_URL: string;
  API_TOKEN: string | undefined;
  TEST_EMAIL: string;
  TEST_PASSWORD: string;
  OPENAI_API_KEY: string;
  DRY_RUN: boolean;
} {
  return {
    API_URL: (process.env.API_URL || 'http://localhost:3055').replace(/\/$/, ''),
    API_TOKEN: process.env.API_TOKEN,
    TEST_EMAIL: process.env.TEST_EMAIL || '',
    TEST_PASSWORD: process.env.TEST_PASSWORD || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    DRY_RUN: process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true',
  };
}

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  categoria_id: string | null;
}

async function getToken(cfg: ReturnType<typeof getConfig>): Promise<string> {
  if (cfg.API_TOKEN) {
    const t = cfg.API_TOKEN.startsWith('Bearer ') ? cfg.API_TOKEN : `Bearer ${cfg.API_TOKEN}`;
    return t.replace(/^Bearer\s+/, '');
  }
  if (!cfg.TEST_EMAIL || !cfg.TEST_PASSWORD) {
    throw new Error('Defina API_TOKEN ou (TEST_EMAIL e TEST_PASSWORD) no ambiente.');
  }
  const res = await fetch(`${cfg.API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cfg.TEST_EMAIL, password: cfg.TEST_PASSWORD }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error || 'Login falhou');
  }
  return data.access_token;
}

async function apiGet<T>(path: string, token: string, apiUrl: string): Promise<T> {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPatch(path: string, body: object, token: string, apiUrl: string): Promise<void> {
  const res = await fetch(`${apiUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path}: ${res.status} ${text}`);
  }
}

/** Classificação por palavras-chave (fallback sem LLM) */
function classificarPorPalavras(descricao: string, categoriasPorNome: Map<string, Categoria>): string | null {
  const text = (descricao || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const keywords: Record<string, string[]> = {
    Cozinha: ['cozinha', 'fogao', 'geladeira', 'pia', 'balcao', 'armario cozinha', 'mesa cozinha', 'cuba', 'torneira cozinha', 'gaveteiro'],
    Quarto: ['quarto', 'cama', 'guarda-roupa', 'guarda roupa', 'comoda', 'cômoda', 'cabeceira', 'armario quarto', 'mesa de cabeceira'],
    Lavanderia: ['lavanderia', 'tanque', 'maquina lavar', 'lavadora', 'secadora', 'varal', 'sabao', 'amaciante'],
    Sala: ['sala', 'sofa', 'sofá', 'estante', 'rack', 'tv', 'mesa centro', 'mesa de centro', 'poltrona', 'aparador'],
    Escritório: ['escritorio', 'escritório', 'mesa escritorio', 'cadeira escritorio', 'gaveteiro escritorio', 'estante escritorio'],
    'Área de serviço': ['area de servico', 'área de serviço', 'area servico', 'servico'],
    'Insumo / Peça': ['insumo', 'peca', 'peça', 'parafuso', 'dobradica', 'dobrática', 'rolamento', 'mdf', 'chapa', 'ferragem'],
  };
  for (const [nomeCat, words] of Object.entries(keywords)) {
    const cat = categoriasPorNome.get(nomeCat);
    if (!cat) continue;
    for (const w of words) {
      if (text.includes(w)) return cat.id;
    }
  }
  return null;
}

/** Classificação via OpenAI (uma chamada em lote por até N produtos) */
async function classificarComLLM(
  produtos: Produto[],
  categorias: Categoria[],
  apiKey: string
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const catList = categorias.map((c) => c.nome).join(', ');
  const prodList = produtos
    .map((p) => `${p.id}: ${p.descricao} [tipo: ${p.tipo}]`)
    .join('\n');

  const system = `Você é um classificador de produtos de uma loja de móveis (Saldão de Móveis). 
Categorias disponíveis: ${catList}.
- Cozinha: fogões, geladeiras, pias, balcões, armários de cozinha, cubas, torneiras de cozinha.
- Quarto: camas, guarda-roupas, cômodas, cabeceiras, mesas de cabeceira.
- Lavanderia: tanques, máquinas de lavar, secadoras, varais.
- Sala: sofás, estantes, racks, mesas de centro, poltronas, aparadores.
- Escritório: mesas e cadeiras de escritório, gaveteiros de escritório.
- Área de serviço: itens típicos de área de serviço.
- Insumo / Peça: use para produtos do tipo "insumos" (parafusos, dobradiças, chapas, MDF, ferragens) ou peças avulsas que não são móveis prontos.

Dado uma lista de produtos no formato "id: descrição [tipo: revenda|insumos|fabricado]", associe cada um a exatamente uma das categorias acima. Se não couber em nenhuma, responda "null" para esse id.
Resposta APENAS um JSON object: { "uuid1": "Nome da Categoria", "uuid2": "null", ... } sem markdown nem texto extra.`;
  const user = `Produtos:\n${prodList}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.1,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim() || '{}';
  const cleaned = content.replace(/^```\w*\n?|\n?```$/g, '').trim();
  let obj: Record<string, string>;
  try {
    obj = JSON.parse(cleaned) as Record<string, string>;
  } catch {
    throw new Error('Resposta da OpenAI não é JSON válido: ' + content.slice(0, 200));
  }
  const nomeToId = new Map(categorias.map((c) => [c.nome.toLowerCase().trim(), c.id]));
  for (const p of produtos) {
    const v = obj[p.id];
    if (v == null || String(v).toLowerCase() === 'null') {
      results.set(p.id, null);
    } else {
      const id = nomeToId.get(String(v).toLowerCase().trim());
      results.set(p.id, id ?? null);
    }
  }
  return results;
}

async function main(): Promise<void> {
  await loadEnv();
  const cfg = getConfig();
  console.log('Classificação de categorias de produtos');
  console.log('API_URL:', cfg.API_URL);
  console.log('DRY_RUN:', cfg.DRY_RUN);
  console.log('Usar LLM (OpenAI):', !!cfg.OPENAI_API_KEY);
  console.log('');

  const token = await getToken(cfg);
  const [produtos, categorias] = await Promise.all([
    apiGet<Produto[]>('/api/produtos', token, cfg.API_URL),
    apiGet<Categoria[]>('/api/categorias-produto', token, cfg.API_URL),
  ]);
  const categoriasPorNome = new Map(categorias.map((c) => [c.nome, c]));

  console.log('Produtos carregados:', produtos.length);
  console.log('Categorias:', categorias.map((c) => c.nome).join(', '));
  console.log('');

  const updates: Array<{ produto: Produto; novaCategoriaId: string | null }> = [];
  const BATCH = 30;

  if (cfg.OPENAI_API_KEY) {
    for (let i = 0; i < produtos.length; i += BATCH) {
      const batch = produtos.slice(i, i + BATCH);
      const classified = await classificarComLLM(batch, categorias, cfg.OPENAI_API_KEY);
      for (const p of batch) {
        const novaId = classified.get(p.id) ?? null;
        if (novaId !== (p.categoria_id ?? null)) {
          updates.push({ produto: p, novaCategoriaId: novaId });
        }
      }
      if (i + BATCH < produtos.length) await new Promise((r) => setTimeout(r, 500));
    }
  } else {
    for (const p of produtos) {
      const novaId = classificarPorPalavras(p.descricao, categoriasPorNome);
      if (novaId !== (p.categoria_id ?? null)) {
        updates.push({ produto: p, novaCategoriaId: novaId });
      }
    }
  }

  console.log('Alterações a aplicar:', updates.length);
  for (const u of updates.slice(0, 20)) {
    const nomeCat = u.novaCategoriaId ? categorias.find((c) => c.id === u.novaCategoriaId)?.nome ?? u.novaCategoriaId : '(sem categoria)';
    console.log(`  ${u.produto.codigo} | ${u.produto.descricao.slice(0, 50)} → ${nomeCat}`);
  }
  if (updates.length > 20) console.log('  ... e mais', updates.length - 20);

  if (cfg.DRY_RUN || updates.length === 0) {
    console.log(cfg.DRY_RUN ? '\nDRY_RUN: nenhuma alteração enviada.' : '\nNada a atualizar.');
    return;
  }

  let ok = 0;
  let err = 0;
  for (const u of updates) {
    try {
      await apiPatch(`/api/produtos/${u.produto.id}`, { categoria_id: u.novaCategoriaId }, token, cfg.API_URL);
      ok++;
    } catch (e) {
      err++;
      console.error('Erro em', u.produto.codigo, e instanceof Error ? e.message : e);
    }
  }
  console.log('\nAtualizados:', ok, 'Erros:', err);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
