import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function ExpenseNew() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    merchant: '',
    description: '',
    paymentMethod: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const data = await api.get('/categories');
      setCategories(data.categories);
      if (data.categories.length > 0) {
        // Default to first non-uncategorized category
        const defaultCat = data.categories.find(c => c.name !== 'uncategorized') || data.categories[0];
        setForm(f => ({ ...f, categoryId: defaultCat.id }));
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      await api.post('/expenses', {
        amount,
        date: form.date,
        categoryId: form.categoryId,
        merchant: form.merchant || null,
        description: form.description || null,
        paymentMethod: form.paymentMethod || null
      });

      navigate('/expenses');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/expenses" className="text-sm link">← Back to Expenses</Link>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-100 mb-6">Add Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="label">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  className="input pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="label">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="categoryId" className="label">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="merchant" className="label">Merchant</label>
            <input
              id="merchant"
              name="merchant"
              type="text"
              value={form.merchant}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Starbucks"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input resize-none"
              rows={3}
              placeholder="Optional notes..."
              maxLength={500}
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="label">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select (optional)</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
            <Link to="/expenses" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

