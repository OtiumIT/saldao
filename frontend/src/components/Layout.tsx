import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { Sidebar, type NavItem } from './Sidebar';
import { Footer } from './Footer';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const handleMobileClose = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const hasAdminAccess = user?.is_super_admin || user?.can_create_users;

  // Menu: páginas mais acessadas no dia a dia no topo
  const navigation: NavItem[] = [
    { name: 'Início', path: '/' },
    { name: 'Caixa', path: '/vendas/caixa' },
    { name: 'Vendas', path: '/vendas' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Entregas', path: '/roteirizacao/entregas' },
    { name: 'Produtos', path: '/produtos' },

    { name: 'Compras e Estoque', isSection: true },
    { name: 'Compras', path: '/compras' },
    { name: 'Avisos de compra', path: '/avisos-compra' },
    { name: 'Estoque de Insumos', path: '/estoque/insumos' },
    { name: 'Estoque de Revenda', path: '/estoque/revenda' },
    { name: 'Estoque de Fabricados', path: '/estoque/fabricados' },
    { name: 'Movimentações', path: '/estoque/movimentacoes' },
    { name: 'Conferência de estoque', path: '/estoque/conferencia' },

    { name: 'Produção', isSection: true },
    { name: 'BOM (receita)', path: '/producao/bom' },
    { name: 'Ordens de produção', path: '/producao/ordens' },

    { name: 'Vendas e Relatórios', isSection: true },
    { name: 'Relatório de vendas', path: '/vendas/relatorio' },
    { name: 'Veículos', path: '/roteirizacao/veiculos' },

    { name: 'Financeiro', isSection: true },
    { name: 'Contas a pagar', path: '/financeiro/contas-pagar' },
    { name: 'Contas a receber', path: '/financeiro/contas-receber' },
    { name: 'Resumo financeiro', path: '/financeiro/resumo' },

    { name: 'Cadastros e Config', isSection: true },
    {
      name: 'Cadastros',
      defaultCollapsed: true,
      children: [
        { name: 'Fornecedores', path: '/fornecedores' },
        { name: 'Funcionários', path: '/funcionarios' },
        { name: 'Categorias de produto', path: '/categorias-produto' },
        { name: 'Cores (chapas)', path: '/cores' },
        { name: 'Parcelamento', path: '/parcelamento' },
        { name: 'Extras de entrega', path: '/opcoes-entrega' },
        ...(hasAdminAccess ? [{ name: 'Usuários', path: '/users' }] : []),
      ],
    },
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
          <div className="px-3 py-2 sm:px-6 sm:py-3">
            <div className="flex justify-between items-center gap-2 min-h-[44px]">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  aria-label="Abrir menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link to="/" className="flex items-center gap-2 min-w-0">
                  <img
                    src="/logo.png"
                    alt=""
                    className="h-7 sm:h-9 w-auto flex-shrink-0 object-contain"
                  />
                  <div className="flex flex-col min-w-0 hidden sm:block">
                    <span className="text-sm font-bold text-gray-900 leading-tight truncate">Saldão de Móveis</span>
                    <span className="text-xs text-gray-500 leading-tight">Sistema de gestão</span>
                  </div>
                  <span className="sm:hidden text-sm font-semibold text-gray-900 truncate">Saldão</span>
                </Link>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Link
                  to="/vendas/caixa"
                  className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center rounded-lg bg-brand-gold hover:bg-brand-gold-dark text-brand-black shadow-sm touch-manipulation"
                  title="Caixa"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-semibold ml-1">Caixa</span>
                </Link>
                <Link
                  to="/vendas"
                  className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200 touch-manipulation"
                  title="Vendas"
                >
                  <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Vendas</span>
                </Link>
                <Link
                  to="/roteirizacao/entregas"
                  className="w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200 touch-manipulation"
                  title="Entregas"
                >
                  <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Entregas</span>
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="w-10 h-10 sm:w-auto sm:min-w-0 sm:min-h-0 sm:px-3 sm:py-2 flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 touch-manipulation"
                    aria-label="Menu do usuário"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="w-7 h-7 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-sm text-gray-700 truncate max-w-[120px]">
                      {user?.name || user?.email}
                    </span>
                    <svg className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 py-1 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Usuário'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
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
