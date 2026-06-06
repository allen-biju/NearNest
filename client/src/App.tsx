import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';

// Import pages
import Home from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { SellerSettings } from './pages/SellerSettings';
import { AdminDashboard } from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Register from './pages/Register';

// Icons
import { 
  Compass, 
  ShoppingBag, 
  Truck, 
  User,
  Heart,
  Loader
} from 'lucide-react';
import { useWishlist } from './context/WishlistContext';
import { motion } from 'framer-motion';

// Smart Dashboard Router - routes based on active role
// Smart Dashboard Router - routes based on active role
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-textSecondary font-medium">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const GuestRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, activeRole } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-textSecondary font-medium">Loading session...</p>
      </div>
    );
  }

  if (user) {
    if (activeRole === 'seller' && user.role.includes('seller')) {
      return <Navigate to="/seller-dashboard" replace />;
    }
    if ((activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'))) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardRouter: React.FC = () => {
  const { user, activeRole } = useAuth();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on activeRole
  if (activeRole === 'seller' && user.role.includes('seller')) {
    return <SellerDashboard />;
  }
  
  if ((activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'))) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Default to buyer dashboard
  return <BuyerDashboard />;
};

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { user, activeRole, setActiveRole } = useAuth();
  const { items: wishlistItems } = useWishlist();

  // Hide mobile nav on pages that render their own fixed bottom bars or when not logged in
  const path = location.pathname || '';
  if (!user || path.startsWith('/cart') || path.startsWith('/product/') || path.startsWith('/checkout') || path === '/admin-login' || path === '/login' || path === '/register') {
    return null;
  }

  const isTabActive = (tabPath: string) => location.pathname === tabPath;

  const getActiveTabClass = (tabPath: string) => {
    const isActive = isTabActive(tabPath);
    return isActive 
      ? 'text-primary scale-105 font-extrabold' 
      : 'text-textSecondary/70 hover:text-textPrimary';
  };

  const isBuyerMode = !user || activeRole === 'buyer' || (!user?.role?.includes('seller') && !user?.role?.includes('admin'));
  const isSellerMode = user && activeRole === 'seller' && user.role.includes('seller');
  const isAdminMode = user && (activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-lg border-t border-warmborder/80 py-2.5 px-4 shadow-[0_-8px_30px_rgba(26,18,8,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-1">
        
        {/* BUYER MODE NAVIGATION */}
        {isBuyerMode && (
          <>
            <Link to="/" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/')}`}>
              <Compass className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Discover</span>
              {isTabActive('/') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>

            <Link to="/wishlist" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/wishlist')}`}>
              <Heart className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Saved</span>
              {wishlistItems.length > 0 && (
                <span className="absolute top-0.5 right-[14px] bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white z-20">
                  {wishlistItems.length}
                </span>
              )}
              {isTabActive('/wishlist') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>

            <Link to="/cart" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/cart')}`}>
              <ShoppingBag className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Cart</span>
              {cart.length > 0 && (
                <motion.span 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-0.5 right-[10px] bg-primary text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white z-20"
                >
                  {cart.length}
                </motion.span>
              )}
              {isTabActive('/cart') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>

            <Link to="/orders" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/orders')}`}>
              <Truck className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Orders</span>
              {isTabActive('/orders') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          </>
        )}

        {/* SELLER MODE NAVIGATION */}
        {isSellerMode && (
          <>
            <Link to="/seller-dashboard" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/seller-dashboard')}`}>
              <ShoppingBag className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Products</span>
              {isTabActive('/seller-dashboard') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>

            <Link to="/orders" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/orders')}`}>
              <Truck className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Orders</span>
              {isTabActive('/orders') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          </>
        )}

        {/* ADMIN MODE NAVIGATION */}
        {isAdminMode && (
          <>
            <Link to="/admin-dashboard" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/admin-dashboard')}`}>
              <User className="w-5 h-5 z-10" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Admin</span>
              {isTabActive('/admin-dashboard') && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-primary/5 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          </>
        )}

        {/* PROFILE CONTROL - Always visible */}
        <Link to="/dashboard" className={`relative flex flex-col items-center gap-0.5 flex-1 py-1 rounded-xl transition-all duration-300 ${getActiveTabClass('/dashboard')}`}>
          <User className="w-5 h-5 z-10" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold z-10">Profile</span>
          {isTabActive('/dashboard') && (
            <motion.div
              layoutId="activeNavBackground"
              className="absolute inset-0 bg-primary/5 rounded-xl"
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            />
          )}
        </Link>

        {/* ROLE/MODE SWITCHER - Always visible */}
        <div className="flex flex-col items-center justify-center flex-1 shrink-0 border-l border-warmborder/80 pl-2">
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value);
            }}
            className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl py-1 px-1.5 text-[9px] font-black outline-none cursor-pointer shadow-sm transition-colors"
            title="Switch between Buyer and Seller mode"
          >
            <option value="buyer">👤 Buy</option>
            {user && user.role.includes('seller') && <option value="seller">🏪 Sell</option>}
            {user && (user.role.includes('admin') || user.role.includes('superadmin')) && (
              <option value="admin">🛡️ Admin</option>
            )}
          </select>
          <span className="text-[7px] font-black text-textSecondary uppercase tracking-wider mt-0.5 text-center leading-tight">Mode</span>
        </div>

      </div>
    </div>
  );
};

const DesktopNavigation: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { user, activeRole, setActiveRole } = useAuth();
  const { items: wishlistItems } = useWishlist();

  const path = location.pathname || '';
  if (!user || path.startsWith('/cart') || path.startsWith('/product/') || path.startsWith('/checkout') || path === '/admin-login' || path === '/login' || path === '/register') {
    return null;
  }

  const isTabActive = (tabPath: string) => location.pathname === tabPath;
  const getTabClass = (tabPath: string) =>
    `px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition ${
      isTabActive(tabPath)
        ? 'bg-primary text-white shadow-sm'
        : 'text-textSecondary hover:text-textPrimary hover:bg-surface'
    }`;

  const isBuyerMode = !user || activeRole === 'buyer' || (!user?.role?.includes('seller') && !user?.role?.includes('admin'));
  const isSellerMode = user && activeRole === 'seller' && user.role.includes('seller');
  const isAdminMode = user && (activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'));

  return (
    <div className="hidden lg:flex items-center justify-between gap-4 border-b border-warmborder/70 bg-white/95 px-6 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {isBuyerMode && (
          <>
            <Link to="/" className={getTabClass('/')}>Discover</Link>
            <Link to="/wishlist" className={getTabClass('/wishlist')}>Saved{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ''}</Link>
            <Link to="/cart" className={getTabClass('/cart')}>Cart{cart.length > 0 ? ` (${cart.length})` : ''}</Link>
            <Link to="/orders" className={getTabClass('/orders')}>Orders</Link>
          </>
        )}
        {isSellerMode && (
          <>
            <Link to="/seller-dashboard" className={getTabClass('/seller-dashboard')}>Products</Link>
            <Link to="/orders" className={getTabClass('/orders')}>Orders</Link>
          </>
        )}
        {isAdminMode && (
          <Link to="/admin-dashboard" className={getTabClass('/admin-dashboard')}>Admin</Link>
        )}

        <Link to="/dashboard" className={getTabClass('/dashboard')}>Profile</Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden xl:flex flex-col text-right text-[9px] text-textSecondary uppercase tracking-wider">
          <span>Current Mode</span>
          <span className="font-black text-textPrimary">{activeRole}</span>
        </div>
        <select
          value={activeRole}
          onChange={(e) => setActiveRole(e.target.value)}
          className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-xl py-2 px-3 text-[10px] font-black outline-none cursor-pointer shadow-sm transition-colors"
          title="Switch between Buyer and Seller mode"
        >
          <option value="buyer">👤 Buy</option>
          {user && user.role.includes('seller') && <option value="seller">🏪 Sell</option>}
          {user && (user.role.includes('admin') || user.role.includes('superadmin')) && (
            <option value="admin">🛡️ Admin</option>
          )}
        </select>
      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const location = useLocation();
  const isBypassMockup = 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/seller-dashboard') ||
    location.pathname.startsWith('/seller-settings');

  if (isBypassMockup) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] text-textPrimary antialiased selection:bg-primary/10 selection:text-primary">
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller-settings" element={<ProtectedRoute><SellerSettings /></ProtectedRoute>} />
          {/* Fallback - redirect any other /admin path to /admin-login */}
          <Route path="*" element={<Navigate to="/admin-login" replace />} />
        </Routes>
      </div>
    );
  }

  const authRoutes = location.pathname === '/login' || location.pathname === '/register';
  if (authRoutes) {
    return (
      <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-[32px] border border-warmborder shadow-[0_24px_80px_rgba(26,18,8,0.14)] overflow-hidden">
          <div className="relative flex-1 overflow-y-auto no-scrollbar bg-background text-textPrimary antialiased selection:bg-primary/10 selection:text-primary min-h-[80vh]">
            <Routes>
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF7] lg:bg-slate-100 flex justify-center items-center py-0 lg:py-6 px-0 lg:px-4">
      {/* Outer mock layout grid for desktop viewports */}
      <div className="w-full min-h-screen lg:min-h-0 lg:h-[90vh] lg:max-w-6xl lg:grid lg:grid-cols-12 lg:gap-8 lg:bg-white lg:rounded-[36px] lg:shadow-[0_24px_80px_rgba(26,18,8,0.14)] lg:border lg:border-warmborder lg:overflow-hidden lg:p-5">
        
        <div className="col-span-12 h-full relative lg:rounded-[24px] lg:overflow-hidden lg:border lg:border-warmborder lg:bg-background lg:shadow-[0_4px_30px_rgba(26,18,8,0.03)] flex flex-col">
          <DesktopNavigation />
          <div className="relative flex-1 overflow-y-auto no-scrollbar bg-background text-textPrimary antialiased selection:bg-primary/10 selection:text-primary max-w-lg mx-auto w-full pb-10 lg:max-w-none lg:px-4 xl:px-6">
            <Routes>
              {/* Guest/Auth routes */}
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Protected standard user routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
              <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
              <Route path="/seller-dashboard" element={<ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller-settings" element={<ProtectedRoute><SellerSettings /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Persistent Bottom Mobile Nav bar */}
            <MobileNavigation />
          </div>
        </div>

      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <TranslationProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </TranslationProvider>
    </Router>
  );
}

export default App;
