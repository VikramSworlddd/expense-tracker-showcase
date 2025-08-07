import 'dotenv/config';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from './index.js';

console.log('Seeding database...');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

// Seed admin user
const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);

if (!existingUser) {
  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  const userId = uuidv4();
  
  db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `).run(userId, ADMIN_EMAIL, passwordHash, new Date().toISOString());
  
  console.log(`Created admin user: ${ADMIN_EMAIL}`);
} else {
  console.log('Admin user already exists');
}

// Seed categories
const categoryNames = [
  'uncategorized',
  'groceries',
  'dining',
  'transportation',
  'utilities',
  'entertainment',
  'shopping',
  'healthcare',
  'travel'
];

const categoryIds = {};

for (const name of categoryNames) {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  
  if (!existing) {
    const id = uuidv4();
    db.prepare(`
      INSERT INTO categories (id, name, created_at)
      VALUES (?, ?, ?)
    `).run(id, name, new Date().toISOString());
    categoryIds[name] = id;
    console.log(`Created category: ${name}`);
  } else {
    categoryIds[name] = existing.id;
  }
}

// Seed sample expenses
const existingExpenses = db.prepare('SELECT COUNT(*) as count FROM expenses').get();

if (existingExpenses.count === 0) {
  const merchants = {
    groceries: ['Whole Foods', 'Trader Joes', 'Safeway', 'Costco', 'Target'],
    dining: ['Chipotle', 'Starbucks', 'Local Cafe', 'Pizza Hut', 'Thai Kitchen'],
    transportation: ['Shell Gas', 'Uber', 'Lyft', 'Public Transit', 'Parking Garage'],
    utilities: ['Electric Company', 'Water Utility', 'Internet Provider', 'Gas Company'],
    entertainment: ['Netflix', 'Spotify', 'Movie Theater', 'Concert Venue', 'Bowling Alley'],
    shopping: ['Amazon', 'Best Buy', 'Nike Store', 'IKEA', 'Home Depot'],
    healthcare: ['CVS Pharmacy', 'Doctor Visit', 'Dentist', 'Eye Care', 'Gym'],
    travel: ['Hotel Stay', 'Airbnb', 'Flight', 'Car Rental', 'Travel Insurance']
  };

  const descriptions = {
    groceries: ['Weekly groceries', 'Snacks', 'Produce', 'Pantry items', ''],
    dining: ['Lunch', 'Dinner', 'Coffee', 'Takeout', ''],
    transportation: ['Fuel', 'Ride to airport', 'Monthly pass', 'Parking', ''],
    utilities: ['Monthly bill', 'Quarterly payment', '', '', ''],
    entertainment: ['Subscription', 'Movie night', 'Weekend fun', '', ''],
    shopping: ['Online order', 'Home supplies', 'Clothes', 'Electronics', ''],
    healthcare: ['Prescription', 'Checkup', 'Vitamins', '', ''],
    travel: ['Business trip', 'Vacation', 'Weekend getaway', '', '']
  };

  const paymentMethods = ['CARD', 'CASH', 'OTHER', null];
  
  // Generate expenses for last 3 months
  const now = new Date();
  const expenses = [];

  for (let i = 0; i < 80; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    // Pick random category (exclude uncategorized for seeds)
    const categoryName = categoryNames[1 + Math.floor(Math.random() * (categoryNames.length - 1))];
    const categoryId = categoryIds[categoryName];

    const merchantList = merchants[categoryName] || ['Unknown'];
    const descList = descriptions[categoryName] || [''];

    const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
    const description = descList[Math.floor(Math.random() * descList.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    // Random amount between $5 and $200
    const amountCents = Math.floor(Math.random() * 19500) + 500;

    expenses.push({
      id: uuidv4(),
      amount_cents: amountCents,
      date: dateStr,
      merchant,
      description,
      payment_method: paymentMethod,
      category_id: categoryId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, amount_cents, date, merchant, description, payment_method, category_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exp of expenses) {
    insertExpense.run(
      exp.id,
      exp.amount_cents,
      exp.date,
      exp.merchant,
      exp.description,
      exp.payment_method,
      exp.category_id,
      exp.created_at,
      exp.updated_at
    );
  }

  console.log(`Created ${expenses.length} sample expenses`);
} else {
  console.log('Expenses already exist, skipping seed');
}

console.log('Seeding complete!');
process.exit(0);

