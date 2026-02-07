import * as repo from './producao.repository.js';

export const producaoService = {
  listBomByFabricado: repo.listBomByFabricado,
  saveBomItem: repo.saveBomItem,
  removeBomItem: repo.removeBomItem,
  quantidadePossivel: repo.quantidadePossivel,
  listOrdens: repo.listOrdens,
  listOrdensItens: repo.listOrdensItens,
  createOrdem: repo.createOrdem,
  executarOrdem: repo.executarOrdem,
  conferirEstoquePorCor: repo.conferirEstoquePorCor,
};
