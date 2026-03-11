/**
 * Formata data no padrão brasileiro (dd/mm/aaaa)
 * Aceita string YYYY-MM-DD, ISO (com T) ou Date
 */
export function formatDateBR(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '—';
  let d: Date;
  if (typeof value === 'string') {
    // ISO com T (ex: 2024-01-15T10:30:00.000Z) — usar direto
    d = value.includes('T') ? new Date(value) : new Date(value + 'T12:00:00');
  } else {
    d = value;
  }
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}
