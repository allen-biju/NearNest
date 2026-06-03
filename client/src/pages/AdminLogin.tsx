import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeftRight } from 'lucide-react';

export default function AdminLogin() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && (user.role.includes('admin') || user.role.includes('superadmin'))) {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginId || !password) {
      setError('Please enter your admin email/phone and password.');
      return;
    }

    const result = await login(loginId, password);
    if (result.success && result.user) {
      const isAdmin = result.user.role.includes('admin') || result.user.role.includes('superadmin');
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else {
        logout();
        setError('This login panel is only for admin users.');
      }
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-sm text-slate-500">Secure access for platform administrators only.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Admin Email or Phone
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="admin@nearnest.in"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark"
          >
            Login as Admin
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Not an admin?</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline mt-2">
            <ArrowLeftRight className="w-4 h-4" />
            Return to user login
          </Link>
        </div>
      </div>
    </div>
  );
}
