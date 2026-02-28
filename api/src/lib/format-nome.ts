/**
 * Normaliza nome para Title Case (capitaliza cada palavra).
 * Usado ao salvar fornecedores para manter padrão no cadastro.
 */
export function toTitleCase(nome: string | null | undefined): string {
  if (nome == null || nome === '') return '';
  return nome
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
