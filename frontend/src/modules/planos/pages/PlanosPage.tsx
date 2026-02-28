import { PLANOS } from '../../../shared/constants/planos';

/**
 * Página de planos: exibe apenas Standard e Pro com limites de usuários e clientes ativos.
 * Itens internos (Arquivos fiscais, SPED, ECD, PGDAS, Relatórios, Analytics, Cobrança, Suporte por e-mail)
 * não são exibidos.
 */
export function PlanosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
        <p className="text-gray-600 text-sm mt-1">
          Escolha o plano adequado ao seu uso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900">{plano.nome}</h2>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li>Até {plano.maxUsuarios} usuários</li>
              <li>Clientes ilimitados</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
