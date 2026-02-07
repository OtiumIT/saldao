import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Email é obrigatório');
      setLoading(false);
      return;
    }

    if (!password || password.trim().length === 0) {
      setError('Senha é obrigatória');
      setLoading(false);
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
      {error && (
        <div className="bg-red-900/40 border border-red-400 text-red-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <Input
          type="email"
          placeholder="E-mail de acesso"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
          variant="dark"
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Sua senha secreta"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          autoComplete="current-password"
          variant="dark"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full mt-2.5 rounded-[14px] py-4 text-base font-bold hover:bg-brand-goldBright hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
      >
        {loading ? 'Entrando...' : 'Entrar no Sistema'}
      </Button>

      <div className="text-center mt-6">
        <Link
          to="/forgot-password"
          className="text-sm text-[#666] hover:text-brand-gold transition-colors duration-300 focus:outline-none focus:underline"
        >
          Esqueceu sua senha?
        </Link>
      </div>
    </form>
  );
}
