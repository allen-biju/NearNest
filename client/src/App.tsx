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
import { AdminDashboard } from './pages/AdminDashboard';

// Icons
import { 
  Compass, 
  ShoppingBag, 
  Truck, 
  User,
  Heart
} from 'lucide-react';
import { useWishlist } from './context/WishlistContext';

// Smart Dashboard Router - routes based on active role
const DashboardRouter: React.FC = () => {
  const { user, activeRole } = useAuth();

  // If not logged in, redirect to checkout
  if (!user) {
    return <Navigate to="/checkout" replace />;
  }

  // Route based on activeRole
  if (activeRole === 'seller' && user.role.includes('seller')) {
    return <SellerDashboard />;
  }
  
  if ((activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'))) {
    return <AdminDashboard />;
  }

  // Default to buyer dashboard
  return <BuyerDashboard />;
};

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { user, activeRole, setActiveRole } = useAuth();
  const { items: wishlistItems } = useWishlist();

  // Hide mobile nav on pages that render their own fixed bottom bars
  const path = location.pathname || '';
  if (path.startsWith('/cart') || path.startsWith('/product/') || path.startsWith('/checkout')) {
    return null;
  }

  const getActiveTabClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? 'text-primary scale-110 font-bold transition-all duration-200' 
      : 'text-textSecondary/60 hover:text-textPrimary transition-all duration-200';
  };

  const isBuyerMode = !user || activeRole === 'buyer' || (!user?.role?.includes('seller') && !user?.role?.includes('admin'));
  const isSellerMode = user && activeRole === 'seller' && user.role.includes('seller');
  const isAdminMode = user && (activeRole === 'admin' || activeRole === 'superadmin') && (user.role.includes('admin') || user.role.includes('superadmin'));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warmborder py-2 px-3 shadow-lifted">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-1">
        
        {/* BUYER MODE NAVIGATION */}
        {isBuyerMode && (
          <>
            <Link to="/" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/')}`}>
              <Compass className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Discover</span>
            </Link>

            <Link to="/wishlist" className={`flex flex-col items-center gap-0.5 relative flex-1 ${getActiveTabClass('/wishlist')}`}>
              <Heart className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Saved</span>
              {wishlistItems.length > 0 && (
                <span className="absolute top-[-3px] right-[10px] bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className={`flex flex-col items-center gap-0.5 relative flex-1 ${getActiveTabClass('/cart')}`}>
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Cart</span>
              {cart.length > 0 && (
                <span className="absolute top-[-3px] right-[4px] bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cart.length}
                </span>
              )}
            </Link>

            <Link to="/orders" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/orders')}`}>
              <Truck className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Orders</span>
            </Link>
          </>
        )}

        {/* SELLER MODE NAVIGATION */}
        {isSellerMode && (
          <>
            <Link to="/seller-dashboard" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/seller-dashboard')}`}>
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Products</span>
            </Link>

            <Link to="/orders" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/orders')}`}>
              <Truck className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Orders</span>
            </Link>
          </>
        )}

        {/* ADMIN MODE NAVIGATION */}
        {isAdminMode && (
          <>
            <Link to="/admin-dashboard" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/admin-dashboard')}`}>
              <User className="w-5 h-5" />
              <span className="text-[9px] uppercase tracking-wider">Admin</span>
            </Link>
          </>
        )}

        {/* DASHBOARD ROLE CONTROL - Always visible */}
        <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 flex-1 ${getActiveTabClass('/dashboard')}`}>
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Profile</span>
        </Link>

        {/* ROLE/MODE SWITCHER - Always visible */}
        <div className="flex flex-col items-center justify-center flex-1 shrink-0 border-l border-warmborder pl-2">
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value);
            }}
            className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 text-primary border border-primary/30 rounded-md py-1 px-1.5 text-[8px] font-bold outline-none cursor-pointer shadow-sm transition-colors"
            title="Switch between Buyer and Seller mode"
          >
            <option value="buyer">👤 Buy</option>
            {user && user.role.includes('seller') && <option value="seller">🏪 Sell</option>}
            {user && (user.role.includes('admin') || user.role.includes('superadmin')) && (
              <option value="admin">🛡️ Admin</option>
            )}
          </select>
          <span className="text-[6px] font-bold text-textSecondary uppercase tracking-widest mt-0.5 text-center leading-tight">Mode</span>
        </div>

      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-background text-textPrimary antialiased selection:bg-primary/10 selection:text-primary max-w-lg mx-auto border-x border-warmborder shadow-lifted pb-32">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Persistent Bottom Mobile Nav bar */}
      <MobileNavigation />
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
