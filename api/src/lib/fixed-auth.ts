import jwt from 'jsonwebtoken';
import type { Env } from '../types/worker-env.js';
import { getEnv } from '../config/env.worker.js';

export interface FixedAuthProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  company_id: null;
  can_create_users: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

const FIXED_USER_ID = 'fixed-user';

export function isFixedAuthEnabled(env: Env): boolean {
  try {
    return getEnv(env).fixedAuth.enabled;
  } catch {
    return false;
  }
}

export function verifyFixedCredentials(env: Env, email: string, password: string): boolean {
  const config = getEnv(env).fixedAuth;
  if (!config.enabled) return false;
  const emailMatch = email.trim().toLowerCase() === config.email.trim().toLowerCase();
  const passwordMatch = password === config.password;
  return emailMatch && passwordMatch;
}

export function createFixedAuthToken(env: Env): string {
  const config = getEnv(env).fixedAuth;
  const now = new Date().toISOString();
  const payload: FixedAuthProfile = {
    id: FIXED_USER_ID,
    user_id: FIXED_USER_ID,
    name: 'Admin',
    email: config.email,
    role: 'admin',
    company_id: null,
    can_create_users: true,
    is_super_admin: true,
    created_at: now,
    updated_at: now,
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyFixedAuthToken(env: Env, token: string): FixedAuthProfile | null {
  try {
    const config = getEnv(env).fixedAuth;
    if (!config.enabled) return null;
    const decoded = jwt.verify(token, config.jwtSecret) as FixedAuthProfile;
    return decoded;
  } catch {
    return null;
  }
}

export function getFixedProfileFromToken(env: Env, token: string): FixedAuthProfile | null {
  return verifyFixedAuthToken(env, token);
}
