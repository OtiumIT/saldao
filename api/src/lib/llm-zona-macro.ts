/**
 * Usa LLM (OpenAI) para sugerir macro-região de um bairro em São Paulo.
 * Chamado apenas em scripts (nunca no fluxo do usuário).
 */

const MACROS_VALIDAS = ['ZL 1', 'ZL 2', 'ZL 3', 'ZL 4', 'Grande SP'] as const;

function normalizarResposta(s: string): string | null {
  const t = s.trim();
  for (const m of MACROS_VALIDAS) {
    if (t === m || t.toLowerCase() === m.toLowerCase()) return m;
  }
  return null;
}

/**
 * Pergunta ao LLM em qual macro-região o bairro fica.
 * Requer OPENAI_API_KEY.
 */
export async function sugerirMacroPorBairro(
  bairro: string,
  apiKey: string
): Promise<string | null> {
  if (!apiKey?.trim() || !bairro?.trim()) return null;

  const system = `Você classifica bairros de São Paulo e região em macro-regiões logísticas.
Macro-regiões válidas (responda APENAS com uma delas, nada mais):
- ZL 1: Central/Consolidada (Água Rasa, Aricanduva, Brás, Mooca, Vila Carrão, Vila Formosa, Vila Matilde, Vila Prudente)
- ZL 2: Eixo Sapopemba/Vila Ema (conjuntos habitacionais, Fazenda da Juta, Sinhá, Vila Bancária, Vila Rica)
- ZL 3: Eixo Itaquera/Carmo/Líder (Cidade Líder, Parque do Carmo, Jardim Catarina, Nova Nazaré)
- ZL 4: Extremo Leste/Divisas (Cidade Satélite Santa Bárbara, Jardim Ângela, Parque dos Bancários, Parque João Ramalho)
- Grande SP: Fora da capital (Guarulhos, Osasco, etc.)

Responda APENAS com o código da macro (ex: ZL 2), sem explicação.`;

  const user = `Em qual macro-região fica o bairro "${bairro.trim()}" em São Paulo?`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.1,
      max_tokens: 30,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim() ?? '';
  return normalizarResposta(content);
}
