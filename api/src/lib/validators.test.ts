/**
 * Basic unit tests for validators
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { validateInput, createProjectSchema, loginSchema } from './validators.js';
import type { z } from 'zod';

describe('Validators', () => {
  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Project',
        status: 'budget',
        partner_1_percentage: 60,
        partner_2_percentage: 40,
      };

      const result = validateInput(createProjectSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid project data with wrong percentages sum', () => {
      const invalidData = {
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Project',
        partner_1_percentage: 60,
        partner_2_percentage: 50, // Sum is not 100
      };

      const result = validateInput(createProjectSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('100%');
      }
    });

    it('should reject project without required fields', () => {
      const invalidData = {
        name: 'Test Project',
        // Missing client_id
      };

      const result = validateInput(createProjectSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validateInput(loginSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };

      const result = validateInput(loginSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Email');
      }
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing password
      };

      const result = validateInput(loginSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });
});
