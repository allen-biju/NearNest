import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TranslationProvider } from './context/TranslationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// Import pages
import Home from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Dashboards } from './pages/Dashboards';

// Icons
import { 
  Compass, 
  ShoppingBag, 
  Truck, 
  User, 
  MapPin 
} from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();
  const { user, activeRole, setActiveRole } = useAuth();

  const getActiveTabClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive 
      ? 'text-primary scale-110 font-bold transition-all duration-200' 
      : 'text-textSecondary/60 hover:text-textPrimary transition-all duration-200';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warmborder py-2 px-4 shadow-lifted">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        
        {/* DISCOVER HUB TAB */}
        <Link to="/" className={`flex flex-col items-center gap-0.5 ${getActiveTabClass('/')}`}>
          <Compass className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Discover</span>
        </Link>

        {/* BASKET CART TAB */}
        <Link to="/cart" className={`flex flex-col items-center gap-0.5 relative ${getActiveTabClass('/cart')}`}>
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Cart</span>
          {cart.length > 0 && (
            <span className="absolute top-[-3px] right-[4px] bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {cart.length}
            </span>
          )}
        </Link>

        {/* ACTIVE TRACKING TAB */}
        <Link to="/orders" className={`flex flex-col items-center gap-0.5 ${getActiveTabClass('/orders')}`}>
          <Truck className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Tracking</span>
        </Link>

        {/* DASHBOARD ROLE CONTROL */}
        <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 ${getActiveTabClass('/dashboard')}`}>
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Dashboard</span>
        </Link>

        {/* DEVELOPER QUICK ROLE SWITCHER POPUP SHEET */}
        {user && (
          <div className="flex flex-col items-center justify-center shrink-0 border-l border-warmborder pl-3.5">
            <select
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value);
                alert(`Role active simulation swapped to: ${e.target.value.toUpperCase()}`);
              }}
              className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-md py-0.5 px-1 text-[9px] font-bold outline-none cursor-pointer"
              title="Simulation Helper"
            >
              <option value="buyer">Buyer</option>
              {user.role.includes('seller') && <option value="seller">Seller</option>}
              {(user.role.includes('admin') || user.role.includes('superadmin')) && (
                <option value="admin">Admin</option>
              )}
            </select>
            <span className="text-[7px] font-bold text-textSecondary uppercase tracking-widest mt-0.5">Role Swap</span>
          </div>
        )}

      </div>
    </div>
  );
};

export const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="relative min-h-screen bg-background text-textPrimary antialiased selection:bg-primary/10 selection:text-primary max-w-lg mx-auto border-x border-warmborder shadow-lifted pb-12">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboards />} />
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
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </TranslationProvider>
    </Router>
  );
}

export default App;
