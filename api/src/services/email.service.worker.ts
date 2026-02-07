/**
 * Email service for Cloudflare Workers
 * Uses Cloudflare Email Workers or external email API
 */
import type { EnvConfig } from '../config/env.worker.js';
import { logger } from '../lib/logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Cloudflare Email Workers or external service
 * 
 * Options:
 * 1. Use Cloudflare Email Workers (if configured)
 * 2. Use external email API (Resend, SendGrid, etc.)
 * 3. Use Gmail SMTP via external service (Mailgun, etc.)
 */
export async function sendEmail(
  options: EmailOptions,
  env: EnvConfig,
  emailWorker?: string
): Promise<void> {
  try {
    // Option 1: Use Cloudflare Email Workers if available
    if (emailWorker) {
      await sendViaEmailWorker(options, emailWorker);
      return;
    }

    // Option 2: Use Resend API (recommended for Workers)
    // You can also use SendGrid, Mailgun, or other email APIs
    await sendViaResend(options, env);
  } catch (error) {
    const err = error as Error;
    logger.error('Email send failed', error);
    throw new Error(`Falha ao enviar email: ${err.message}`);
  }
}

/**
 * Send email via Cloudflare Email Workers
 */
async function sendViaEmailWorker(
  options: EmailOptions,
  emailWorkerUrl: string
): Promise<void> {
  const response = await fetch(emailWorkerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email Worker failed: ${errorText}`);
  }

  logger.info('Email sent via Email Worker', { to: options.to });
}

/**
 * Send email via Resend API (recommended for Cloudflare Workers)
 * 
 * To use Resend:
 * 1. Sign up at https://resend.com
 * 2. Get your API key
 * 3. Add RESEND_API_KEY to Cloudflare Workers environment variables
 * 4. Update this function to use the API key from env
 */
async function sendViaResend(
  options: EmailOptions,
  env: EnvConfig
): Promise<void> {
  // For now, we'll use a simple fetch to an external email service
  // You should replace this with your preferred email service
  
  // Example using a generic email API endpoint
  // In production, use Resend, SendGrid, or Mailgun
  
  const fromEmail = env.email.contactEmail || env.email.gmailUser || 'noreply@gestaofinanceira.com';
  
  // TODO: Implement actual email sending via Resend or other service
  // For now, we'll log the email (in production, implement actual sending)
  logger.info('Email would be sent', {
    to: options.to,
    subject: options.subject,
    from: fromEmail,
  });
  
  // Uncomment and configure when you have an email service:
  /*
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Sistema de Gestão Financeira <${fromEmail}>`,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Resend API failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  logger.info('Email sent via Resend', { to: options.to, id: data.id });
  */
}

// Templates de email (reutilizados do email.service.ts original)
export function createWelcomeEmail(userName: string, userEmail: string, resetPasswordLink?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sistema de Gestão Financeira</h1>
        </div>
        <div class="content">
          <h2>Bem-vindo(a)!</h2>
          <p>Olá, ${userName}!</p>
          <p>Sua conta foi criada com sucesso no Sistema de Gestão Financeira.</p>
          ${resetPasswordLink ? `
            <p>Para começar a usar o sistema, você precisa definir sua senha de acesso.</p>
            <p>Clique no botão abaixo para definir sua senha:</p>
            <div style="text-align: center;">
              <a href="${resetPasswordLink}" class="button">Definir Senha</a>
            </div>
            <p style="color: #dc2626; font-size: 14px;"><strong>⚠️ IMPORTANTE:</strong> Este link expira em 1 hora.</p>
          ` : `
            <p>Você pode fazer login usando seu email: <strong>${userEmail}</strong></p>
            <p>Se você não definiu uma senha ainda, use a opção "Esqueci minha senha" na página de login.</p>
          `}
          <p>Se você tiver alguma dúvida, entre em contato com o administrador do sistema.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function createResetPasswordEmail(resetLink: string, userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sistema de Gestão Financeira</h1>
        </div>
        <div class="content">
          <h2>Redefinição de Senha</h2>
          ${userName ? `<p>Olá, ${userName}!</p>` : '<p>Olá!</p>'}
          <p>Você solicitou a redefinição de senha da sua conta.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Redefinir Senha</a>
          </div>
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
          <p><strong>Este link expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
