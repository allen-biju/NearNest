import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const { signup, setActiveRole } = useAuth();
  const navigate = useNavigate();

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRole, setAuthRole] = useState<'buyer' | 'seller'>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Seller-specific fields
  const [sellerBusinessName, setSellerBusinessName] = useState('');
  const [sellerCategory, setSellerCategory] = useState('food');
  const [sellerAddressLine, setSellerAddressLine] = useState('');
  const [sellerCity, setSellerCity] = useState('Calicut');
  const [sellerPincode, setSellerPincode] = useState('');
  const [sellerBankAccount, setSellerBankAccount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authName || !authEmail || !authPhone || !authPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (authRole === 'seller') {
      if (!sellerBusinessName || !sellerCity || !sellerPincode) {
        setError('Please fill in business name, city, and pincode for your kitchen.');
        return;
      }
    }

    const payload: any = {
      name: authName,
      email: authEmail,
      phone: authPhone,
      password: authPassword,
    };

    if (authRole === 'seller') {
      payload.role = ['seller'];
      payload.sellerData = {
        businessName: sellerBusinessName,
        category: sellerCategory,
        address: {
          addressLine: sellerAddressLine || `${sellerBusinessName} Kitchen`,
          city: sellerCity,
          state: 'Kerala',
          pincode: sellerPincode,
        },
        location: { type: 'Point', coordinates: [75.7804, 11.2588] },
        bankDetails: {
          accountHolder: authName,
          accountNumber: sellerBankAccount || '0000000',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
        },
      };
    }

    setIsLoading(true);
    const success = await signup(payload);
    setIsLoading(false);

    if (success) {
      if (authRole === 'seller') {
        setActiveRole('seller');
        navigate('/seller-dashboard');
      } else {
        setActiveRole('buyer');
        navigate('/');
      }
    } else {
      setError('Registration failed. Email or mobile may already be registered.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl bg-white/95 border border-warmborder shadow-[0_24px_80px_rgba(26,18,8,0.12)] rounded-[32px] overflow-hidden">
        <div className="bg-primary/5 px-8 py-8">
          <div className="inline-flex items-center gap-3">
            <span className="text-3xl">🏡</span>
            <div>
              <p className="text-3xl font-serif font-black text-textPrimary">NearNest</p>
              <p className="text-sm text-textSecondary mt-1">Hyperlocal community marketplace</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="font-serif font-black text-3xl text-textPrimary">Create your account</h1>
                <p className="text-textSecondary text-sm mt-2 max-w-xl">
                  Join your neighbourhood marketplace — free, secure, and easy to use.
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-2xl bg-white border border-warmborder px-4 py-2 text-xs font-bold uppercase tracking-wider text-textSecondary shadow-sm">
                ₹50 Signup Bonus
              </span>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-textSecondary block">
                  Account type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthRole('buyer')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      authRole === 'buyer'
                        ? 'bg-primary/10 border-primary text-primary shadow-sm'
                        : 'bg-slate-50 border-warmborder text-textSecondary hover:bg-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Buyer / Diner
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthRole('seller')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      authRole === 'seller'
                        ? 'bg-secondary/10 border-secondary text-secondary shadow-sm'
                        : 'bg-slate-50 border-warmborder text-textSecondary hover:bg-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Home Cook / Seller
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Ananya Ramesh"
                    className="input-base"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Mobile Number</label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="9876543210"
                    className="input-base"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Email Address</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-base"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {authRole === 'seller' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-3xl border border-warmborder bg-slate-50/70 p-5">
                      <h3 className="font-serif font-black text-sm text-secondary mb-4">
                        🏪 Kitchen / Storefront Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Business / Kitchen Name</label>
                          <input
                            type="text"
                            value={sellerBusinessName}
                            onChange={(e) => setSellerBusinessName(e.target.value)}
                            placeholder="Ananya's Bakers & Kitchen"
                            className="input-base"
                            required={authRole === 'seller'}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Category</label>
                          <select
                            value={sellerCategory}
                            onChange={(e) => setSellerCategory(e.target.value)}
                            className="input-base cursor-pointer"
                          >
                            <option value="food">Hot Meals / Food</option>
                            <option value="bakery">Bakery & Sweets</option>
                            <option value="snacks">Snacks & Appetizers</option>
                            <option value="beverages">Fresh Beverages</option>
                            <option value="crafts">Local Crafts</option>
                            <option value="other">Other Cottage Products</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Pincode</label>
                          <input
                            type="text"
                            value={sellerPincode}
                            onChange={(e) => setSellerPincode(e.target.value)}
                            placeholder="673001"
                            className="input-base font-mono"
                            required={authRole === 'seller'}
                          />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Street Address (optional)</label>
                          <input
                            type="text"
                            value={sellerAddressLine}
                            onChange={(e) => setSellerAddressLine(e.target.value)}
                            placeholder="12/45 Kozhikode Beach Road"
                            className="input-base"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">City</label>
                          <input
                            type="text"
                            value={sellerCity}
                            onChange={(e) => setSellerCity(e.target.value)}
                            placeholder="Calicut"
                            className="input-base"
                            required={authRole === 'seller'}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-textSecondary">Bank Account Number (optional)</label>
                          <input
                            type="text"
                            value={sellerBankAccount}
                            onChange={(e) => setSellerBankAccount(e.target.value)}
                            placeholder="000012345678"
                            className="input-base font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`btn-primary w-full flex items-center justify-center gap-2 text-sm ${
                  authRole === 'seller' ? 'bg-secondary hover:bg-secondary-dark' : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating account…' : 'Create Account'}</span>
              </motion.button>
            </form>

            <div className="mt-7 pt-5 border-t border-warmborder text-center">
              <p className="text-sm text-textSecondary">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
                  Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
