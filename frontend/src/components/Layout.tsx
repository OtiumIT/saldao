import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { Sidebar, type NavItem } from './Sidebar';
import { Footer } from './Footer';
import { BugReportButton } from './BugReportButton';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getStoredCollapsed);
  const handleMobileClose = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const hasAdminAccess = user?.is_super_admin || user?.can_create_users;

  // Menu: Cadastros no topo; depois trilhas de uso (estoque, produção, vendas, etc.)
  const navigation: NavItem[] = [
    { name: 'Início', path: '/' },

    {
      name: 'Cadastros',
      defaultCollapsed: true,
      children: [
        { name: 'Clientes', path: '/clientes' },
        { name: 'Fornecedores', path: '/fornecedores' },
        { name: 'Funcionários', path: '/funcionarios' },
        { name: 'Produtos', path: '/produtos' },
        { name: 'Categorias de produto', path: '/categorias-produto' },
        { name: 'Cores (chapas)', path: '/cores' },
        { name: 'BOM (receita)', path: '/producao/bom' },
        ...(hasAdminAccess ? [{ name: 'Usuários', path: '/users' }] : []),
      ],
    },

    { name: 'Estoque e Compras', isSection: true },
    { name: 'Movimentações', path: '/estoque/movimentacoes' },
    { name: 'Conferência de estoque', path: '/estoque/conferencia' },
    { name: 'Avisos de compra', path: '/avisos-compra' },
    { name: 'Compras', path: '/compras' },

    { name: 'Produção', isSection: true },
    { name: 'BOM (receita)', path: '/producao/bom' },
    { name: 'Ordens de produção', path: '/producao/ordens' },

    { name: 'Vendas e Entregas', isSection: true },
    { name: 'Vendas', path: '/vendas' },
    { name: 'Entregas', path: '/roteirizacao/entregas' },
    { name: 'Veículos', path: '/roteirizacao/veiculos' },

    { name: 'Financeiro', isSection: true },
    { name: 'Contas a pagar', path: '/financeiro/contas-pagar' },
    { name: 'Contas a receber', path: '/financeiro/contas-receber' },
    { name: 'Resumo financeiro', path: '/financeiro/resumo' },

    { name: 'Custos e Folha', isSection: true },
    { name: 'Categorias de custo', path: '/custos-operacionais/categorias' },
    { name: 'Custos do mês', path: '/custos-operacionais/mes' },
    { name: 'Folha de pagamento', path: '/funcionarios/folha' },
  ];

  return (
    <div className="min-h-screen flex min-h-[100dvh] bg-gray-50">
      <Sidebar
        items={navigation}
        mobileOpen={sidebarOpen}
        onMobileClose={handleMobileClose}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-3 py-3 sm:px-6 sm:py-3">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden flex-shrink-0 min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 touch-manipulation cursor-pointer"
                  aria-label="Abrir menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <img
                  src="/logo.png"
                  alt="Saldão de Móveis Jerusalém"
                  className="h-8 w-auto sm:h-9 flex-shrink-0 object-contain"
                />
                <div className="flex flex-col min-w-0 hidden sm:block">
                  <span className="text-sm font-bold text-gray-900 leading-tight truncate">Saldão de Móveis</span>
                  <span className="text-xs text-gray-500 leading-tight">Sistema de gestão</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/vendas"
                    className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:px-3 sm:py-2 flex items-center justify-center sm:justify-start rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-brand-black shadow-sm hover:shadow transition-colors touch-manipulation"
                    title="Vendas"
                  >
                    <svg className="w-5 h-5 sm:mr-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="hidden sm:inline text-sm font-semibold">Vendas</span>
                  </Link>
                  <Link
                    to="/roteirizacao/entregas"
                    className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:px-3 sm:py-2 flex items-center justify-center sm:justify-start rounded-lg bg-gray-800 hover:bg-gray-900 text-white border border-gray-700 transition-colors touch-manipulation"
                    title="Entregas"
                  >
                    <svg className="w-5 h-5 sm:mr-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="hidden sm:inline text-sm font-semibold">Entregas</span>
                  </Link>
                </div>
                <BugReportButton />
                <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] sm:max-w-none">
                  {user?.name || user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 overflow-auto bg-gray-50">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
