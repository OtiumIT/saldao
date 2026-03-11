/**
 * Geocoding via API (proxy para Nominatim) - evita CORS e 429.
 * A API respeita limite de 1 req/segundo do Nominatim.
 */
import { apiClient } from '../../../shared/lib/api-client';

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name?: string;
}

/** Geocodifica vários endereços via API (rate limit controlado no servidor). */
export async function geocodeAddresses(
  addresses: string[],
  onProgress?: (done: number, total: number) => void,
  token?: string | null
): Promise<Map<string, GeocodeResult>> {
  const unique = [...new Set(addresses.filter((a) => a?.trim()))];
  if (unique.length === 0) return new Map();

  if (!token) {
    throw new Error('Token necessário para geocodificar');
  }

  onProgress?.(0, unique.length);

  const response = await apiClient.post<{
    results: Record<string, { lat: number; lon: number; display_name?: string }>;
  }>('/api/geocode', { addresses: unique }, token);

  onProgress?.(unique.length, unique.length);

  const results = new Map<string, GeocodeResult>();
  for (const [addr, obj] of Object.entries(response.results ?? {})) {
    const r = { lat: obj.lat, lon: obj.lon, display_name: obj.display_name };
    results.set(addr, r);
    if (addr.trim() !== addr) results.set(addr.trim(), r);
  }
  return results;
}
