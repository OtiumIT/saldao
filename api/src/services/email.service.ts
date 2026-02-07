// Re-export from worker version for Cloudflare Workers compatibility
// This file now uses the Worker-compatible version
export { sendEmail, createWelcomeEmail, createResetPasswordEmail } from './email.service.worker.js';
export type { EmailOptions } from './email.service.worker.js';
