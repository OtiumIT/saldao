import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../shared/lib/api-client';
import type { LoginRequest, LoginResponse, UserProfile } from '../types/auth.types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Inicializar com o token do localStorage de forma síncrona
    return localStorage.getItem(TOKEN_KEY);
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    const currentToken = token;
    if (currentToken) {
      apiClient.post('/api/auth/logout', {}, currentToken).catch(() => { 
        /* Silently ignore logout errors */ 
      });
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  const loadProfile = useCallback(async (authToken: string) => {
    try {
      const profile = await apiClient.get<UserProfile>('/api/auth/profile', authToken);
      setUser(profile);
      setToken(authToken);
    } catch (error) {
      // Só limpa os tokens se for erro de autenticação (401/403)
      // Erros de rede ou outros não devem deslogar o usuário
      if (error instanceof Error && 'status' in error) {
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      // Para outros erros (rede, etc), mantém o token mas não carrega o perfil
      // O usuário pode tentar novamente
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      loadProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    
    setToken(response.access_token);
    
    // Set basic user data first, then load full profile
    setUser({
      id: response.user.id,
      user_id: response.user.id,
      name: response.user.name || '',
      email: response.user.email,
      role: 'partner',
      company_id: null,
      can_create_users: false,
      is_super_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    // Load full profile to get can_create_users and company_id
    await loadProfile(response.access_token);
  }, [loadProfile]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
