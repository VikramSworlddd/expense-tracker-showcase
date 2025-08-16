import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import ConfirmModal from '../components/ConfirmModal';

export default function ExpenseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    amount: '',
    date: '',
    categoryId: '',
    merchant: '',
    description: '',
    paymentMethod: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [expenseData, categoriesData] = await Promise.all([
        api.get(`/expenses/${id}`),
        api.get('/categories')
      ]);
      
      setCategories(categoriesData.categories);
      setForm({
        amount: expenseData.expense.amount.toString(),
        date: expenseData.expense.date,
        categoryId: expenseData.expense.categoryId,
        merchant: expenseData.expense.merchant || '',
        description: expenseData.expense.description || '',
        paymentMethod: expenseData.expense.paymentMethod || ''
      });
    } catch (err) {
      setError('Failed to load expense');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      await api.put(`/expenses/${id}`, {
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
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/expenses/${id}`);
      navigate('/expenses');
    } catch (err) {
      setError(err.message);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/expenses" className="text-sm link">← Back to Expenses</Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-100">Edit Expense</h1>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger text-sm"
          >
            Delete
          </button>
        </div>

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
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Update Expense'}
            </button>
            <Link to="/expenses" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        isLoading={deleting}
      />
    </div>
  );
}

