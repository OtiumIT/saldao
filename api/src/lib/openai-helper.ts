import OpenAI from 'openai';
import type { EnvConfig } from '../config/env.worker.js';
import { logger } from './logger.js';

// Constants for validation
const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MIN_IMAGE_SIZE = 1024; // 1KB

function validateBase64Image(imageBase64: string): { valid: boolean; error?: string; sizeInBytes?: number } {
  // Check if it's a valid base64 string
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Invalid base64 string' };
  }

  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  
  // Check base64 format
  if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
    return { valid: false, error: 'Invalid base64 format' };
  }

  // Calculate size from base64 string (base64 is ~4/3 the size of the original data)
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);

  if (sizeInBytes < MIN_IMAGE_SIZE) {
    return { valid: false, error: 'Image too small' };
  }

  if (sizeInBytes > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image too large (max 20MB)' };
  }

  // Decode first few bytes to check magic bytes
  try {
    const binaryString = atob(base64Data.slice(0, 100));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8;
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    const isWEBP = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

    if (!isJPEG && !isPNG && !isWEBP) {
      return { valid: false, error: 'Invalid image format (only JPEG, PNG, WEBP allowed)' };
    }

    return { valid: true, sizeInBytes };
  } catch (error) {
    return { valid: false, error: 'Failed to decode base64 image' };
  }
}

export interface ReceiptExtraction {
  tipo_de_gasto: string;
  data_do_gasto: string;
  valor_do_gasto: number;
  descricao: {
    estabelecimento: string;
    endereco?: string;
    forma_pagamento: string;
    itens?: Array<{
      codigo?: string;
      descricao: string;
      quantidade?: number;
      valor_unitario?: number;
      valor_total?: number;
    }>;
    subtotal?: number;
    imposto?: number;
    total: number;
    data_hora_compra?: string;
    observacoes?: string;
  };
}

export async function extractReceiptData(imageBase64: string, envConfig: EnvConfig): Promise<ReceiptExtraction> {
  const startTime = Date.now();
  
  // Validate base64 image
  const validation = validateBase64Image(imageBase64);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image');
  }

  // Create OpenAI instance for this request
  const openai = new OpenAI({
    apiKey: envConfig.openai.apiKey,
    timeout: 30000,
    maxRetries: 2,
  });

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout: extraction took too long'));
      }, 60000);
    });

    // Create OpenAI request promise
    const openaiPromise = openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente especializado em extrair informações de recibos e notas fiscais. 
          Analise a imagem fornecida e extraia as informações estruturadas em formato JSON.
          Retorne APENAS um JSON válido, sem markdown, sem código, sem explicações.
          O formato esperado é:
          {
            "tipo_de_gasto": "categoria do gasto (ex: Ferramentas e Materiais, Alimentação, Combustível, etc)",
            "data_do_gasto": "YYYY-MM-DD",
            "valor_do_gasto": número,
            "descricao": {
              "estabelecimento": "nome do estabelecimento",
              "endereco": "endereço completo se disponível",
              "forma_pagamento": "Débito, Crédito, Dinheiro, Zelle, etc",
              "itens": [
                {
                  "codigo": "código do item se disponível",
                  "descricao": "descrição do item",
                  "quantidade": número,
                  "valor_unitario": número,
                  "valor_total": número
                }
              ],
              "subtotal": número,
              "imposto": número,
              "total": número,
              "data_hora_compra": "YYYY-MM-DD HH:mm",
              "observacoes": "observações adicionais se houver"
            }
          }`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    // Race between timeout and OpenAI request
    const response = await Promise.race([openaiPromise, timeoutPromise]);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Remover markdown code blocks se houver
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let extracted: ReceiptExtraction;
    try {
      extracted = JSON.parse(jsonContent) as ReceiptExtraction;
    } catch (parseError) {
      logger.error('Failed to parse OpenAI response', parseError, { contentLength: content.length });
      throw new Error('Erro ao processar resposta da OpenAI. Tente novamente.');
    }
    
    // Validação básica
    if (!extracted.tipo_de_gasto || !extracted.data_do_gasto || !extracted.valor_do_gasto) {
      logger.warn('Incomplete extraction data', { extracted });
      throw new Error('Dados extraídos incompletos');
    }

    const duration = Date.now() - startTime;
    logger.info('Receipt extraction successful', { duration });

    return extracted;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log detalhado do erro para debug
    logger.error('Error extracting receipt data', {
      error,
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      duration,
      hasApiKey: !!envConfig.openai.apiKey,
      apiKeyLength: envConfig.openai.apiKey?.length || 0,
    });
    
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Timeout
      if (errorMsg.includes('timeout')) {
        throw new Error('Tempo limite excedido. Tente novamente com uma imagem menor ou mais clara.');
      }
      
      // Rate limit
      if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('quota')) {
        throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
      }
      
      // API key issues
      if (errorMsg.includes('invalid_api_key') || errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        throw new Error('Erro de configuração. Entre em contato com o administrador.');
      }
      
      // Insufficient credits/quota
      if (errorMsg.includes('insufficient_quota') || errorMsg.includes('billing') || errorMsg.includes('payment')) {
        throw new Error('Serviço temporariamente indisponível. Entre em contato com o administrador.');
      }
      
      // Invalid request format
      if (errorMsg.includes('invalid_request') || errorMsg.includes('400')) {
        throw new Error('Erro ao processar imagem. Verifique se o formato está correto.');
      }
      
      // JSON parsing errors
      if (error instanceof SyntaxError || errorMsg.includes('json')) {
        throw new Error('Erro ao processar resposta da OpenAI. Tente novamente.');
      }
      
      // Re-throw with original message if it's a known error
      throw error;
    }
    
    throw new Error('Erro ao extrair dados do recibo. Tente novamente.');
  }
}

// --- Extração de pedido de venda e pedido de compra por foto ---

export interface ItemPedidoExtraido {
  descricao?: string;
  codigo?: string;
  quantidade: number;
  preco_unitario: number;
}

export interface SaleOrderExtraction {
  cliente_nome?: string | null;
  data_pedido?: string | null;
  itens: ItemPedidoExtraido[];
  total?: number | null;
  observacoes?: string | null;
}

export interface PurchaseOrderExtraction {
  fornecedor_nome?: string | null;
  data_pedido?: string | null;
  itens: ItemPedidoExtraido[];
  total?: number | null;
  observacoes?: string | null;
}

async function extractOrderFromImage(
  imageBase64: string,
  envConfig: EnvConfig,
  systemPrompt: string
): Promise<unknown> {
  const validation = validateBase64Image(imageBase64);
  if (!validation.valid) throw new Error(validation.error || 'Invalid image');

  const openai = new OpenAI({
    apiKey: envConfig.openai.apiKey,
    timeout: 30000,
    maxRetries: 2,
  });

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout: extraction took too long')), 60000);
  });

  const openaiPromise = openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [{ type: 'image_url' as const, image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const response = await Promise.race([openaiPromise, timeoutPromise]);
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Resposta vazia da OpenAI');

  const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(jsonContent) as unknown;
  } catch {
    throw new Error('Erro ao processar resposta. Tente novamente.');
  }
}

const SALE_ORDER_SYSTEM_PROMPT = `Você é um assistente que extrai dados de pedidos de venda anotados em papel (foto).
Analise a imagem e retorne APENAS um JSON válido, sem markdown.
Formato:
{
  "cliente_nome": "nome do cliente ou null",
  "data_pedido": "YYYY-MM-DD ou null",
  "itens": [
    { "descricao": "descrição do item", "codigo": "código se houver", "quantidade": número, "preco_unitario": número }
  ],
  "total": número ou null,
  "observacoes": "texto ou null"
}
Todos os campos são opcionais exceto itens (array, pode ser vazio).`;

const PURCHASE_ORDER_SYSTEM_PROMPT = `Você é um assistente que extrai dados de pedidos de compra anotados em papel (foto).
Analise a imagem e retorne APENAS um JSON válido, sem markdown.
Formato:
{
  "fornecedor_nome": "nome do fornecedor ou null",
  "data_pedido": "YYYY-MM-DD ou null",
  "itens": [
    { "descricao": "descrição do item", "codigo": "código se houver", "quantidade": número, "preco_unitario": número }
  ],
  "total": número ou null,
  "observacoes": "texto ou null"
}
Todos os campos são opcionais exceto itens (array, pode ser vazio).`;

export async function extractSaleOrderFromImage(imageBase64: string, envConfig: EnvConfig): Promise<SaleOrderExtraction> {
  const raw = await extractOrderFromImage(imageBase64, envConfig, SALE_ORDER_SYSTEM_PROMPT);
  const o = raw as Record<string, unknown>;
  const itens = Array.isArray(o.itens)
    ? (o.itens as unknown[]).map((x) => {
        const i = x as Record<string, unknown>;
        return {
          descricao: typeof i.descricao === 'string' ? i.descricao : undefined,
          codigo: typeof i.codigo === 'string' ? i.codigo : undefined,
          quantidade: Number(i.quantidade) || 0,
          preco_unitario: Number(i.preco_unitario) || 0,
        };
      })
    : [];
  return {
    cliente_nome: typeof o.cliente_nome === 'string' ? o.cliente_nome : null,
    data_pedido: typeof o.data_pedido === 'string' ? o.data_pedido : null,
    itens,
    total: typeof o.total === 'number' ? o.total : null,
    observacoes: typeof o.observacoes === 'string' ? o.observacoes : null,
  };
}

export async function extractPurchaseOrderFromImage(imageBase64: string, envConfig: EnvConfig): Promise<PurchaseOrderExtraction> {
  const raw = await extractOrderFromImage(imageBase64, envConfig, PURCHASE_ORDER_SYSTEM_PROMPT);
  const o = raw as Record<string, unknown>;
  const itens = Array.isArray(o.itens)
    ? (o.itens as unknown[]).map((x) => {
        const i = x as Record<string, unknown>;
        return {
          descricao: typeof i.descricao === 'string' ? i.descricao : undefined,
          codigo: typeof i.codigo === 'string' ? i.codigo : undefined,
          quantidade: Number(i.quantidade) || 0,
          preco_unitario: Number(i.preco_unitario) || 0,
        };
      })
    : [];
  return {
    fornecedor_nome: typeof o.fornecedor_nome === 'string' ? o.fornecedor_nome : null,
    data_pedido: typeof o.data_pedido === 'string' ? o.data_pedido : null,
    itens,
    total: typeof o.total === 'number' ? o.total : null,
    observacoes: typeof o.observacoes === 'string' ? o.observacoes : null,
  };
}
