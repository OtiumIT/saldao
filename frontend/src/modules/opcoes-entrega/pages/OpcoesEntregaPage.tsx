import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as opcoesService from '../services/opcoes-entrega.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { OpcaoEntrega, TipoOpcaoEntrega } from '../types/opcoes-entrega.types';

const TIPO_LABEL: Record<TipoOpcaoEntrega, string> = {
  fixo: 'Valor fixo',
  por_andar: 'Por andar',
};

const CONFIG_EXTRAS_CHAVE = 'extras_livre_label';

export function OpcoesEntregaPage() {
  const { token } = useAuth();
  const [opcoes, setOpcoes] = useState<OpcaoEntrega[]>([]);
  const [extrasLabel, setExtrasLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OpcaoEntrega | undefined>();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoOpcaoEntrega>('fixo');
  const [valorFixo, setValorFixo] = useState('');
  const [valorPorAndar, setValorPorAndar] = useState('');
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingExtras, setSavingExtras] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [list, label] = await Promise.all([
        opcoesService.list(token),
        opcoesService.getConfig(CONFIG_EXTRAS_CHAVE, token),
      ]);
      setOpcoes(list);
      setExtrasLabel(label ?? '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const openCreate = () => {
    setEditing(undefined);
    setNome('');
    setTipo('fixo');
    setValorFixo('');
    setValorPorAndar('');
    setOrdem(opcoes.length);
    setAtivo(true);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (o: OpcaoEntrega) => {
    setEditing(o);
    setNome(o.nome);
    setTipo(o.tipo);
    setValorFixo(o.valor_fixo != null ? String(o.valor_fixo) : '');
    setValorPorAndar(o.valor_por_andar != null ? String(o.valor_por_andar) : '');
    setOrdem(o.ordem);
    setAtivo(o.ativo);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');
    setSubmitting(true);
    try {
      const valorFixoNum = valorFixo.trim() === '' ? null : Number(valorFixo.replace(',', '.'));
      const valorPorAndarNum = valorPorAndar.trim() === '' ? null : Number(valorPorAndar.replace(',', '.'));

      if (editing) {
        await opcoesService.update(
          editing.id,
          {
            nome: nome.trim(),
            tipo,
            valor_fixo: tipo === 'fixo' ? valorFixoNum : null,
            valor_por_andar: tipo === 'por_andar' ? valorPorAndarNum : null,
            ordem,
            ativo,
          },
          token
        );
      } else {
        await opcoesService.create(
          {
            nome: nome.trim(),
            tipo,
            valor_fixo: tipo === 'fixo' ? valorFixoNum ?? 0 : null,
            valor_por_andar: tipo === 'por_andar' ? valorPorAndarNum ?? 0 : null,
            ordem,
            ativo,
          },
          token
        );
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (o: OpcaoEntrega) => {
    if (!token || !window.confirm(`Excluir "${o.nome}"?`)) return;
    try {
      await opcoesService.remove(o.id, token);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const handleSaveExtrasLabel = async () => {
    if (!token) return;
    setSavingExtras(true);
    try {
      await opcoesService.setConfig(CONFIG_EXTRAS_CHAVE, extrasLabel.trim() || null, token);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSavingExtras(false);
    }
  };

  const valorDisplay = (o: OpcaoEntrega) => {
    if (o.tipo === 'fixo') return o.valor_fixo != null ? `R$ ${Number(o.valor_fixo).toFixed(2)}` : '—';
    return o.valor_por_andar != null ? `R$ ${Number(o.valor_por_andar).toFixed(2)}/andar` : '—';
  };

  if (loading && opcoes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Preços extras da entrega</h1>
        <p className="text-gray-600 text-sm mt-1">
          Opções como entregar na portaria, prédio com elevador ou escadas (valor por andar). Use na venda com entrega.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Opções cadastradas</h2>
          <Button onClick={openCreate}>Nova opção</Button>
        </div>
        {opcoes.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma opção. Clique em &quot;Nova opção&quot; para criar (ex.: Entregar na portaria, Prédio com elevador, Por andar).
          </div>
        ) : (
          <DataTable
            data={opcoes}
            columns={[
              { key: 'ordem', label: 'Ordem', render: (o) => o.ordem, sortValue: (o) => o.ordem },
              { key: 'nome', label: 'Nome', sortable: true, sortValue: (o) => o.nome.toLowerCase() },
              { key: 'tipo', label: 'Tipo', render: (o) => TIPO_LABEL[o.tipo], sortValue: (o) => o.tipo },
              { key: 'valor', label: 'Valor', render: (o) => valorDisplay(o) },
              {
                key: 'ativo',
                label: 'Ativo',
                render: (o) => (o.ativo ? 'Sim' : 'Não'),
                sortValue: (o) => (o.ativo ? '1' : '0'),
              },
              {
                key: 'actions',
                label: 'Ações',
                render: (o) => (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(o)}>Editar</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(o)}>Excluir</Button>
                  </div>
                ),
              },
            ]}
            emptyMessage="Nenhuma opção"
          />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-2">Campo aberto de extras</h2>
        <p className="text-gray-600 text-sm mb-4">
          Label ou instrução do campo livre que aparecerá na venda (ex.: &quot;Outros extras&quot;). O cliente poderá informar valores adicionais em texto.
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="extras-label" className="block text-sm font-medium text-gray-700 mb-1">Texto do campo</label>
            <input
              id="extras-label"
              type="text"
              value={extrasLabel}
              onChange={(e) => setExtrasLabel(e.target.value)}
              placeholder="Ex.: Outros extras"
              className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <Button onClick={handleSaveExtrasLabel} disabled={savingExtras}>
            {savingExtras ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar opção' : 'Nova opção'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
          )}
          <Input label="Nome *" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={submitting} placeholder="Ex.: Entregar na portaria" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoOpcaoEntrega)}
              className="w-full min-h-[40px] px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="fixo">Valor fixo (ex.: portaria, elevador)</option>
              <option value="por_andar">Valor por andar (ex.: escadas)</option>
            </select>
          </div>
          {tipo === 'fixo' && (
            <Input
              label="Valor fixo (R$)"
              type="text"
              inputMode="decimal"
              value={valorFixo}
              onChange={(e) => setValorFixo(e.target.value)}
              placeholder="0,00"
              disabled={submitting}
            />
          )}
          {tipo === 'por_andar' && (
            <Input
              label="Valor por andar (R$)"
              type="text"
              inputMode="decimal"
              value={valorPorAndar}
              onChange={(e) => setValorPorAndar(e.target.value)}
              placeholder="0,00"
              disabled={submitting}
            />
          )}
          <Input
            label="Ordem"
            type="number"
            min={0}
            value={String(ordem)}
            onChange={(e) => setOrdem(Number(e.target.value) || 0)}
            disabled={submitting}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="ativo" className="text-sm text-gray-700">Ativo</label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
