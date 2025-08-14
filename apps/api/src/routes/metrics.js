import { Router } from 'express';
import db from '../db/index.js';
import { metricsQuerySchema } from '../validation/schemas.js';

const router = Router();

// Helper to convert cents to dollars
function toDollars(cents) {
  return cents / 100;
}

// GET /api/metrics/month
router.get('/month', (req, res) => {
  const { month } = metricsQuerySchema.parse(req.query);

  // Parse month to get start and end dates
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  const monthStart = `${month}-01`;
  const monthEnd = `${month}-${String(daysInMonth).padStart(2, '0')}`;

  // Total spend for the month
  const totalResult = db.prepare(`
    SELECT COALESCE(SUM(amount_cents), 0) as total
    FROM expenses
    WHERE date >= ? AND date <= ?
  `).get(monthStart, monthEnd);

  const totalSpend = totalResult.total;
  const avgPerDay = daysInMonth > 0 ? Math.round(totalSpend / daysInMonth) : 0;

  // Per category totals
  const categoryTotals = db.prepare(`
    SELECT 
      c.id,
      c.name,
      COALESCE(SUM(e.amount_cents), 0) as total
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id AND e.date >= ? AND e.date <= ?
    GROUP BY c.id, c.name
    ORDER BY total DESC
  `).all(monthStart, monthEnd);

  // Find top category
  const topCategory = categoryTotals.find(c => c.total > 0) || null;

  // Daily totals for the month
  const dailyTotals = db.prepare(`
    SELECT 
      date,
      SUM(amount_cents) as total
    FROM expenses
    WHERE date >= ? AND date <= ?
    GROUP BY date
    ORDER BY date ASC
  `).all(monthStart, monthEnd);

  // Create a complete daily array with zeros for missing days
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    const found = dailyTotals.find(d => d.date === dateStr);
    dailyData.push({
      date: dateStr,
      total: found ? found.total : 0
    });
  }

  // Recent expenses (latest 10)
  const recentExpenses = db.prepare(`
    SELECT 
      e.id,
      e.amount_cents as amountCents,
      e.date,
      e.merchant,
      e.description,
      e.payment_method as paymentMethod,
      e.category_id as categoryId,
      c.name as categoryName
    FROM expenses e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.date >= ? AND e.date <= ?
    ORDER BY e.date DESC, e.created_at DESC
    LIMIT 10
  `).all(monthStart, monthEnd);

  res.json({
    month,
    summary: {
      totalSpend: toDollars(totalSpend),
      avgPerDay: toDollars(avgPerDay),
      topCategory: topCategory ? {
        id: topCategory.id,
        name: topCategory.name,
        total: toDollars(topCategory.total)
      } : null
    },
    categoryBreakdown: categoryTotals
      .filter(c => c.total > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        total: toDollars(c.total),
        percentage: totalSpend > 0 ? Math.round((c.total / totalSpend) * 100) : 0
      })),
    dailyTotals: dailyData.map(d => ({
      date: d.date,
      total: toDollars(d.total)
    })),
    recentExpenses: recentExpenses.map(e => ({
      ...e,
      amount: toDollars(e.amountCents)
    }))
  });
});

export default router;

