import { useState, FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../shared/lib/api-client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-semibold">Email enviado!</p>
          <p className="text-sm mt-1">
            Verifique sua caixa de entrada. Você receberá um link para redefinir sua senha.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setSuccess(false);
            setEmail('');
          }}
          className="w-full"
        >
          Enviar novamente
        </Button>
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

      <div>
        <p className="text-sm text-gray-600 mb-4">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        placeholder="seu@email.com"
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
      </Button>
    </form>
  );
}
