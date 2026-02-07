import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';

const WHATSAPP_NUMBER = '5511967785598';

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
  stack?: string;
}

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const logsRef = useRef<ConsoleLog[]>([]);
  const originalConsoleRef = useRef<{
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
  } | null>(null);

  useEffect(() => {
    if (!originalConsoleRef.current) {
      originalConsoleRef.current = {
        log: console.log.bind(console),
        error: console.error.bind(console),
        warn: console.warn.bind(console),
        info: console.info.bind(console),
      };

      console.log = (...args: unknown[]) => {
        originalConsoleRef.current?.log(...args);
        const logMessage = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        logsRef.current.push({ type: 'log', message: logMessage, timestamp: new Date().toISOString() });
      };

      console.error = (...args: unknown[]) => {
        originalConsoleRef.current?.error(...args);
        const errorMessage = args.map(arg => {
          if (arg instanceof Error) return `${arg.message}\n${arg.stack || ''}`;
          return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
        }).join(' ');
        logsRef.current.push({ type: 'error', message: errorMessage, timestamp: new Date().toISOString() });
      };

      console.warn = (...args: unknown[]) => {
        originalConsoleRef.current?.warn(...args);
        const warnMessage = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        logsRef.current.push({ type: 'warn', message: warnMessage, timestamp: new Date().toISOString() });
      };

      console.info = (...args: unknown[]) => {
        originalConsoleRef.current?.info(...args);
        const infoMessage = args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        logsRef.current.push({ type: 'info', message: infoMessage, timestamp: new Date().toISOString() });
      };

      window.addEventListener('error', (event) => {
        logsRef.current.push({
          type: 'error',
          message: `${event.message}\n${event.filename}:${event.lineno}:${event.colno}\n${event.error?.stack || ''}`,
          timestamp: new Date().toISOString(),
          stack: event.error?.stack,
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        const errorMessage = event.reason instanceof Error
          ? `${event.reason.message}\n${event.reason.stack || ''}`
          : String(event.reason);
        logsRef.current.push({
          type: 'error',
          message: `Unhandled Promise Rejection: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        });
      });
    }

    return () => {
      if (originalConsoleRef.current) {
        console.log = originalConsoleRef.current.log;
        console.error = originalConsoleRef.current.error;
        console.warn = originalConsoleRef.current.warn;
        console.info = originalConsoleRef.current.info;
      }
    };
  }, []);

  const captureDebugInfo = () => {
    const debugInfo = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      localStorage: Object.keys(localStorage).length > 0 ? 'Presente' : 'Vazio',
      sessionStorage: Object.keys(sessionStorage).length > 0 ? 'Presente' : 'Vazio',
      cookies: document.cookie || 'Nenhum cookie',
      timestamp: new Date().toISOString(),
    };
    const recentLogs = logsRef.current.slice(-50);
    return { debugInfo, consoleLogs: recentLogs };
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMessage('');
    const { consoleLogs } = captureDebugInfo();
    setConsoleLogs(consoleLogs);
  };

  const handleSend = () => {
    if (!message.trim() && consoleLogs.length === 0) {
      alert('Por favor, descreva o problema');
      return;
    }

    const { debugInfo, consoleLogs: logs } = captureDebugInfo();

    let bugMessage = `🐛 *Reporte de Bug*\n\n`;
    if (message.trim()) {
      bugMessage += `*Descrição do Problema:*\n${message}\n\n`;
    }
    bugMessage += `*📋 Informações do Sistema:*\n`;
    bugMessage += `• URL: ${debugInfo.url}\n`;
    bugMessage += `• Data/Hora: ${new Date(debugInfo.timestamp).toLocaleString('pt-BR')}\n`;
    bugMessage += `• Navegador: ${debugInfo.userAgent}\n`;
    bugMessage += `• Plataforma: ${debugInfo.platform}\n`;
    bugMessage += `• Idioma: ${debugInfo.language}\n`;
    bugMessage += `• Tela: ${debugInfo.screenSize}\n`;
    bugMessage += `• Viewport: ${debugInfo.viewportSize}\n\n`;

    if (logs.length > 0) {
      bugMessage += `*📝 Console Logs (últimos ${logs.length}):*\n`;
      const errorLogs = logs.filter(log => log.type === 'error');
      const warnLogs = logs.filter(log => log.type === 'warn');
      const otherLogs = logs.filter(log => log.type !== 'error' && log.type !== 'warn');

      if (errorLogs.length > 0) {
        bugMessage += `\n*❌ Erros (${errorLogs.length}):*\n`;
        errorLogs.slice(-10).forEach((log, idx) => {
          bugMessage += `${idx + 1}. [${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] ${log.message}\n`;
          if (log.stack) bugMessage += `   Stack: ${log.stack.substring(0, 200)}...\n`;
        });
      }
      if (warnLogs.length > 0) {
        bugMessage += `\n*⚠️ Avisos (${warnLogs.length}):*\n`;
        warnLogs.slice(-5).forEach((log, idx) => {
          bugMessage += `${idx + 1}. [${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] ${log.message.substring(0, 150)}\n`;
        });
      }
      if (otherLogs.length > 0 && otherLogs.length <= 10) {
        bugMessage += `\n*ℹ️ Outros logs (${otherLogs.length}):*\n`;
        otherLogs.forEach((log, idx) => {
          bugMessage += `${idx + 1}. [${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] ${log.message.substring(0, 100)}\n`;
        });
      } else if (otherLogs.length > 10) {
        bugMessage += `\n*ℹ️ Outros logs: ${otherLogs.length} (mostrando últimos 5)*\n`;
        otherLogs.slice(-5).forEach((log, idx) => {
          bugMessage += `${idx + 1}. [${new Date(log.timestamp).toLocaleTimeString('pt-BR')}] ${log.message.substring(0, 100)}\n`;
        });
      }
    } else {
      bugMessage += `*📝 Console Logs:* Nenhum log capturado\n\n`;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(bugMessage)}`;
    window.open(whatsappUrl, '_blank');
    setTimeout(() => {
      setIsOpen(false);
      setMessage('');
      setConsoleLogs([]);
    }, 500);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Reportar Bug
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Reportar Bug" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descreva o problema:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva o que aconteceu, o que você estava fazendo, etc..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              rows={4}
            />
          </div>

          {consoleLogs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Console Logs Capturados:</label>
              <div className="max-h-32 overflow-y-auto p-3 bg-gray-50 border border-gray-300 rounded-md text-xs font-mono">
                <div className="space-y-1">
                  {consoleLogs.slice(-10).map((log, idx) => (
                    <div key={idx} className={`${log.type === 'error' ? 'text-red-600' : log.type === 'warn' ? 'text-yellow-600' : 'text-gray-700'}`}>
                      <span className="font-semibold">[{log.type.toUpperCase()}]</span>{' '}
                      <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>{' '}
                      <span>{log.message.substring(0, 100)}{log.message.length > 100 ? '...' : ''}</span>
                    </div>
                  ))}
                </div>
                {consoleLogs.length > 10 && (
                  <div className="text-gray-500 text-xs mt-2">... e mais {consoleLogs.length - 10} logs</div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">Cancelar</Button>
            <Button variant="primary" onClick={handleSend} className="flex-1 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
              </svg>
              Enviar via WhatsApp
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
