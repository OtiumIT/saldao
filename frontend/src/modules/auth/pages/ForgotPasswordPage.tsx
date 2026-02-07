import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber o link de recuperação
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
