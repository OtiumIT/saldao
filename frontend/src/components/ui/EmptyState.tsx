import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title = 'Nenhum item encontrado',
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>}
      {onAction && actionLabel && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
