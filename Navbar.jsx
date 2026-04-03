import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-blue-600 font-bold text-xl tracking-tight">
        Vaxi<span className="text-emerald-500">Core</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-slate-500 hidden sm:block">
              Hi, <span className="font-medium text-slate-700">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"  className="text-sm text-slate-600 hover:text-blue-600 transition">Login</Link>
            <Link to="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
