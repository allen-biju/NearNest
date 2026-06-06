import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft, ShieldCheck, Eye, EyeOff, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const [loginId, setLoginId] = useState('admin@nearnest.in');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role.includes('admin') || user.role.includes('superadmin'))) {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateAdminEmail = (value: string) => {
    return /\S+@\S+\.\S+/.test(value.trim());
  };

  const handleCopyCredentials = async () => {
    try {
      await navigator.clipboard.writeText('admin@nearnest.in\nadmin123');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setError('Could not copy credentials automatically. Please copy them manually.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginId || !password) {
      setError('Please enter your admin email and password.');
      return;
    }

    if (!validateAdminEmail(loginId)) {
      setError('Please enter a valid admin email address.');
      return;
    }

    setIsLoading(true);
    const result = await login(loginId, password);
    setIsLoading(false);

    if (result.success && result.user) {
      const isAdmin = result.user.role.includes('admin') || result.user.role.includes('superadmin');
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else {
        logout();
        setError('Access denied. This login panel is only for admin users.');
      }
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1208] via-[#2d1f0e] to-[#1A1208] flex items-center justify-center p-4">
      {/* Back link */}
      <Link
        to="/"
        className="fixed top-5 left-5 flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-bold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Marketplace
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Header badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/20 border border-primary/30 mb-4 mx-auto shadow-[0_0_30px_rgba(232,93,38,0.25)]">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif font-black text-2xl text-white">Admin Portal</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium uppercase tracking-widest">NearNest Secure Access</p>
        </div>

        {/* Login card */}
        <div className="glassmorphism-dark rounded-[28px] p-6 space-y-5 border border-white/10">

          {/* Sandbox hint */}
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Sandbox Credentials</p>
                <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono text-white/70">
                  <span>admin@nearnest.in</span>
                  <span className="text-primary/90">admin123</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[9px] text-white/40 font-medium">Use these credentials to explore admin panels in the sandbox build.</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium leading-relaxed"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Admin Email</label>
              <input
                type="email"
                value={loginId}
                ref={emailInputRef}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="admin@nearnest.in"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-[10px] text-white/60">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-primary h-4 w-4 rounded border-white/20 bg-white/5"
                />
                Remember this device
              </label>
              <span className="text-[9px] uppercase tracking-widest">Secure access</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              <Lock className="w-3.5 h-3.5" />
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </motion.button>
          </form>

          <div className="text-center pt-2 border-t border-white/10">
            <Link
              to="/"
              className="text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors"
            >
              Not an admin? Return to marketplace →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
