/**
 * Mapeamento zona_entrega (bairro) → macro-região para logística de entregas.
 * Usado para preencher micro_regiao_entrega quando o reverse geocode retorna
 * o mesmo valor que zona, ou para sobrescrever com classificação logística customizada.
 *
 * Carrega também api/data/zona-macro-overrides.json (sugestões LLM ou manuais).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERRIDES_PATH = join(__dirname, '../../data/zona-macro-overrides.json');

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

/** Chave normalizada → macro-região. Classificação completa (59 zonas) por Gemini. */
const ZONA_TO_MACRO: Record<string, string> = {
  // Zona Leste 1 (Central / Consolidada)
  'agua rasa': 'ZL 1',
  'água rasa': 'ZL 1',
  aricanduva: 'ZL 1',
  bras: 'ZL 1',
  mooca: 'ZL 1',
  'vila carrão': 'ZL 1',
  'vila carrao': 'ZL 1',
  'vila dalila': 'ZL 1',
  'vila formosa': 'ZL 1',
  'jardim vila formosa': 'ZL 1',
  'vila matilde': 'ZL 1',
  'vila prudente': 'ZL 1',
  'jardim vila carrao': 'ZL 1',
  'jardim vila carrão': 'ZL 1',
  'jardim haia do carrao': 'ZL 1',
  'jardim haia do carrão': 'ZL 1',
  'vila moreira': 'ZL 1',

  // Zona Leste 2 (Eixo Sapopemba / Vila Ema)
  'chácara belenzinho': 'ZL 2',
  'chacara belenzinho': 'ZL 2',
  'conjunto habitacional barreira grande': 'ZL 2',
  'conjunto habitacional marechal mascarenhas de morais': 'ZL 2',
  'conjunto habitacional teotonio vilela': 'ZL 2',
  'conjunto habitacional teotônio vilela': 'ZL 2',
  'conjunto promorar sapopemba': 'ZL 2',
  'fazenda da juta': 'ZL 2',
  'jardim colorado': 'ZL 2',
  'jardim dona sinha': 'ZL 2',
  'jardim dona sinhá': 'ZL 2',
  'jardim egle': 'ZL 2',
  'jardim elba': 'ZL 2',
  'jardim iva': 'ZL 2',
  'jardim nice': 'ZL 2',
  'jardim paraguacu': 'ZL 2',
  'jardim paraguaçu': 'ZL 2',
  'jardim sapopemba': 'ZL 2',
  'vila sapopemba': 'ZL 2',
  'jardim tango': 'ZL 2',
  'jardim tiete': 'ZL 2',
  'parque santa madalena': 'ZL 2',
  sinha: 'ZL 2',
  'vila bancaria': 'ZL 2',
  'vila bancária': 'ZL 2',
  'vila bela': 'ZL 2',
  'vila ema': 'ZL 2',
  'vila rica': 'ZL 2',

  // Zona Leste 3 (Eixo Itaquera / Carmo / Líder)
  'cidade centenario': 'ZL 3',
  'cidade centenário': 'ZL 3',
  'cidade líder': 'ZL 3',
  'cidade lider': 'ZL 3',
  'jardim catarina': 'ZL 3',
  'jardim maringa': 'ZL 3',
  'jardim maringá': 'ZL 3',
  'jardim santa adelia': 'ZL 3',
  'jardim santa adélia': 'ZL 3',
  'jardim sao gabriel': 'ZL 3',
  'jardim são gabriel': 'ZL 3',
  'nova cidade': 'ZL 3',
  'nova nazare': 'ZL 3',
  'nova nazaré': 'ZL 3',
  'parque do carmo': 'ZL 3',
  'vila antonieta': 'ZL 3',
  'vila nova york': 'ZL 3',

  // Zona Leste 4 (Extremo Leste / Divisas)
  'boa vista': 'ZL 4',
  'cidade satelite santa barbara': 'ZL 4',
  'cidade satélite santa bárbara': 'ZL 4',
  gavea: 'ZL 4',
  'jardim angela (zona leste)': 'ZL 4',
  'jardim angela': 'ZL 4',
  'jardim ângela': 'ZL 4',
  'jardim dabril': 'ZL 4',
  'jardim das rosas (zona leste i)': 'ZL 4',
  'jardim das rosas': 'ZL 4',
  'jardim imperador (zona leste)': 'ZL 4',
  'jardim imperador': 'ZL 4',
  'jardim machado': 'ZL 4',
  'jardim santo antonio': 'ZL 4',
  'jardim santo antônio': 'ZL 4',
  'jardim tres marias': 'ZL 4',
  'jardim três marias': 'ZL 4',
  'parque dos bancarios': 'ZL 4',
  'parque dos bancários': 'ZL 4',
  'parque joão ramalho': 'ZL 4',
  'parque joao ramalho': 'ZL 4',
  'parque novo lar': 'ZL 4',
  'parque santo antonio': 'ZL 4',
  'parque santo antônio': 'ZL 4',

  // Grande São Paulo
  guarulhos: 'Grande SP',
};

function loadOverrides(): Record<string, string> {
  if (!existsSync(OVERRIDES_PATH)) return {};
  try {
    const raw = readFileSync(OVERRIDES_PATH, 'utf-8');
    const obj = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(
      Object.entries(obj).filter(([k, v]) => !k.startsWith('_') && typeof v === 'string')
    );
  } catch {
    return {};
  }
}

let _overridesCache: Record<string, string> | null = null;

function getOverrides(): Record<string, string> {
  if (_overridesCache === null) _overridesCache = loadOverrides();
  return _overridesCache;
}

/**
 * Adiciona mapeamento ao arquivo de overrides (ex.: sugestão LLM aprovada).
 * Atualiza o cache em memória.
 */
export function addZonaMacroOverride(zona: string, macro: string): void {
  const key = normalize(zona);
  if (!key || !macro?.trim()) return;
  const overrides = { ...getOverrides(), [key]: macro.trim() };
  const toSave: Record<string, string> = {};
  for (const [k, v] of Object.entries(overrides)) {
    if (!k.startsWith('_')) toSave[k] = v;
  }
  mkdirSync(dirname(OVERRIDES_PATH), { recursive: true });
  writeFileSync(OVERRIDES_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
  _overridesCache = overrides;
}

/**
 * Retorna a macro-região para uma zona (bairro) conhecida.
 * Usa normalização para ignorar acentos e variações de grafia.
 * Consulta mapeamento estático e overrides (LLM/manual).
 */
export function zonaToMacroRegiao(zona: string | null | undefined): string | null {
  if (!zona?.trim()) return null;
  const key = normalize(zona);
  return ZONA_TO_MACRO[key] ?? getOverrides()[key] ?? null;
}
