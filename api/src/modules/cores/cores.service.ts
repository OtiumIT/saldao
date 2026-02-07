import * as repo from './cores.repository.js';

export const coresService = {
  list: repo.list,
  findById: repo.findById,
  create: repo.create,
  update: repo.update,
  remove: repo.remove,
};
