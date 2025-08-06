import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || './data/dev.db';

// Ensure data directory exists
const dataDir = path.dirname(path.resolve(__dirname, '..', '..', DB_PATH));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(__dirname, '..', '..', DB_PATH);
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db;

