/**
 * Testa em produção se projetos retornam partnership_companies e entity_type.
 * Escreve evidência em .cursor/debug.log (NDJSON).
 *
 * Uso:
 *   TOKEN="Bearer eyJ..." npx tsx scripts/test-prod-project.ts
 *   API_URL=https://api.partnerfinancecontrol.com TOKEN="Bearer eyJ..." npx tsx scripts/test-prod-project.ts
 */

import fs from 'node:fs';
import path from 'node:path';

const API_URL = process.env.API_URL || 'https://api.partnerfinancecontrol.com';
const TOKEN = process.env.TOKEN?.trim();
const LOG_PATH = '.cursor/debug.log';

function writeLog(payload: Record<string, unknown>): void {
  const line = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
    sessionId: 'prod-test',
  }) + '\n';
  const fullPath = path.resolve(process.cwd(), LOG_PATH);
  fs.appendFileSync(fullPath, line);
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error('Defina TOKEN no ambiente. Ex: TOKEN="Bearer eyJ..." npx tsx scripts/test-prod-project.ts');
    process.exit(1);
  }

  writeLog({
    location: 'test-prod-project.ts:main',
    message: 'test started',
    data: { API_URL, hasToken: !!TOKEN },
    hypothesisId: 'H0',
  });

  try {
    const listRes = await fetch(`${API_URL}/api/projects`, {
      headers: { Authorization: TOKEN },
    });
    const listRaw = (await listRes.json()) as unknown;
    const list = Array.isArray(listRaw) ? listRaw : [];

    writeLog({
      location: 'test-prod-project.ts:list',
      message: 'GET /api/projects response',
      data: {
        status: listRes.status,
        count: list.length,
        projects: list.slice(0, 5).map((p: Record<string, unknown>) => ({
          id: p.id,
          name: p.name,
          entity_type: p.entity_type,
          partnership_id: p.partnership_id ?? null,
          partnership_companies_len: Array.isArray(p.partnership_companies) ? p.partnership_companies.length : 'not-array',
        })),
      },
      hypothesisId: 'H1',
    });

    const listWithPartnership = list.find((p: Record<string, unknown>) => p.partnership_id || p.entity_type === 'partnership');
    const firstProject = listWithPartnership ?? list[0];
    const firstId = firstProject && typeof (firstProject as Record<string, unknown>).id === 'string'
      ? (firstProject as Record<string, unknown>).id as string
      : null;

    if (!firstId) {
      writeLog({
        location: 'test-prod-project.ts:single',
        message: 'no project id to fetch',
        data: {},
        hypothesisId: 'H2',
      });
      console.log('Nenhum projeto na lista.');
      return;
    }

    const singleRes = await fetch(`${API_URL}/api/projects/${firstId}`, {
      headers: { Authorization: TOKEN },
    });
    const singleData = (await singleRes.json()) as Record<string, unknown>;

    const pc = singleData.partnership_companies;
    const isPartnershipTwo =
      (singleData.entity_type === 'partnership' || !!singleData.partnership_id) &&
      Array.isArray(pc) &&
      pc.length >= 2;

    writeLog({
      location: 'test-prod-project.ts:single',
      message: 'GET /api/projects/:id response',
      data: {
        status: singleRes.status,
        projectId: firstId,
        entity_type: singleData.entity_type,
        partnership_id: singleData.partnership_id ?? null,
        partnership_companies_len: Array.isArray(pc) ? pc.length : 'not-array',
        isPartnershipWithTwoCompanies: isPartnershipTwo,
      },
      hypothesisId: 'H2',
    });

    console.log('Resultado escrito em', LOG_PATH);
    console.log('Projeto', firstId, '-> entity_type:', singleData.entity_type, '| partnership_companies:', Array.isArray(pc) ? pc.length : pc, '| isPartnershipWithTwoCompanies:', isPartnershipTwo);
  } catch (err) {
    writeLog({
      location: 'test-prod-project.ts:error',
      message: 'request failed',
      data: { error: err instanceof Error ? err.message : String(err) },
      hypothesisId: 'H3',
    });
    console.error(err);
    process.exit(1);
  }
}

main();
