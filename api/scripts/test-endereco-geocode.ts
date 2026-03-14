/**
 * Testa as 3 ferramentas de endereço com o mesmo endereço para verificar consistência.
 *
 * 1. ViaCEP (cadastro cliente - "Buscar endereço" por CEP)
 * 2. Enriquecer (tela venda - "Enriquecer" / Google geocodeAddressEnriquecido)
 * 3. Geolocalização (mapa - geocodeBatch: Nominatim + Google)
 *
 * Uso: cd api && npx tsx scripts/test-endereco-geocode.ts [endereco]
 * Ex.: npx tsx scripts/test-endereco-geocode.ts "R. Tancredo Neves, 26 - Jardim Novo Carrao, São Paulo - SP, 03908-045, Brazil"
 */
import 'dotenv/config';
import { geocodeAddressEnriquecido, geocodeAddressToLatLon } from '../src/lib/google-maps.js';
import { geocodeOne, geocodeOneWithFallback } from '../src/modules/geocode/geocode.service.js';

const ENDERECO_PADRAO =
  'R. Tancredo Neves, 26 - Jardim Novo Carrao, São Paulo - SP, 03908-045, Brazil';

function extrairCep(endereco: string): string | null {
  const m = endereco.match(/\b(\d{5}-?\d{3})\b/);
  if (!m) return null;
  return m[1].replace(/\D/g, '');
}

async function testarViaCep(cep: string) {
  console.log('\n--- 1. ViaCEP (cadastro cliente - "Buscar endereço" por CEP) ---');
  console.log(`CEP: ${cep}`);
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const data = (await res.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (data.erro) {
    console.log('  ✗ CEP não encontrado no ViaCEP');
    return null;
  }
  const partes = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean);
  const enderecoViaCep = partes.join(', ');
  console.log(`  ✓ Endereço retornado: ${enderecoViaCep || '(vazio)'}`);
  return enderecoViaCep;
}

async function testarEnriquecer(endereco: string, apiKey: string) {
  console.log('\n--- 2. Enriquecer (tela venda - Google geocodeAddressEnriquecido) ---');
  console.log(`Entrada: ${endereco.slice(0, 70)}...`);
  const result = await geocodeAddressEnriquecido(apiKey, endereco);
  if (!result) {
    console.log('  ✗ Falhou (null)');
    return null;
  }
  console.log(`  ✓ Endereço formatado: ${result.endereco_formatado}`);
  console.log(`  ✓ CEP: ${result.cep ?? '(não encontrado)'}`);
  return result;
}

async function testarGeolocalizacao(endereco: string, apiKey: string | null) {
  console.log('\n--- 3. Geolocalização (mapa - Nominatim + Google fallback) ---');
  console.log(`Entrada: ${endereco.slice(0, 70)}...`);

  console.log('\n  3a. Nominatim (primeira tentativa):');
  const nominatim = await geocodeOne(endereco);
  if (nominatim) {
    console.log(`    ✓ lat: ${nominatim.lat}, lon: ${nominatim.lon}`);
  } else {
    console.log('    ✗ Nominatim não encontrou');
  }

  console.log('\n  3b. Google (fallback):');
  if (apiKey?.trim()) {
    const google = await geocodeAddressToLatLon(apiKey, endereco);
    if (google) {
      console.log(`    ✓ lat: ${google.lat}, lon: ${google.lon}`);
    } else {
      console.log('    ✗ Google não encontrou');
    }
  } else {
    console.log('    (GOOGLE_MAPS_API_KEY não configurada)');
  }

  console.log('\n  3c. geocodeOneWithFallback (usado pelo mapa):');
  const fallback = await geocodeOneWithFallback(endereco, apiKey);
  if (fallback) {
    console.log(`    ✓ lat: ${fallback.lat}, lon: ${fallback.lon}`);
  } else {
    console.log('    ✗ Nenhum dos dois encontrou');
  }

  return fallback;
}

async function main() {
  const endereco = process.argv[2]?.trim() || ENDERECO_PADRAO;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() ?? null;

  console.log('========================================');
  console.log('TESTE DE CONSISTÊNCIA - ENDEREÇO / GEOLOCALIZAÇÃO');
  console.log('========================================');
  console.log(`\nEndereço de teste:\n  ${endereco}`);

  const cep = extrairCep(endereco);
  if (cep) {
    await testarViaCep(cep);
  } else {
    console.log('\n--- 1. ViaCEP ---');
    console.log('  (CEP não encontrado no endereço, pulando)');
  }

  if (!apiKey) {
    console.log('\n⚠ GOOGLE_MAPS_API_KEY não configurada no .env');
    console.log('  Testes 2 e 3b/3c usarão apenas Nominatim onde aplicável.');
  }

  const enriquecido = await testarEnriquecer(endereco, apiKey ?? '');
  await testarGeolocalizacao(endereco, apiKey);

  console.log('\n========================================');
  console.log('RESUMO - CONSISTÊNCIA');
  console.log('========================================');
  if (enriquecido && cep) {
    const cepEnriquecido = enriquecido.cep?.replace(/\D/g, '') ?? '';
    const cepOk = cepEnriquecido === cep;
    console.log(`CEP ViaCEP (${cep}) vs CEP Enriquecer (${cepEnriquecido || '—'}): ${cepOk ? '✓ OK' : '✗ Diferente'}`);
  }
  console.log('\nSe algum teste falhou, verifique:');
  console.log('  - Formato do endereço (evitar "Brazil" duplicado)');
  console.log('  - GOOGLE_MAPS_API_KEY no .env');
  console.log('  - formatarEnderecoParaGeocode em google-maps.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
