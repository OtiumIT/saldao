/**
 * Script para testar a extração de recibo
 * Uso: tsx scripts/test-extract-receipt.ts <caminho-da-imagem> [token]
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URL da API - ajuste conforme necessário
const API_URL = process.env.API_URL || 'https://api.partnerfinancecontrol.com';
// Para local: 'http://localhost:3000'

async function testExtractReceipt(imagePath: string, token?: string) {
  try {
    console.log('📸 Lendo imagem...');
    const imageBuffer = readFileSync(imagePath);
    
    console.log('🔄 Convertendo para base64...');
    const base64 = imageBuffer.toString('base64');
    console.log(`✅ Base64 gerado: ${base64.length} caracteres`);
    
    console.log('📤 Enviando requisição para API...');
    const url = `${API_URL}/api/financial-exits/extract-receipt`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token de autenticação fornecido');
    } else {
      console.log('⚠️  Nenhum token fornecido - a requisição pode falhar se a rota exigir autenticação');
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ imageBase64: base64 }),
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('\n📋 Resposta da API:');
      console.log(JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('\n❌ Erro na requisição');
        process.exit(1);
      } else {
        console.log('\n✅ Extração realizada com sucesso!');
      }
    } else {
      const text = await response.text();
      console.log('\n📋 Resposta (texto):');
      console.log(text);
      
      if (!response.ok) {
        console.error('\n❌ Erro na requisição');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('\n❌ Erro ao testar extração:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Executar
const imagePath = process.argv[2];
const token = process.argv[3];

if (!imagePath) {
  console.error('❌ Uso: tsx scripts/test-extract-receipt.ts <caminho-da-imagem> [token]');
  console.error('Exemplo: tsx scripts/test-extract-receipt.ts ../assets/receipt.jpg');
  process.exit(1);
}

// Resolver caminho relativo
const resolvedPath = imagePath.startsWith('/') 
  ? imagePath 
  : join(__dirname, '..', '..', imagePath);

testExtractReceipt(resolvedPath, token);
