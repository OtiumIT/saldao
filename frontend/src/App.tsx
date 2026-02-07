import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { useAuth } from './modules/auth/hooks/useAuth';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/auth/pages/ResetPasswordPage';
import { UsersListPage } from './modules/auth/pages/UsersListPage';
import { ClientsListPage } from './modules/clientes/pages/ClientsListPage';
import { SuppliersListPage } from './modules/fornecedores/pages/SuppliersListPage';
import { ProductsListPage } from './modules/estoque/pages/ProductsListPage';
import { MovimentacoesPage } from './modules/estoque/pages/MovimentacoesPage';
import { ConferenciaEstoquePage } from './modules/estoque/pages/ConferenciaEstoquePage';
import { ComprasListPage } from './modules/compras/pages/ComprasListPage';
import { AvisosCompraPage } from './modules/avisos-compra/pages/AvisosCompraPage';
import { ProducaoBomPage } from './modules/producao/pages/ProducaoBomPage';
import { ProducaoOrdensPage } from './modules/producao/pages/ProducaoOrdensPage';
import { VendasListPage } from './modules/vendas/pages/VendasListPage';
import { ContasPagarPage } from './modules/financeiro/pages/ContasPagarPage';
import { ContasReceberPage } from './modules/financeiro/pages/ContasReceberPage';
import { ResumoFinanceiroPage } from './modules/financeiro/pages/ResumoFinanceiroPage';
import { VeiculosPage } from './modules/roteirizacao/pages/VeiculosPage';
import { EntregasPage } from './modules/roteirizacao/pages/EntregasPage';
import { CategoriasCustoPage } from './modules/custos-operacionais/pages/CategoriasCustoPage';
import { CustosMesPage } from './modules/custos-operacionais/pages/CustosMesPage';
import { CategoriasProdutoPage } from './modules/categorias-produto/pages/CategoriasProdutoPage';
import { CoresListPage } from './modules/cores/pages/CoresListPage';
import { FuncionariosListPage } from './modules/funcionarios/pages/FuncionariosListPage';
import { FolhaPagamentoPage } from './modules/funcionarios/pages/FolhaPagamentoPage';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><ClientsListPage /></ProtectedRoute>} />
          <Route path="/fornecedores" element={<ProtectedRoute><SuppliersListPage /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><ProductsListPage /></ProtectedRoute>} />
          <Route path="/categorias-produto" element={<ProtectedRoute><CategoriasProdutoPage /></ProtectedRoute>} />
          <Route path="/cores" element={<ProtectedRoute><CoresListPage /></ProtectedRoute>} />
          <Route path="/estoque/movimentacoes" element={<ProtectedRoute><MovimentacoesPage /></ProtectedRoute>} />
          <Route path="/estoque/conferencia" element={<ProtectedRoute><ConferenciaEstoquePage /></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute><ComprasListPage /></ProtectedRoute>} />
          <Route path="/avisos-compra" element={<ProtectedRoute><AvisosCompraPage /></ProtectedRoute>} />
          <Route path="/producao/bom" element={<ProtectedRoute><ProducaoBomPage /></ProtectedRoute>} />
          <Route path="/producao/ordens" element={<ProtectedRoute><ProducaoOrdensPage /></ProtectedRoute>} />
          <Route path="/vendas" element={<ProtectedRoute><VendasListPage /></ProtectedRoute>} />
          <Route path="/financeiro/contas-pagar" element={<ProtectedRoute><ContasPagarPage /></ProtectedRoute>} />
          <Route path="/financeiro/contas-receber" element={<ProtectedRoute><ContasReceberPage /></ProtectedRoute>} />
          <Route path="/financeiro/resumo" element={<ProtectedRoute><ResumoFinanceiroPage /></ProtectedRoute>} />
          <Route path="/roteirizacao/veiculos" element={<ProtectedRoute><VeiculosPage /></ProtectedRoute>} />
          <Route path="/roteirizacao/entregas" element={<ProtectedRoute><EntregasPage /></ProtectedRoute>} />
          <Route path="/custos-operacionais/categorias" element={<ProtectedRoute><CategoriasCustoPage /></ProtectedRoute>} />
          <Route path="/custos-operacionais/mes" element={<ProtectedRoute><CustosMesPage /></ProtectedRoute>} />
          <Route path="/funcionarios" element={<ProtectedRoute><FuncionariosListPage /></ProtectedRoute>} />
          <Route path="/funcionarios/folha" element={<ProtectedRoute><FolhaPagamentoPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
