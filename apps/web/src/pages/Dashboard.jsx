import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MonthSelector from '../components/MonthSelector';
import { formatCurrency, toTitleCase } from '../lib/utils';

export default function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, [month]);

  async function fetchMetrics() {
    setLoading(true);
    setError('');
    try {
      const result = await api.get(`/metrics/month?month=${month}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Spend"
          value={formatCurrency(data.summary.totalSpend)}
          icon="💸"
        />
        <SummaryCard
          title="Avg / Day"
          value={formatCurrency(data.summary.avgPerDay)}
          icon="📅"
        />
        <SummaryCard
          title="Top Category"
          value={data.summary.topCategory ? toTitleCase(data.summary.topCategory.name) : 'N/A'}
          subtitle={data.summary.topCategory ? formatCurrency(data.summary.topCategory.total) : null}
          icon="🏆"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Category Breakdown</h2>
          {data.categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {data.categoryBreakdown.map((cat) => (
                <CategoryBar key={cat.id} category={cat} />
              ))}
            </div>
          ) : (
            <EmptyState message="No expenses this month" />
          )}
        </div>

        {/* Daily Spending Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Daily Spending</h2>
          {data.dailyTotals.some(d => d.total > 0) ? (
            <SparklineChart data={data.dailyTotals} />
          ) : (
            <EmptyState message="No spending data" />
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100">Recent Expenses</h2>
          <Link to="/expenses" className="text-sm link">View all →</Link>
        </div>
        {data.recentExpenses.length > 0 ? (
          <div className="space-y-2">
            {data.recentExpenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </div>
        ) : (
          <EmptyState message="No expenses this month" />
        )}
      </div>
    </div>
  );
}

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function SummaryCard({ title, value, subtitle, icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function CategoryBar({ category }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{toTitleCase(category.name)}</span>
        <span className="text-slate-400">{formatCurrency(category.total)} ({category.percentage}%)</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${category.percentage}%` }}
        />
      </div>
    </div>
  );
}

function SparklineChart({ data }) {
  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const height = 120;
  const width = 100;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.total / maxTotal) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#sparkGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>1</span>
        <span>{data.length}</span>
      </div>
    </div>
  );
}

function ExpenseRow({ expense }) {
  return (
    <Link
      to={`/expenses/${expense.id}/edit`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-slate-100 truncate">
          {expense.merchant || expense.description || 'Expense'}
        </p>
        <p className="text-sm text-slate-500">
          {expense.date} • {toTitleCase(expense.categoryName || 'uncategorized')}
        </p>
      </div>
      <span className="font-mono font-medium text-slate-100 ml-4">
        {formatCurrency(expense.amount)}
      </span>
    </Link>
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

function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-slate-500">
      {message}
    </div>
  );
}

