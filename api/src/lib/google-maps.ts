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
