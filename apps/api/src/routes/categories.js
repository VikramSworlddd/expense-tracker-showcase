import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from '../validation/schemas.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Helper to format category name
function formatName(name) {
  return name.toLowerCase().trim();
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT id, name, created_at as createdAt
    FROM categories
    ORDER BY name ASC
  `).all();

  res.json({
    categories: categories.map(c => ({
      ...c,
      displayName: toTitleCase(c.name)
    }))
  });
});

// POST /api/categories
router.post('/', (req, res) => {
  const { name } = createCategorySchema.parse(req.body);
  const normalizedName = formatName(name);

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(normalizedName);
  if (existing) {
    throw new AppError('Category already exists', 400, 'DUPLICATE');
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO categories (id, name, created_at)
    VALUES (?, ?, ?)
  `).run(id, normalizedName, now);

  res.status(201).json({
    category: {
      id,
      name: normalizedName,
      displayName: toTitleCase(normalizedName),
      createdAt: now
    }
  });
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const { id } = categoryIdSchema.parse(req.params);
  const { name } = updateCategorySchema.parse(req.body);
  const normalizedName = formatName(name);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  // Prevent renaming uncategorized
  if (category.name === 'uncategorized') {
    throw new AppError('Cannot rename the uncategorized category', 400, 'FORBIDDEN');
  }

  // Check for duplicate name
  const duplicate = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(normalizedName, id);
  if (duplicate) {
    throw new AppError('Category name already exists', 400, 'DUPLICATE');
  }

  db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(normalizedName, id);

  res.json({
    category: {
      id,
      name: normalizedName,
      displayName: toTitleCase(normalizedName),
      createdAt: category.created_at
    }
  });
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  const { id } = categoryIdSchema.parse(req.params);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  // Prevent deleting uncategorized
  if (category.name === 'uncategorized') {
    throw new AppError('Cannot delete the uncategorized category', 400, 'FORBIDDEN');
  }

  // Get uncategorized category ID
  const uncategorized = db.prepare("SELECT id FROM categories WHERE name = 'uncategorized'").get();
  if (!uncategorized) {
    throw new AppError('Uncategorized category not found', 500, 'SERVER_ERROR');
  }

  // Reassign expenses to uncategorized
  db.prepare('UPDATE expenses SET category_id = ? WHERE category_id = ?').run(uncategorized.id, id);

  // Delete the category
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;

