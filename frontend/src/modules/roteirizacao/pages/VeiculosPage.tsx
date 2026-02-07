import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as roteirizacaoService from '../services/roteirizacao.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { DataTable } from '../../../components/ui/DataTable';
import type { Veiculo, EntregaComPedido } from '../types/roteirizacao.types';

/** Gera link wa.me com número (apenas dígitos) e mensagem opcional. */
function getWhatsAppUrl(numero: string, mensagem = ''): string {
  const digits = numero.replace(/\D/g, '');
  if (!digits) return '#';
  const url = new URL(`https://wa.me/${digits}`);
  if (mensagem.trim()) url.searchParams.set('text', mensagem.trim());
  return url.toString();
}

export function VeiculosPage() {
  const { token } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalAberta, setModalAberta] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [dias_entrega, setDiasEntrega] = useState('');
  const [horario_inicio, setHorarioInicio] = useState('');
  const [horario_fim, setHorarioFim] = useState('');
  const [capacidade_volume, setCapacidadeVolume] = useState('');
  const [capacidade_itens, setCapacidadeItens] = useState('');
  const [capacidade_peso_kg, setCapacidadePesoKg] = useState('');
  const [carga_comprimento_m, setCargaComprimentoM] = useState('');
  const [carga_largura_m, setCargaLarguraM] = useState('');
  const [carga_altura_m, setCargaAlturaM] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [motorista_whatsapp, setMotoristaWhatsapp] = useState('');
  const [inoperante, setInoperante] = useState(false);
  const [inoperante_motivo, setInoperanteMotivo] = useState('');
  const [modalInoperante, setModalInoperante] = useState<{ veiculo: Veiculo; entregasAfetadas: EntregaComPedido[] } | null>(null);
  const [reagendarVeiculoId, setReagendarVeiculoId] = useState('');
  const [reagendarData, setReagendarData] = useState('');
  const [reagendando, setReagendando] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await roteirizacaoService.listVeiculos(token);
      setVeiculos(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const openNew = () => {
    setEditing(null);
    setNome('');
    setPlaca('');
    setDiasEntrega('');
    setHorarioInicio('');
    setHorarioFim('');
    setCapacidadeVolume('');
    setCapacidadeItens('');
    setCapacidadePesoKg('');
    setCargaComprimentoM('');
    setCargaLarguraM('');
    setCargaAlturaM('');
    setObservacoes('');
    setMotoristaWhatsapp('');
    setInoperante(false);
    setInoperanteMotivo('');
    setModalAberta(true);
  };

  const openEdit = (v: Veiculo) => {
    setEditing(v);
    setNome(v.nome);
    setPlaca(v.placa ?? '');
    setDiasEntrega(v.dias_entrega ?? '');
    setHorarioInicio((v.horario_inicio ?? '').slice(0, 5));
    setHorarioFim((v.horario_fim ?? '').slice(0, 5));
    setCapacidadeVolume(v.capacidade_volume != null ? String(v.capacidade_volume) : '');
    setCapacidadeItens(v.capacidade_itens != null ? String(v.capacidade_itens) : '');
    setCapacidadePesoKg(v.capacidade_peso_kg != null ? String(v.capacidade_peso_kg) : '');
    setCargaComprimentoM(v.carga_comprimento_m != null ? String(v.carga_comprimento_m) : '');
    setCargaLarguraM(v.carga_largura_m != null ? String(v.carga_largura_m) : '');
    setCargaAlturaM(v.carga_altura_m != null ? String(v.carga_altura_m) : '');
    setObservacoes(v.observacoes ?? '');
    setMotoristaWhatsapp(v.motorista_whatsapp ?? '');
    setInoperante(v.inoperante ?? false);
    setInoperanteMotivo(v.inoperante_motivo ?? '');
    setModalAberta(true);
  };

  const handleMarcarInoperante = async (v: Veiculo) => {
    if (!token) return;
    if (!confirm(`Marcar "${v.nome}" como inoperante? Entregas agendadas precisarão ser reagendadas.`)) return;
    try {
      const res = await roteirizacaoService.marcarVeiculoInoperante(token, v.id, null);
      setModalInoperante({ veiculo: res.veiculo, entregasAfetadas: res.entregasAfetadas });
      if (res.entregasAfetadas.length > 0) {
        setReagendarVeiculoId(veiculos.find((x) => !x.inoperante)?.id ?? '');
        setReagendarData(res.entregasAfetadas[0]?.data_entrega_prevista ?? new Date().toISOString().slice(0, 10));
      }
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  const handleReagendar = async () => {
    if (!token || !modalInoperante || modalInoperante.entregasAfetadas.length === 0) return;
    setReagendando(true);
    try {
      const ids = modalInoperante.entregasAfetadas.map((e) => e.id);
      await roteirizacaoService.reagendarEntregas(token, {
        entrega_ids: ids,
        novo_veiculo_id: reagendarVeiculoId || null,
        nova_data: reagendarData || null,
      });
      setModalInoperante(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    } finally {
      setReagendando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const data = {
        nome,
        placa: placa.trim() || null,
        dias_entrega: dias_entrega.trim() || null,
        horario_inicio: horario_inicio ? horario_inicio + ':00' : null,
        horario_fim: horario_fim ? horario_fim + ':00' : null,
        capacidade_volume: capacidade_volume ? parseFloat(capacidade_volume) : null,
        capacidade_itens: capacidade_itens ? parseInt(capacidade_itens, 10) : null,
        capacidade_peso_kg: capacidade_peso_kg ? parseFloat(capacidade_peso_kg) : null,
        carga_comprimento_m: carga_comprimento_m ? parseFloat(carga_comprimento_m) : null,
        carga_largura_m: carga_largura_m ? parseFloat(carga_largura_m) : null,
        carga_altura_m: carga_altura_m ? parseFloat(carga_altura_m) : null,
        observacoes: observacoes.trim() || null,
        motorista_whatsapp: motorista_whatsapp.trim() || null,
        inoperante: editing ? inoperante : false,
        inoperante_motivo: inoperante ? (inoperante_motivo.trim() || null) : null,
      };
      if (editing) {
        await roteirizacaoService.updateVeiculo(token, editing.id, data);
      } else {
        await roteirizacaoService.createVeiculo(token, data);
      }
      setModalAberta(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
        <Button onClick={openNew}>Novo veículo</Button>
      </div>
      <p className="text-gray-600">Cadastre os veículos com dias e horários de entrega e capacidade (volume ou quantidade de itens) para roteirização.</p>
      {loading && veiculos.length === 0 ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <DataTable
          data={veiculos}
          columns={[
            { key: 'nome', label: 'Nome', sortable: true, sortValue: (v: Veiculo) => v.nome },
            { key: 'placa', label: 'Placa', render: (v: Veiculo) => v.placa ?? '-', sortValue: (v: Veiculo) => v.placa ?? '' },
            { key: 'motorista_whatsapp', label: 'WhatsApp', render: (v: Veiculo) => v.motorista_whatsapp ? <a href={getWhatsAppUrl(v.motorista_whatsapp)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{v.motorista_whatsapp}</a> : '-', sortValue: (v: Veiculo) => v.motorista_whatsapp ?? '' },
            { key: 'inoperante', label: 'Status', render: (v: Veiculo) => (v.inoperante ? <span className="text-amber-600 font-medium">Inoperante</span> : <span className="text-green-600">Ativo</span>), sortValue: (v: Veiculo) => (v.inoperante ? 1 : 0) },
            { key: 'dias_entrega', label: 'Dias entrega', render: (v: Veiculo) => v.dias_entrega ?? '-', sortValue: (v: Veiculo) => v.dias_entrega ?? '' },
            { key: 'horario_inicio', label: 'Horário', render: (v: Veiculo) => (v.horario_inicio && v.horario_fim ? `${v.horario_inicio.slice(0, 5)} - ${v.horario_fim.slice(0, 5)}` : '-'), sortValue: () => '' },
            { key: 'capacidade_itens', label: 'Cap. itens', render: (v: Veiculo) => v.capacidade_itens ?? '-', sortValue: (v: Veiculo) => v.capacidade_itens ?? 0 },
            {
              key: 'actions',
              label: 'Ações',
              render: (v: Veiculo) => (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(v)}>Editar</Button>
                  {v.motorista_whatsapp && (
                    <Button variant="secondary" size="sm" className="text-green-600" onClick={() => window.open(getWhatsAppUrl(v.motorista_whatsapp!, ''), '_blank')} title="Abrir WhatsApp">WhatsApp</Button>
                  )}
                  {!v.inoperante && (
                    <Button variant="secondary" size="sm" className="text-amber-600" onClick={() => handleMarcarInoperante(v)}>Marcar inoperante</Button>
                  )}
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhum veículo"
        />
      )}
      <Modal isOpen={modalAberta} onClose={() => setModalAberta(false)} title={editing ? 'Editar veículo' : 'Novo veículo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Input label="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          <Input label="Dias de entrega (ex: seg,qua,sex)" value={dias_entrega} onChange={(e) => setDiasEntrega(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Horário início" type="time" value={horario_inicio} onChange={(e) => setHorarioInicio(e.target.value)} />
            <Input label="Horário fim" type="time" value={horario_fim} onChange={(e) => setHorarioFim(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacidade volume (m³)" type="number" step="0.01" value={capacidade_volume} onChange={(e) => setCapacidadeVolume(e.target.value)} />
            <Input label="Capacidade itens" type="number" value={capacidade_itens} onChange={(e) => setCapacidadeItens(e.target.value)} />
            <Input label="Capacidade peso (kg)" type="number" step="0.01" value={capacidade_peso_kg} onChange={(e) => setCapacidadePesoKg(e.target.value)} />
          </div>
          <p className="text-sm text-gray-500">Dimensões da carga (para roteirização)</p>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Comprimento (m)" type="number" step="0.01" value={carga_comprimento_m} onChange={(e) => setCargaComprimentoM(e.target.value)} />
            <Input label="Largura (m)" type="number" step="0.01" value={carga_largura_m} onChange={(e) => setCargaLarguraM(e.target.value)} />
            <Input label="Altura (m)" type="number" step="0.01" value={carga_altura_m} onChange={(e) => setCargaAlturaM(e.target.value)} />
          </div>
          <Input label="Observações" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          <Input label="WhatsApp do motorista" value={motorista_whatsapp} onChange={(e) => setMotoristaWhatsapp(e.target.value)} placeholder="Ex: 5511999999999 (DDI + DDD + número)" />
          {editing && (
            <div className="border rounded p-3 space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={inoperante} onChange={(e) => setInoperante(e.target.checked)} />
                <span className="font-medium text-amber-700">Veículo inoperante</span>
              </label>
              {inoperante && (
                <Input label="Motivo (ex: manutenção, avaria)" value={inoperante_motivo} onChange={(e) => setInoperanteMotivo(e.target.value)} />
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalAberta(false)}>Cancelar</Button>
            <Button type="submit">{editing ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!modalInoperante} onClose={() => setModalInoperante(null)} title="Reagendar entregas">
        {modalInoperante && (
          <div className="space-y-4">
            <p className="text-gray-600">
              O veículo <strong>{modalInoperante.veiculo.nome}</strong> foi marcado como inoperante.
              {modalInoperante.entregasAfetadas.length > 0
                ? ` ${modalInoperante.entregasAfetadas.length} entrega(s) precisam ser reagendadas.`
                : ' Nenhuma entrega pendente para este veículo.'}
            </p>
            {modalInoperante.entregasAfetadas.length > 0 && (
              <>
                <ul className="text-sm border rounded p-2 max-h-40 overflow-y-auto">
                  {modalInoperante.entregasAfetadas.map((e) => (
                    <li key={e.id}>{e.cliente_nome ?? 'Cliente'} – {e.data_entrega_prevista ?? '?'} – {e.endereco_entrega?.slice(0, 40)}…</li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Novo veículo</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={reagendarVeiculoId}
                      onChange={(e) => setReagendarVeiculoId(e.target.value)}
                    >
                      <option value="">— Manter —</option>
                      {veiculos.filter((x) => !x.inoperante && x.id !== modalInoperante.veiculo.id).map((x) => (
                        <option key={x.id} value={x.id}>{x.nome}</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Nova data" type="date" value={reagendarData} onChange={(e) => setReagendarData(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={() => setModalInoperante(null)}>Fechar</Button>
                  <Button onClick={handleReagendar} disabled={reagendando}>{reagendando ? 'Reagendando…' : 'Reagendar entregas'}</Button>
                </div>
              </>
            )}
            {modalInoperante.entregasAfetadas.length === 0 && (
              <Button onClick={() => setModalInoperante(null)}>Fechar</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
