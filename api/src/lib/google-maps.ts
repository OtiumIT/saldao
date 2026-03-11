/**
 * Google Distance Matrix API — retorna distância em km entre origem e destino (endereços).
 * Usado para cálculo de frete na venda.
 */

export interface CalcularDistanciaResult {
  km: number;
}

export async function calcularDistanciaKm(
  apiKey: string,
  enderecoOrigem: string,
  enderecoDestino: string
): Promise<CalcularDistanciaResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Distância por endereço não configurada. Configure GOOGLE_MAPS_API_KEY e ENDERECO_ORIGEM_LOJA.');
  }
  if (!enderecoOrigem || !enderecoOrigem.trim()) {
    throw new Error('Endereço da loja não configurado (ENDERECO_ORIGEM_LOJA).');
  }

  const params = new URLSearchParams({
    origins: enderecoOrigem.trim(),
    destinations: enderecoDestino.trim(),
    key: apiKey.trim(),
    units: 'metric',
  });
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    rows?: Array<{
      elements: Array<{
        status: string;
        distance?: { value: number; text: string };
      }>;
    }>;
  };

  if (data.status !== 'OK') {
    throw new Error(data.status === 'REQUEST_DENIED' ? 'Chave do Google Maps inválida ou não habilitada.' : 'Não foi possível calcular a distância.');
  }
  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK' || element.distance == null) {
    throw new Error('Endereço de entrega não encontrado ou inacessível. Verifique e tente novamente.');
  }
  const km = Math.round((element.distance.value / 1000) * 10) / 10;
  return { km };
}

/** Indica se o endereço já menciona cidade/estado (evita adicionar São Paulo). */
function temCidadeEstado(q: string): boolean {
  const s = q.toLowerCase();
  return (
    s.includes('são paulo') ||
    s.includes('sao paulo') ||
    s.includes('s.paulo') ||
    /\bsp\b/.test(s) ||
    s.includes('guarulhos') ||
    s.includes('osasco') ||
    s.includes('santo andré') ||
    s.includes('são bernardo') ||
    s.includes('diadema') ||
    s.includes('mauá') ||
    s.includes('taboão') ||
    s.includes('embu') ||
    s.includes('cotia') ||
    s.includes('santana de parnaíba') ||
    s.includes('barueri') ||
    s.includes('carapicuíba') ||
    s.includes('itaquaquecetuba') ||
    s.includes('ferraz') ||
    s.includes('suzano') ||
    s.includes('mogi') ||
    s.includes('são josé dos campos')
  );
}

/** Correções de grafia comuns em ruas de São Paulo (ex.: Mineiros → Minérios). */
const CORRECOES_RUAS: Array<[RegExp, string]> = [
  [/rua\s+mineiros\s+atômicos/gi, 'Rua Minérios Atômicos'],
  [/rua\s+minerios\s+atomicos/gi, 'Rua Minérios Atômicos'],
  [/guido\s+fiderici/gi, 'Guido Fidericci'],
  [/guido\s+federicci/gi, 'Guido Fidericci'],
  [/rua\s+joão\s+do\s+paraíso/gi, 'Rua São João do Paraíso'],
  [/rua\s+joao\s+do\s+paraiso/gi, 'Rua São João do Paraíso'],
];

function aplicarCorrecoesEndereco(endereco: string): string {
  let e = endereco.trim();
  for (const [re, sub] of CORRECOES_RUAS) {
    e = e.replace(re, sub);
  }
  return e;
}

function formatarEnderecoParaGeocode(endereco: string): string {
  const e = aplicarCorrecoesEndereco(endereco);
  if (temCidadeEstado(e)) return `${e}, Brasil`;
  return `${e}, São Paulo, SP, Brasil`;
}

/** Bounds da Grande São Paulo para priorizar resultados na região de entrega. */
const BOUNDS_GRANDE_SP = '-24.0,-47.5|-22.8,-44.0';

/**
 * Google Geocoding API — extrai CEP (postal_code) de um endereço.
 * Usado para preencher o campo CEP no caixa quando "Calcular km" retorna sucesso.
 */
export async function geocodeAddressToCep(
  apiKey: string,
  endereco: string
): Promise<string | null> {
  if (!apiKey?.trim() || !endereco?.trim()) return null;
  const params = new URLSearchParams({
    address: formatarEnderecoParaGeocode(endereco),
    key: apiKey.trim(),
    region: 'br',
    bounds: BOUNDS_GRANDE_SP,
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  const postal = data.results[0].address_components?.find((c) =>
    c.types.includes('postal_code')
  );
  if (!postal?.long_name) return null;
  const cep = postal.long_name.replace(/\D/g, '').slice(0, 8);
  return cep.length === 8 ? cep : null;
}

/**
 * Google Geocoding API — retorna lat/lon de um endereço.
 * Usado como fallback quando Nominatim falha.
 */
export async function geocodeAddressToLatLon(
  apiKey: string,
  endereco: string
): Promise<{ lat: number; lon: number } | null> {
  if (!apiKey?.trim() || !endereco?.trim()) return null;
  const params = new URLSearchParams({
    address: formatarEnderecoParaGeocode(endereco),
    key: apiKey.trim(),
    region: 'br',
    bounds: BOUNDS_GRANDE_SP,
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      geometry?: { location?: { lat: number; lng: number } };
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) return null;
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lon: lng };
}

/**
 * Google Geocoding API — retorna endereço formatado completo (formatted_address) e CEP.
 * Usado para enriquecer o campo de endereço no cadastro da venda.
 */
export async function geocodeAddressEnriquecido(
  apiKey: string,
  endereco: string
): Promise<{ endereco_formatado: string; cep: string | null } | null> {
  if (!apiKey?.trim() || !endereco?.trim()) return null;
  const params = new URLSearchParams({
    address: formatarEnderecoParaGeocode(endereco),
    key: apiKey.trim(),
    region: 'br',
    bounds: BOUNDS_GRANDE_SP,
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      address_components?: Array<{
        long_name: string;
        types: string[];
      }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  const r = data.results[0];
  const formatted = r.formatted_address?.trim();
  if (!formatted) return null;
  const postal = r.address_components?.find((c) => c.types.includes('postal_code'));
  const cep = postal?.long_name
    ? postal.long_name.replace(/\D/g, '').slice(0, 8)
    : null;
  return {
    endereco_formatado: formatted,
    cep: cep && cep.length === 8 ? cep : null,
  };
}

export interface ReverseGeocodeBairroResult {
  bairro: string | null;
  /** Micro-região (ex.: Leste 1, Leste 2, Sudeste). Em SP: mapeado de subprefeitura. */
  microRegiao: string | null;
}

/** Mapeamento subprefeitura/distrito SP → micro-região (Leste 1, Leste 2, etc.). */
const SUBPREF_SP_TO_MICRO_REGIAO: Record<string, string> = {
  'ermelino matarazzo': 'Leste 1',
  itaquera: 'Leste 1',
  penha: 'Leste 1',
  'são mateus': 'Leste 1',
  'sao mateus': 'Leste 1',
  'cidade tiradentes': 'Leste 2',
  'itaim paulista': 'Leste 2',
  guaianases: 'Leste 2',
  'são miguel paulista': 'Leste 2',
  'sao miguel paulista': 'Leste 2',
  aricanduva: 'Sudeste',
  carrão: 'Sudeste',
  'vila formosa': 'Sudeste',
  ipiranga: 'Sudeste',
  mooca: 'Sudeste',
  'vila prudente': 'Sudeste',
  sapopemba: 'Sudeste',
  'sé': 'Centro',
  se: 'Centro',
  'bela vista': 'Centro',
  'bom retiro': 'Centro',
  cambuci: 'Centro',
  consolação: 'Centro',
  consolacao: 'Centro',
  liberdade: 'Centro',
  república: 'Centro',
  republica: 'Centro',
  'santa cecília': 'Centro',
  'santa cecilia': 'Centro',
  butantã: 'Oeste',
  butanta: 'Oeste',
  lapa: 'Oeste',
  pinheiros: 'Oeste',
  'casa verde': 'Nordeste',
  cachoeirinha: 'Nordeste',
  'jaçanã': 'Nordeste',
  jacana: 'Nordeste',
  tremembé: 'Nordeste',
  tremembe: 'Nordeste',
  santana: 'Nordeste',
  tucuruvi: 'Nordeste',
  'vila maria': 'Nordeste',
  'vila guilherme': 'Nordeste',
  'freguesia do ó': 'Noroeste',
  'freguesia do o': 'Noroeste',
  brasilândia: 'Noroeste',
  brasilandia: 'Noroeste',
  perus: 'Noroeste',
  pirituba: 'Noroeste',
  jaraguá: 'Noroeste',
  jaragua: 'Noroeste',
  jabaquara: 'Centro-Sul',
  'santo amaro': 'Centro-Sul',
  'vila mariana': 'Centro-Sul',
  'campo limpo': 'Sul',
  'capela do socorro': 'Sul',
  'cidade ademar': 'Sul',
  "m'boi mirim": 'Sul',
  'mboi mirim': 'Sul',
  parelheiros: 'Sul',
};

function normalizeForLookup(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

function subprefeituraToMicroRegiaoSP(nome: string): string | null {
  const n = normalizeForLookup(nome);
  for (const [key, value] of Object.entries(SUBPREF_SP_TO_MICRO_REGIAO)) {
    if (normalizeForLookup(key) === n) return value;
  }
  return null;
}

/**
 * Reverse geocode: lat/lon → bairro + micro-região.
 * Bairro: neighborhood, sublocality_level_2 ou sublocality.
 * Micro-região: em SP, mapeia sublocality_level_1 para Leste 1, Leste 2, etc.
 * Usado para zona_entrega e micro_regiao_entrega nos pedidos.
 */
export async function reverseGeocodeToBairroEMicroRegiao(
  apiKey: string,
  lat: number,
  lon: number
): Promise<ReverseGeocodeBairroResult> {
  if (!apiKey?.trim()) return { bairro: null, microRegiao: null };
  const params = new URLSearchParams({
    latlng: `${lat},${lon}`,
    key: apiKey.trim(),
    language: 'pt-BR',
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      address_components?: Array<{ long_name: string; types: string[] }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.length) return { bairro: null, microRegiao: null };

  let bairro: string | null = null;
  let sublocalityLevel1: string | null = null;

  for (const result of data.results) {
    const comps = result.address_components ?? [];
    for (const c of comps) {
      const name = c.long_name?.trim();
      if (!name) continue;
      if (c.types.includes('sublocality_level_1')) {
        sublocalityLevel1 = sublocalityLevel1 ?? name;
      }
      if (
        (c.types.includes('neighborhood') ||
          c.types.includes('sublocality_level_2') ||
          (c.types.includes('sublocality') && !c.types.includes('sublocality_level_1'))) &&
        !bairro
      ) {
        bairro = name;
      }
    }
    if (bairro && sublocalityLevel1) break;
  }

  if (!bairro) {
    const first = data.results[0].address_components ?? [];
    const fallback =
      first.find((c) =>
        c.types.some((t) =>
          ['sublocality', 'sublocality_level_1', 'neighborhood', 'administrative_area_level_2'].includes(t)
        )
      )?.long_name ?? null;
    bairro = fallback?.trim() || null;
  }

  const microRegiao =
    (sublocalityLevel1 && subprefeituraToMicroRegiaoSP(sublocalityLevel1)) || sublocalityLevel1 || null;

  return {
    bairro: bairro || null,
    microRegiao,
  };
}

/**
 * Reverse geocode: lat/lon → bairro/região (compatibilidade).
 * Usado para zona_entrega nos pedidos.
 */
export async function reverseGeocodeToBairro(
  apiKey: string,
  lat: number,
  lon: number
): Promise<string | null> {
  const { bairro } = await reverseGeocodeToBairroEMicroRegiao(apiKey, lat, lon);
  return bairro;
}

/**
 * Reverse geocode: lat/lon → estado (short_name, ex.: "SP", "RJ").
 */
export async function reverseGeocodeToState(
  apiKey: string,
  lat: number,
  lon: number
): Promise<string | null> {
  if (!apiKey?.trim()) return null;
  const params = new URLSearchParams({
    latlng: `${lat},${lon}`,
    key: apiKey.trim(),
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      address_components?: Array<{ short_name: string; types: string[] }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  const admin = data.results[0].address_components?.find((c) =>
    c.types.includes('administrative_area_level_1')
  );
  return admin?.short_name ?? null;
}

/**
 * Geocode sem forçar São Paulo — usa apenas ", Brasil".
 * Para endereços fora de SP que foram incorretamente geocodificados.
 */
export async function geocodeAddressEnriquecidoBrasil(
  apiKey: string,
  endereco: string
): Promise<{ endereco_formatado: string; cep: string | null; lat: number; lon: number } | null> {
  if (!apiKey?.trim() || !endereco?.trim()) return null;
  const e = aplicarCorrecoesEndereco(endereco);
  const query = e.toLowerCase().includes('brasil') ? e : `${e}, Brasil`;
  const params = new URLSearchParams({
    address: query,
    key: apiKey.trim(),
    region: 'br',
  });
  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
      address_components?: Array<{ long_name: string; types: string[] }>;
    }>;
  };
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  const r = data.results[0];
  const formatted = r.formatted_address?.trim();
  const loc = r.geometry?.location;
  if (!formatted || !loc) return null;
  const postal = r.address_components?.find((c) => c.types.includes('postal_code'));
  const cep = postal?.long_name
    ? postal.long_name.replace(/\D/g, '').slice(0, 8)
    : null;
  return {
    endereco_formatado: formatted,
    cep: cep && cep.length === 8 ? cep : null,
    lat: loc.lat,
    lon: loc.lng,
  };
}
