/**
 * Validation schemas using Zod
 * Provides type-safe input validation for API routes
 */

import { z } from 'zod';
import { logger } from './logger.js';

// Common validators
const uuidSchema = z.string().uuid('ID inválido');
const emailSchema = z.string().email('Email inválido').toLowerCase().trim();
const percentageSchema = z.number().min(0).max(100, 'Percentual deve estar entre 0 e 100');
const positiveNumberSchema = z.number().positive('Valor deve ser positivo').or(z.number().min(0));
const nonEmptyStringSchema = z.string().min(1, 'Campo obrigatório').trim();

// Project validators base schema (without refine for reuse)
const projectBaseSchema = z.object({
  client_id: uuidSchema,
  name: nonEmptyStringSchema.max(255, 'Nome muito longo'),
  description: z.string().max(2000, 'Descrição muito longa').optional().nullable(),
  status: z.enum(['budget', 'in_progress', 'completed', 'cancelled']).default('budget'),
  estimated_value: positiveNumberSchema.optional().nullable(),
  notes: z.string().max(5000, 'Notas muito longas').optional().nullable(),
  partner_1_percentage: percentageSchema.default(50),
  partner_2_percentage: percentageSchema.default(50),
  progress_percentage: percentageSchema.default(0),
  phases: z.array(z.unknown()).optional().default([]),
  entity_type: z.enum(['own', 'partnership']).default('own'),
  partnership_id: uuidSchema.optional().nullable(),
  // Entrada (valor recebido de cara na abertura do projeto)
  entry_value: z.number().min(0, 'Valor da entrada deve ser >= 0').optional().nullable(),
  entry_received_by_company_id: uuidSchema.optional().nullable(),
  entry_payment_method: z.enum(['zelle', 'card', 'check', 'cash']).optional().default('cash'),
});

export const createProjectSchema = projectBaseSchema.refine(
  (data) => {
    const total = (data.partner_1_percentage || 0) + (data.partner_2_percentage || 0);
    return total === 100;
  },
  {
    message: 'A soma dos percentuais deve ser 100%',
    path: ['partner_1_percentage'],
  }
);

export const updateProjectSchema = projectBaseSchema.partial();

// Client validators
export const createClientSchema = z.object({
  name: nonEmptyStringSchema.max(255, 'Nome muito longo'),
  email: emailSchema.optional().nullable(),
  phone: z.string().max(20, 'Telefone muito longo').optional().nullable(),
  address: z.string().max(500, 'Endereço muito longo').optional().nullable(),
  notes: z.string().max(5000, 'Notas muito longas').optional().nullable(),
  tax_id: z.string().max(50, 'CNPJ/CPF muito longo').optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

// Financial Entry validators
export const createFinancialEntrySchema = z.object({
  project_id: uuidSchema.optional().nullable(),
  supplier_id: uuidSchema.optional().nullable(),
  description: nonEmptyStringSchema.max(500, 'Descrição muito longa'),
  amount: positiveNumberSchema,
  entry_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')),
  category: z.string().max(100, 'Categoria muito longa').optional().nullable(),
  payment_method: z.string().max(50, 'Método de pagamento muito longo').optional().nullable(),
  notes: z.string().max(5000, 'Notas muito longas').optional().nullable(),
});

export const updateFinancialEntrySchema = createFinancialEntrySchema.partial();

// Financial Exit validators
export const createFinancialExitSchema = createFinancialEntrySchema.extend({
  // Same as entry for now, but can be extended
});

export const updateFinancialExitSchema = createFinancialExitSchema.partial();

// User validators
export const createUserSchema = z.object({
  name: nonEmptyStringSchema.max(255, 'Nome muito longo'),
  email: emailSchema,
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100, 'Senha muito longa'),
  role: z.enum(['partner', 'admin', 'employee']).default('partner'),
  can_create_users: z.boolean().default(false),
  company_id: uuidSchema.optional(), // Super admin pode especificar a empresa
});

export const updateUserSchema = z.object({
  name: nonEmptyStringSchema.max(255, 'Nome muito longo').optional(),
  email: emailSchema.optional(),
  role: z.enum(['partner', 'admin', 'employee']).optional(),
  can_create_users: z.boolean().optional(),
  company_id: uuidSchema.optional(), // Super admin pode alterar
});

// Auth validators
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().optional(),
  email: emailSchema.optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100, 'Senha muito longa'),
}).refine(
  (data) => data.token || data.email,
  {
    message: 'Token ou email é obrigatório',
    path: ['token'],
  }
);

// Helper function to validate and parse
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const message = firstError?.message || 'Dados inválidos';
      logger.warn('Validation error', { errors: error.errors });
      return { success: false, error: message };
    }
    logger.error('Unexpected validation error', error);
    return { success: false, error: 'Erro ao validar dados' };
  }
}
