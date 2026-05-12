import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

// Load .env.local before anything else
const envPath = join(__dirname, '../.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
} catch { /* .env.local is optional */ }

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL env variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const sql = readFileSync(join(__dirname, '../src/infrastructure/db/schema.sql'), 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅ Database schema applied successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
