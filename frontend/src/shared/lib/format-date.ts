/**
 * Formata data no padrão brasileiro (dd/mm/aaaa)
 * Aceita string YYYY-MM-DD ou Date
 */
export function formatDateBR(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—';
  const d = typeof value === 'string' ? new Date(value + 'T12:00:00') : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}
