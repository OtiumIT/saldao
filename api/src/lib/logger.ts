/**
 * Structured logger with different log levels
 * Masks sensitive data like tokens, emails, passwords
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

// Masks sensitive fields
function maskSensitive(data: unknown): unknown {
  if (typeof data === 'string') {
    // Mask tokens (long strings)
    if (data.length > 20 && /^[A-Za-z0-9_-]+$/.test(data)) {
      return `${data.substring(0, 8)}...${data.substring(data.length - 4)}`;
    }
    // Mask emails (keep domain visible)
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const masked: Record<string, unknown> = {};
    const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'apiKey', 'email'];
    
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        masked[key] = '***MASKED***';
      } else {
        masked[key] = maskSensitive(value);
      }
    }
    return masked;
  }

  return data;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const maskedContext = context ? maskSensitive(context) : undefined;
  const contextStr = maskedContext ? ` ${JSON.stringify(maskedContext)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    // In Workers, we don't have process.env, so always log debug in development
    // In production Workers, you can configure log levels via environment variables
    console.debug(formatMessage('debug', message, context));
  },

  info: (message: string, context?: LogContext) => {
    console.log(formatMessage('info', message, context));
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(formatMessage('warn', message, context));
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    console.error(formatMessage('error', message, errorContext));
  },
};
