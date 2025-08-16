import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="font-bold text-lg text-slate-100">ExpenseTracker</span>
              </NavLink>
              
              <div className="hidden sm:flex items-center gap-1">
                <NavItem to="/" end>Dashboard</NavItem>
                <NavItem to="/expenses">Expenses</NavItem>
                <NavItem to="/categories">Categories</NavItem>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex justify-center gap-1 pb-3 px-4">
          <NavItem to="/" end>Dashboard</NavItem>
          <NavItem to="/expenses">Expenses</NavItem>
          <NavItem to="/categories">Categories</NavItem>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

