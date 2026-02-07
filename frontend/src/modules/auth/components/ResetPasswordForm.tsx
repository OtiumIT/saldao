import { useState, FormEvent, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../shared/lib/api-client';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');
  
  const [token, setToken] = useState<string | null>(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const hasTriedGenerateToken = useRef(false); // Flag para evitar múltiplas chamadas

  // Se não houver token mas houver email, gerar um novo token (apenas uma vez)
  useEffect(() => {
    // Evitar loop infinito: só tentar gerar token uma vez
    if (!token && emailFromUrl && !generatingToken && !hasTriedGenerateToken.current) {
      hasTriedGenerateToken.current = true;
      setGeneratingToken(true);
      setError('');
      
      const generateToken = async () => {
        try {
          const response = await apiClient.post<{ token?: string }>('/api/auth/reset-password', { email: emailFromUrl });
          if (response.token) {
            setToken(response.token);
            setError('');
          } else {
            setError('Não foi possível gerar um novo token. Solicite um novo link de recuperação.');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao gerar token. Solicite um novo link de recuperação.');
        } finally {
          setGeneratingToken(false);
        }
      };
      generateToken();
    }
  }, [token, emailFromUrl]); // Removido generatingToken das dependências para evitar loop

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token inválido ou expirado');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  if (generatingToken) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
        <p>Gerando novo token de recuperação...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Token inválido ou expirado. Por favor, solicite um novo link de recuperação.</p>
        {emailFromUrl && (
          <p className="text-sm mt-2">
            Tentando gerar um novo token para {emailFromUrl}...
          </p>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p className="font-semibold">Senha redefinida com sucesso!</p>
        <p className="text-sm mt-1">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Input
        label="Nova Senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        minLength={6}
      />

      <Input
        label="Confirmar Nova Senha"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={loading}
        minLength={6}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
      </Button>
    </form>
  );
}
