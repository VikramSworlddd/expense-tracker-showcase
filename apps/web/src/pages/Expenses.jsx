import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import MonthSelector from '../components/MonthSelector';
import { formatCurrency, toTitleCase, getCurrentMonth, formatDate } from '../lib/utils';

export default function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [month, setMonth] = useState(searchParams.get('month') || getCurrentMonth());
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
    updateSearchParams();
  }, [month, categoryId, search, page]);

  function updateSearchParams() {
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (categoryId) params.set('categoryId', categoryId);
    if (search) params.set('q', search);
    if (page > 1) params.set('page', page);
    setSearchParams(params, { replace: true });
  }

  async function fetchCategories() {
    try {
      const data = await api.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }

  async function fetchExpenses() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      if (month) params.set('month', month);
      if (categoryId) params.set('categoryId', categoryId);
      if (search) params.set('q', search);
      
      const data = await api.get(`/expenses?${params}`);
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMonthChange(newMonth) {
    setMonth(newMonth);
    setPage(1);
  }

  function handleCategoryChange(e) {
    setCategoryId(e.target.value);
    setPage(1);
  }

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Expenses</h1>
        <Link to="/expenses/new" className="btn btn-primary">
          + Add Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthSelector value={month} onChange={handleMonthChange} />
          
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            className="input sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.displayName}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search merchant or description..."
            value={search}
            onChange={handleSearchChange}
            className="input flex-1"
          />
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : expenses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Merchant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Category</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400 hidden md:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/expenses/${expense.id}/edit`}
                    >
                      <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-100">
                        {expense.merchant || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-slate-700/50 rounded-md text-slate-300">
                          {toTitleCase(expense.categoryName || 'uncategorized')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono text-slate-100">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell truncate max-w-[200px]">
                        {expense.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-secondary"
      >
        Previous
      </button>
      <span className="text-sm text-slate-400">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-secondary"
      >
        Next
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="text-center py-20">
      <p className="text-red-400">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <p className="text-slate-400 mb-4">No expenses found</p>
      <Link to="/expenses/new" className="btn btn-primary">
        Add your first expense
      </Link>
    </div>
  );
}

