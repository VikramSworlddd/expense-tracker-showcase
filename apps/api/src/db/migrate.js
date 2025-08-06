import 'dotenv/config';
import db from './index.js';

console.log('Running database migrations...');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

// Create categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL
  )
`);

// Create expenses table
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount_cents INTEGER NOT NULL,
    date TEXT NOT NULL,
    merchant TEXT,
    description TEXT,
    payment_method TEXT CHECK (payment_method IN ('CARD', 'CASH', 'OTHER')),
    category_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id)
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_expenses_updated_at ON expenses(updated_at)
`);

console.log('Migrations complete!');
process.exit(0);

