/**
 * Formata nome de fornecedor (e similares) em Title Case.
 * Ex.: "MÓVEIS SÃO PAULO" → "Móveis São Paulo"
 * Usar em toda exibição de nomes de fornecedores para padronização.
 */
export function formatNomeFornecedor(nome: string | null | undefined): string {
  if (nome == null || nome === '') return '';
  return nome
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
