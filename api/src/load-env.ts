/**
 * Carrega api/.env antes de qualquer módulo que use process.env (ex.: db/client).
 * Deve ser o primeiro import em index.node.ts para que DATABASE_URL esteja definido
 * quando o Pool for criado.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });
