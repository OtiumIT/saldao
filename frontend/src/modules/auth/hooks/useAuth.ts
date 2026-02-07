import { useAuthContext } from '../context/AuthContext';

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado dentro de um AuthProvider.
 */
export function useAuth() {
  return useAuthContext();
}
