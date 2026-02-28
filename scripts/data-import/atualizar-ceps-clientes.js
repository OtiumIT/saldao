#!/usr/bin/env node
/**
 * Script para buscar e atualizar CEPs via ViaCEP
 *
 * Uso:
 *   cd scripts/data-import && node atualizar-ceps-clientes.js viacep
 *
 * Busca o CEP de cada cliente com endereço (mas sem CEP) usando a API ViaCEP.
 * Assume todos os endereços da Grande SP (UF=SP). Atualiza o banco automaticamente.
 *
 * Requer .env na raiz com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (raiz do projeto)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/** CEPs pesquisados no Google para endereços que ViaCEP não encontra. Chave = substring do endereço (lowercase). */
const CEP_MANUAL = {
  'antônio bernardo da costa': '03935090', // Travessa Antonio Bernardo da Costa, Jardim Imperador
  'antonio bernardo da costa': '03935090',
  'henry fuseli': '03923030', // Rua Henry Fuseli, Parque dos Bancários
  'parque dos bancarios': '03923030',
  'barreira grande 2504': '03916000', // Av Barreira Grande 2504 (range 1001+ = Vila Bancária)
  'av barreira grande': '03916000',
  'guido federicci': '03923170', // Rua Guido Federicci, Parque dos Bancários
  'joaquim meira de sequeira': '08275490', // Rua Joaquim Meira de Siqueira, Jardim N. Sra do Carmo
  'joaquim meira de siqueira': '08275490',
  'travessa hortelã': '09272530', // Jardim Alzira Franco, Santo André
  'hortelã': '09272530',
  'jardim alzira franco': '09272530',
  'manoel arce': '03922150', // Rua Manuel Arce, Parque dos Bancários
  'manuel arce': '03922150',
};

/** Busca CEP no mapeamento manual (pesquisa Google). */
function cepManual(endereco) {
  const s = String(endereco || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  for (const [key, cep] of Object.entries(CEP_MANUAL)) {
    const k = key.normalize('NFD').replace(/\p{M}/gu, '');
    if (s.includes(k)) return cep;
  }
  return null;
}

/** Extrai CEP já presente no endereço (ex: 03923-080 ou 03923080). */
function extrairCepDoEndereco(endereco) {
  const m = String(endereco || '').match(/\b(\d{5}-?\d{3})\b/);
  return m ? m[1].replace(/\D/g, '') : null;
}

/** Todos os endereços são da Grande SP. Extrai Cidade e Logradouro para ViaCEP. */
function parseEndereco(endereco) {
  if (!endereco || typeof endereco !== 'string') return null;
  const s = endereco.trim();
  if (s.length < 3) return null;

  let partes = s.split(',').map((p) => p.trim()).filter(Boolean);
  if (partes.length < 2) {
    partes = s.split(/\s+-\s+/).map((p) => p.trim()).filter(Boolean);
  }

  const uf = 'SP';
  let cidade = 'São Paulo';
  let logradouro = '';

  if (partes.length >= 2) {
    let ultima = partes[partes.length - 1];
    ultima = ultima.replace(/\s*\/?\s*SP\s*$/i, '').replace(/\s*-\s*SP\s*$/i, '').replace(/\s*-\s*$/, '').trim();
    if (ultima.length >= 3 && !/^\d{5}/.test(ultima)) {
      cidade = ultima;
    }
    logradouro = partes[0].replace(/\s*\d{5}-?\d{3}.*$/i, '').replace(/\s+\d+\s*$/, '').trim();
    if (logradouro.length < 3 && partes.length >= 2) {
      logradouro = (partes[0] + ' ' + partes[1]).replace(/\s*\d{5}-?\d{3}.*$/i, '').replace(/\s+\d+$/, '').trim();
    }
  } else {
    logradouro = s.replace(/\s*\d{5}-?\d{3}.*$/i, '').trim();
  }

  if (logradouro.length < 3) return null;
  return { uf, cidade, logradouro };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function buscarCepViaCep(uf, cidade, logradouro, debug = false) {
  const url = `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(logradouro)}/json/`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (debug) {
      console.log(`      URL: ${url}`);
      console.log(`      Status: ${res.status}`);
      console.log(`      Resposta: ${JSON.stringify(data).slice(0, 200)}${JSON.stringify(data).length > 200 ? '...' : ''}`);
    }
    if (!res.ok) return null;
    if (Array.isArray(data) && data.length > 0) {
      const cep = data[0].cep?.replace(/\D/g, '');
      return cep?.length === 8 ? cep : null;
    }
    if (data && !data.erro && data.cep) {
      const cep = data.cep.replace(/\D/g, '');
      return cep?.length === 8 ? cep : null;
    }
  } catch (e) {
    if (debug) console.log('      Erro:', e.message);
  }
  return null;
}

/** Gera variações do logradouro para tentar na ViaCEP. */
function variacoesLogradouro(logradouro) {
  const v = [logradouro.trim()];
  const s = logradouro.trim();
  const semNumero = s.replace(/^\d+\s+/, '').replace(/\s+\d+(\s+casa|\s+ap|\s+nº?|\s+sala)?.*$/i, '').trim();
  if (semNumero !== s && semNumero.length >= 3) v.push(semNumero);
  const semTipo = s.replace(/^(Rua|Av\.?|Avenida|Al\.|Alameda|Travessa|Viela|Praça)\s+/i, '').trim();
  if (semTipo !== s && semTipo.length >= 3) v.push(semTipo);
  const avParaAvenida = s.replace(/^Av\.?\s+/i, 'Avenida ');
  if (avParaAvenida !== s && avParaAvenida.length >= 3) v.push(avParaAvenida.replace(/\s+\d+.*$/, '').trim());
  const subPartes = s.split(/\s+-\s+/).map((p) => p.trim()).filter((p) => p.length >= 3);
  for (const p of subPartes) {
    if (/^(Rua|Av|Avenida|Viela)\s+/i.test(p)) v.push(p.replace(/\s+\d+.*$/, '').trim());
  }
  return [...new Set(v)];
}

async function viacep() {
  console.log('📤 Buscando clientes sem CEP...');
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('id, nome, endereco_entrega, cep');

  if (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }

  const comEndereco = clientes.filter(
    (c) => c.endereco_entrega?.trim() && (!c.cep || String(c.cep).trim() === '')
  );
  if (comEndereco.length === 0) {
    console.log('✅ Nenhum cliente com endereço e sem CEP.');
    return;
  }

  const debug = process.argv.includes('--debug');
  if (debug) console.log('🔍 Modo debug: mostrando URL e resposta do ViaCEP\n');
  console.log(`📡 Buscando CEP via ViaCEP para ${comEndereco.length} clientes...`);
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const c of comEndereco) {
    const cepNoEndereco = extrairCepDoEndereco(c.endereco_entrega);
    if (cepNoEndereco) {
      const { error: updErr } = await supabase.from('clientes').update({ cep: cepNoEndereco }).eq('id', c.id);
      if (updErr) {
        console.error(`   ❌ ${c.nome}:`, updErr.message);
        fail++;
      } else {
        console.log(`   ✅ ${c.nome}: ${cepNoEndereco} (extraído do endereço)`);
        ok++;
      }
      continue;
    }

    const parsed = parseEndereco(c.endereco_entrega);
    if (!parsed) {
      console.log(`   ⏭️  ${c.nome}: endereço não parseável`);
      skip++;
      continue;
    }

    const variacoes = variacoesLogradouro(parsed.logradouro);
    let cep = null;
    for (const log of variacoes) {
      cep = await buscarCepViaCep(parsed.uf, parsed.cidade, log, debug);
      await sleep(debug ? 500 : 1500);
      if (cep) break;
    }
    if (!cep && parsed.cidade.toLowerCase() !== 'são paulo') {
      for (const log of variacoes) {
        cep = await buscarCepViaCep('SP', 'São Paulo', log, debug);
        await sleep(debug ? 500 : 1500);
        if (cep) break;
      }
    }

    const cepManualVal = !cep ? cepManual(c.endereco_entrega) : null;
    if (cepManualVal) cep = cepManualVal;

    if (cep) {
      const { error: updErr } = await supabase.from('clientes').update({ cep }).eq('id', c.id);
      if (updErr) {
        console.error(`   ❌ ${c.nome}:`, updErr.message);
        fail++;
      } else {
        console.log(`   ✅ ${c.nome}: ${cep}${cepManualVal ? ' (pesquisa Google)' : ''}`);
        ok++;
      }
    } else {
      if (debug) {
        console.log(`   ⏭️  ${c.nome}: CEP não encontrado`);
        console.log(`      Endereço: ${c.endereco_entrega}`);
        console.log(`      Tentado: ${parsed.logradouro} | ${parsed.cidade}/${parsed.uf}`);
      } else {
        console.log(`   ⏭️  ${c.nome}: CEP não encontrado (${parsed.logradouro}, ${parsed.cidade}/${parsed.uf})`);
      }
      skip++;
    }
  }

  console.log(`\n✅ ${ok} atualizados | ${skip} sem CEP encontrado | ${fail} erros`);
}

const cmd = process.argv[2];
if (cmd === 'viacep') {
  viacep();
} else {
  console.log('Uso: node atualizar-ceps-clientes.js viacep [--debug]');
  console.log('     Busca CEP pelo endereço via ViaCEP e atualiza o banco.');
  console.log('     --debug: mostra URL e resposta para cada endereço não encontrado.');
  process.exit(1);
}
