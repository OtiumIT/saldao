import * as repo from './roteirizacao.repository.js';

export const roteirizacaoService = {
  listVeiculos: repo.listVeiculos,
  findVeiculoById: repo.findVeiculoById,
  createVeiculo: repo.createVeiculo,
  updateVeiculo: repo.updateVeiculo,
  listEntregas: repo.listEntregas,
  listPedidosPendentesEntrega: repo.listPedidosPendentesEntrega,
  createEntrega: repo.createEntrega,
  updateEntrega: repo.updateEntrega,
  marcarEntregue: repo.marcarEntregue,
  listEntregasAfetadasPorVeiculoInoperante: repo.listEntregasAfetadasPorVeiculoInoperante,
  reagendarEntregas: repo.reagendarEntregas,
  sugerirOrdemRota: repo.sugerirOrdemRota,
  aplicarOrdemRota: repo.aplicarOrdemRota,
};

/** Marca veículo como inoperante e retorna as entregas afetadas. */
export async function marcarVeiculoInoperante(
  veiculoId: string,
  motivo: string | null
): Promise<{ veiculo: repo.Veiculo | null; entregasAfetadas: repo.EntregaComPedido[] }> {
  const veiculo = await repo.updateVeiculo(veiculoId, {
    inoperante: true,
    inoperante_desde: new Date().toISOString(),
    inoperante_motivo: motivo ?? null,
  });
  const entregasAfetadas = veiculo ? await repo.listEntregasAfetadasPorVeiculoInoperante(veiculoId) : [];
  return { veiculo: veiculo ?? null, entregasAfetadas };
}
