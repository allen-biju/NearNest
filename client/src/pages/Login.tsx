import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, User, ShoppingBag, ShieldCheck, MapPin, Star, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, login, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loginAsRole, setLoginAsRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (activeRole === 'seller' && user.role.includes('seller')) {
        navigate('/seller-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, activeRole, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authIdentifier || !authPassword) {
      setError('Please fill in your email or mobile number, and password.');
      return;
    }

    setIsLoading(true);
    const loginResult = await login(authIdentifier, authPassword);
    setIsLoading(false);

    if (loginResult.success && loginResult.user) {
      const isAdmin = loginResult.user.role.includes('admin') || loginResult.user.role.includes('superadmin');
      const isSeller = loginResult.user.role.includes('seller');

      if (isAdmin) {
        setError('Admin users must use the separate admin login page.');
        return;
      }

      if (loginAsRole === 'seller') {
        if (isSeller) {
          setActiveRole('seller');
          navigate('/seller-dashboard');
        } else {
          setError('This account is not registered as a seller.');
          setActiveRole('buyer');
        }
      } else {
        setActiveRole('buyer');
        navigate('/');
      }
    } else {
      setError('Invalid email/mobile or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl bg-white/95 border border-warmborder shadow-[0_24px_80px_rgba(26,18,8,0.12)] rounded-[32px] p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3">
            <span className="text-3xl">🏡</span>
            <div className="text-left">
              <p className="text-3xl font-serif font-black text-textPrimary">NearNest</p>
              <p className="text-sm text-textSecondary mt-1">Hyperlocal community marketplace</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-8"
        >
          <div>
            <h1 className="font-serif font-black text-3xl text-textPrimary">Welcome back!</h1>
            <p className="text-textSecondary text-sm mt-2 max-w-xl">
              Sign in to discover food and goods from your neighbourhood.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-semibold flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-textSecondary block">
                Email or Mobile Number
              </label>
              <input
                type="text"
                value={authIdentifier}
                ref={inputRef}
                onChange={(e) => setAuthIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                className="input-base"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-textSecondary block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-base pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary/50 hover:text-textSecondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-textSecondary block">
                Sign in as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLoginAsRole('buyer')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${
                    loginAsRole === 'buyer'
                      ? 'bg-primary/10 border-primary text-primary shadow-sm'
                      : 'bg-slate-50 border-warmborder text-textSecondary hover:bg-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginAsRole('seller')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${
                    loginAsRole === 'seller'
                      ? 'bg-secondary/10 border-secondary text-secondary shadow-sm'
                      : 'bg-slate-50 border-warmborder text-textSecondary hover:bg-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Seller</span>
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`btn-primary mt-1 flex items-center justify-center gap-2 text-sm ${
                loginAsRole === 'seller' ? 'bg-secondary hover:bg-secondary-dark' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-warmborder flex flex-col items-center gap-4">
            <p className="text-sm text-textSecondary">
              New to NearNest?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create a free account
              </Link>
            </p>
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-1.5 text-xs text-textSecondary/60 hover:text-primary transition-colors font-semibold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Access
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
