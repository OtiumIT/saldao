/**
 * Formata valores monetários sempre em USD (dólar)
 * Independente do idioma da interface
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
