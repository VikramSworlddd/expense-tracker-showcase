import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { 
  createExpenseSchema, 
  updateExpenseSchema, 
  expenseIdSchema, 
  expenseQuerySchema 
} from '../validation/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const PAGE_SIZE = 20;

// Helper to convert dollars to cents
function toCents(amount) {
  return Math.round(amount * 100);
}

// Helper to convert cents to dollars
function toDollars(cents) {
  return cents / 100;
}

// GET /api/expenses
router.get('/', (req, res) => {
  const { page, month, categoryId, q } = expenseQuerySchema.parse(req.query);

  let whereClause = '1=1';
  const params = [];

  if (month) {
    whereClause += ' AND e.date LIKE ?';
    params.push(`${month}%`);
  }

  if (categoryId) {
    whereClause += ' AND e.category_id = ?';
    params.push(categoryId);
  }

  if (q) {
    whereClause += ' AND (e.merchant LIKE ? OR e.description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  const offset = (page - 1) * PAGE_SIZE;

  const countResult = db.prepare(`
    SELECT COUNT(*) as total
    FROM expenses e
    WHERE ${whereClause}
  `).get(...params);

  const expenses = db.prepare(`
    SELECT 
      e.id,
      e.amount_cents as amountCents,
      e.date,
      e.merchant,
      e.description,
      e.payment_method as paymentMethod,
      e.category_id as categoryId,
      c.name as categoryName,
      e.created_at as createdAt,
      e.updated_at as updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE ${whereClause}
    ORDER BY e.date DESC, e.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, PAGE_SIZE, offset);

  res.json({
    expenses: expenses.map(e => ({
      ...e,
      amount: toDollars(e.amountCents)
    })),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: countResult.total,
      totalPages: Math.ceil(countResult.total / PAGE_SIZE)
    }
  });
});

// GET /api/expenses/:id
router.get('/:id', (req, res) => {
  const { id } = expenseIdSchema.parse(req.params);

  const expense = db.prepare(`
    SELECT 
      e.id,
      e.amount_cents as amountCents,
      e.date,
      e.merchant,
      e.description,
      e.payment_method as paymentMethod,
      e.category_id as categoryId,
      c.name as categoryName,
      e.created_at as createdAt,
      e.updated_at as updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);

  if (!expense) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  res.json({
    expense: {
      ...expense,
      amount: toDollars(expense.amountCents)
    }
  });
});

// POST /api/expenses
router.post('/', (req, res) => {
  const data = createExpenseSchema.parse(req.body);

  // Verify category exists
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
  if (!category) {
    throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
  }

  const id = uuidv4();
  const now = new Date().toISOString();
  const amountCents = toCents(data.amount);

  db.prepare(`
    INSERT INTO expenses (id, amount_cents, date, merchant, description, payment_method, category_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    amountCents,
    data.date,
    data.merchant || null,
    data.description || null,
    data.paymentMethod || null,
    data.categoryId,
    now,
    now
  );

  const expense = db.prepare(`
    SELECT 
      e.id,
      e.amount_cents as amountCents,
      e.date,
      e.merchant,
      e.description,
      e.payment_method as paymentMethod,
      e.category_id as categoryId,
      c.name as categoryName,
      e.created_at as createdAt,
      e.updated_at as updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);

  res.status(201).json({
    expense: {
      ...expense,
      amount: toDollars(expense.amountCents)
    }
  });
});

// PUT /api/expenses/:id
router.put('/:id', (req, res) => {
  const { id } = expenseIdSchema.parse(req.params);
  const data = updateExpenseSchema.parse(req.body);

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!existing) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  // Verify category exists
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(data.categoryId);
  if (!category) {
    throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
  }

  const now = new Date().toISOString();
  const amountCents = toCents(data.amount);

  db.prepare(`
    UPDATE expenses 
    SET amount_cents = ?, date = ?, merchant = ?, description = ?, payment_method = ?, category_id = ?, updated_at = ?
    WHERE id = ?
  `).run(
    amountCents,
    data.date,
    data.merchant || null,
    data.description || null,
    data.paymentMethod || null,
    data.categoryId,
    now,
    id
  );

  const expense = db.prepare(`
    SELECT 
      e.id,
      e.amount_cents as amountCents,
      e.date,
      e.merchant,
      e.description,
      e.payment_method as paymentMethod,
      e.category_id as categoryId,
      c.name as categoryName,
      e.created_at as createdAt,
      e.updated_at as updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);

  res.json({
    expense: {
      ...expense,
      amount: toDollars(expense.amountCents)
    }
  });
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  const { id } = expenseIdSchema.parse(req.params);

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!existing) {
    throw new AppError('Expense not found', 404, 'NOT_FOUND');
  }

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;

