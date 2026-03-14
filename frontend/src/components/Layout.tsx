import { ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { Sidebar, type NavCategory } from './Sidebar';
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
  const handleMobileClose = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const hasAdminAccess = user?.is_super_admin || user?.can_create_users;

  const userRole = useMemo(() => {
    if (user?.is_super_admin) return 'Admin';
    if (user?.can_create_users) return 'Gestão';
    return null;
  }, [user?.is_super_admin, user?.can_create_users]);

  const categories: NavCategory[] = useMemo(
    () => [
      {
        id: 'principal',
        label: 'Principal',
        alwaysOpen: true,
        items: [
          { name: 'Início', path: '/' },
          { name: 'Caixa', path: '/vendas/caixa' },
        ],
      },
      {
        id: 'vendas-relatorios',
        label: 'Vendas e Relatórios',
        items: [
          { name: 'Vendas', path: '/vendas' },
          { name: 'Clientes', path: '/clientes' },
          { name: 'Entregas', path: '/roteirizacao/entregas' },
          { name: 'Relatório de vendas', path: '/vendas/relatorio' },
          { name: 'Veículos', path: '/roteirizacao/veiculos' },
        ],
      },
      {
        id: 'compras',
        label: 'Compras e Estoque',
        items: [
          { name: 'Produtos', path: '/produtos' },
          { name: 'Compras', path: '/compras' },
          { name: 'Avisos de compra', path: '/avisos-compra' },
          { name: 'Estoque de Insumos', path: '/estoque/insumos' },
          { name: 'Estoque de Revenda', path: '/estoque/revenda' },
          { name: 'Estoque de Fabricados', path: '/estoque/fabricados' },
          { name: 'Movimentações', path: '/estoque/movimentacoes' },
          { name: 'Conferência de estoque', path: '/estoque/conferencia' },
        ],
      },
      {
        id: 'producao',
        label: 'Produção',
        items: [
          { name: 'BOM (receita)', path: '/producao/bom' },
          { name: 'Ordens de produção', path: '/producao/ordens' },
        ],
      },
      {
        id: 'financeiro',
        label: 'Financeiro',
        items: [
          { name: 'Contas a pagar', path: '/financeiro/contas-pagar' },
          { name: 'Contas a receber', path: '/financeiro/contas-receber' },
          { name: 'Resumo financeiro', path: '/financeiro/resumo' },
        ],
      },
      {
        id: 'cadastros',
        label: 'Cadastros',
        defaultCollapsed: true,
        items: [
          { name: 'Fornecedores', path: '/fornecedores' },
          { name: 'Funcionários', path: '/funcionarios' },
          { name: 'Categorias de produto', path: '/categorias-produto' },
          { name: 'Cores (chapas)', path: '/cores' },
          { name: 'Parcelamento', path: '/parcelamento' },
          { name: 'Extras de entrega', path: '/opcoes-entrega' },
          ...(hasAdminAccess ? [{ name: 'Usuários', path: '/users' }] : []),
        ],
      },
      {
        id: 'config',
        label: 'Config',
        items: [
          { name: 'Categorias de custo', path: '/custos-operacionais/categorias' },
          { name: 'Custos do mês', path: '/custos-operacionais/mes' },
          { name: 'Folha de pagamento', path: '/funcionarios/folha' },
        ],
      },
    ],
    [hasAdminAccess]
  );

  return (
    <div className="min-h-screen flex min-h-[100dvh] bg-[var(--color-app-bg)]">
      <Sidebar
        categories={categories}
        user={
          user
            ? {
                email: user.email,
                name: user.name,
                role: userRole,
              }
            : undefined
        }
        onLogout={logout}
        mobileOpen={sidebarOpen}
        onMobileClose={handleMobileClose}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar apenas no mobile: hambúrguer + logo + espaço */}
        <header className="sticky top-0 z-30 flex justify-between items-center px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] touch-manipulation"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center min-w-0">
            <img src="/logo.png" alt="Saldão de Móveis Jerusalém" className="h-9 w-auto object-contain" />
          </Link>
          <div className="w-10 h-10 flex-shrink-0" aria-hidden />
        </header>

        <main className="flex-1 min-w-0 overflow-auto bg-[var(--color-app-bg)]">
          <div className="p-5 md:p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
