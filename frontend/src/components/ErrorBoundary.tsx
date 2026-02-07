import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onClose?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800 font-medium mb-1">Algo deu errado ao abrir esta tela.</p>
          <p className="text-sm text-red-700 mb-3">{this.state.error.message}</p>
          {this.props.onClose && (
            <Button type="button" variant="secondary" size="sm" onClick={this.props.onClose}>
              Fechar
            </Button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
