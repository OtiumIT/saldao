/**
 * Geocoding via Nominatim (OpenStreetMap) - gratuito, sem API key.
 * Fallback para Google Maps quando Nominatim falha (mais preciso para SP).
 * Respeita limite de 1 req/segundo (Usage Policy) no Nominatim.
 */
export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name?: string;
}

const USER_AGENT = 'SaldaoMoveisJerusalem/1.0 (gestao@saldaomoveisjerusalem.com.br)';

/** Indica se o endereço já menciona região da Grande SP (evita adicionar São Paulo). */
function temRegiaoGrandeSP(q: string): boolean {
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
    s.includes('são caetano') ||
    s.includes('diadema') ||
    s.includes('mauá') ||
    s.includes('taboão') ||
    s.includes('embu') ||
    s.includes('cotia') ||
    s.includes('santana de parnaíba') ||
    s.includes('barueri') ||
    s.includes('carapicuíba') ||
    s.includes('itaquaquecetuba') ||
    s.includes('ferraz de vasconcelos') ||
    s.includes('poá') ||
    s.includes('suzano') ||
    s.includes('mogi das cruzes') ||
    s.includes('santa isabel') ||
    s.includes('guararema') ||
    s.includes('jacareí') ||
    s.includes('são josé dos campos')
  );
}

/** Grande SP + Vale: lat -24.2 a -22.8, lon -47.5 a -44. Rio fica fora (lon ~-43). */
function estaNaGrandeSP(lat: number, lon: number): boolean {
  return lat >= -24.2 && lat <= -22.8 && lon >= -47.5 && lon <= -44;
}

export async function geocodeOne(address: string): Promise<GeocodeResult | null> {
  if (!address?.trim()) return null;
  try {
    const q = address.trim();
    const searchQuery = temRegiaoGrandeSP(q)
      ? (q.toLowerCase().includes('brasil') ? q : `${q}, Brasil`)
      : `${q}, São Paulo, Brasil`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && data.length > 0) {
      const item = data[0] as { lat?: string; lon?: string; display_name?: string };
      const lat = parseFloat(String(item.lat ?? 0));
      const lon = parseFloat(String(item.lon ?? 0));
      if (!estaNaGrandeSP(lat, lon)) return null;
      return { lat, lon, display_name: item.display_name };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Geocodifica um endereço: tenta Nominatim, se falhar usa Google (quando apiKey disponível).
 */
export async function geocodeOneWithFallback(
  address: string,
  googleApiKey?: string | null
): Promise<GeocodeResult | null> {
  let r = await geocodeOne(address);
  if (!r && googleApiKey?.trim()) {
    const { geocodeAddressToLatLon } = await import('../../lib/google-maps.js');
    const geo = await geocodeAddressToLatLon(googleApiKey, address);
    if (geo) r = { lat: geo.lat, lon: geo.lon };
  }
  return r;
}

/** Geocodifica vários endereços com delay de 1.1s entre cada (limite Nominatim). */
export async function geocodeBatch(
  addresses: string[],
  googleApiKey?: string | null
): Promise<Record<string, { lat: number; lon: number; display_name?: string }>> {
  const results: Record<string, { lat: number; lon: number; display_name?: string }> = {};
  const unique = [...new Set(addresses.filter((a) => a?.trim()))];
  for (let i = 0; i < unique.length; i++) {
    const addr = unique[i]!;
    const r = await geocodeOneWithFallback(addr, googleApiKey);
    if (r) results[addr] = { lat: r.lat, lon: r.lon, display_name: r.display_name };
    if (i < unique.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }
  return results;
}
