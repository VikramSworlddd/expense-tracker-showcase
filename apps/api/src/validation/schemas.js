import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Category name is required')
    .max(50, 'Category name too long')
});

export const updateCategorySchema = createCategorySchema;

export const categoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID')
});

// Expense schemas
export const createExpenseSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than 0'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  categoryId: z.string().uuid('Invalid category ID'),
  merchant: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  paymentMethod: z.enum(['CARD', 'CASH', 'OTHER']).optional().nullable()
});

export const updateExpenseSchema = createExpenseSchema;

export const expenseIdSchema = z.object({
  id: z.string().uuid('Invalid expense ID')
});

export const expenseQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format').optional(),
  categoryId: z.string().uuid().optional(),
  q: z.string().trim().max(100).optional()
});

// Metrics schema
export const metricsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM format')
});

