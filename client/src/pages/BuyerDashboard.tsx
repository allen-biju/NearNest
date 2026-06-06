import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Wallet,
  LogOut,
  Package,
  ArrowLeft,
  ChevronRight,
  Compass,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BuyerDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch buyer dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user) return;
      try {
        setLoading(true);
        
        // Fetch orders
        const ordersRes = await fetch('/api/v1/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setRecentOrders(ordersData.data.slice(0, 5)); // Last 5 orders
        }

        // Set wallet and addresses from user context
        if (user.addresses) {
          setSavedAddresses(user.addresses);
        }
        setWalletBalance(user.walletBalance || 0);
        setBuyerProfile({
          name: user.name,
          email: user.email,
          phone: user.phone,
        });
      } catch (err) {
        console.error('Failed to fetch buyer data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return 'text-blue-600 bg-blue-50 border-blue-100/80';
      case 'accepted':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100/80';
      case 'preparing':
        return 'text-amber-600 bg-amber-50 border-amber-100/80';
      case 'ready':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100/80';
      case 'out_for_delivery':
        return 'text-pink-600 bg-pink-50 border-pink-100/80';
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100/80';
      case 'cancelled':
        return 'text-rose-600 bg-rose-50 border-rose-100/80';
      default:
        return 'text-textSecondary bg-surface border-warmborder';
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <div className="h-6 w-32 bg-warmborder rounded-xl shimmer" />
        <div className="h-44 w-full bg-warmborder rounded-[32px] shimmer" />
        <div className="h-28 w-full bg-warmborder rounded-[32px] shimmer" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="pb-28"
    >
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/85 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')} 
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
          My Account
        </h2>
        <div className="w-8 h-8" />
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        
        {/* 1. PROFILE DETAILS CARD */}
        <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <span className="font-serif font-black text-xl uppercase">
                {buyerProfile?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-black text-base text-textPrimary truncate">
                {buyerProfile?.name}
              </h3>
              <p className="text-[11px] text-textSecondary truncate font-medium">{buyerProfile?.email}</p>
              <p className="text-[11px] text-textSecondary font-mono font-bold mt-0.5">{buyerProfile?.phone}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/orders')}
              className="flex items-center justify-center gap-2 p-3 bg-surface border border-warmborder hover:bg-background rounded-xl transition-all"
            >
              <Package className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-textPrimary">My Orders</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/cart')}
              className="flex items-center justify-center gap-2 p-3 bg-surface border border-warmborder hover:bg-background rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-secondary" />
              <span className="text-xs font-black text-textPrimary">Cart</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/wishlist')}
              className="flex items-center justify-center gap-2 p-3 bg-surface border border-warmborder hover:bg-background rounded-xl transition-all"
            >
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-xs font-black text-textPrimary">Wishlist</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 p-3 bg-surface border border-warmborder hover:bg-background rounded-xl transition-all"
            >
              <Compass className="w-4 h-4 text-secondary" />
              <span className="text-xs font-black text-textPrimary">Explore</span>
            </motion.button>
          </div>
        </div>

        {/* 2. REFERRAL WALLET CARD */}
        <div className="bg-gradient-to-br from-primary to-accent text-white rounded-[28px] p-5.5 border border-primary/20 shadow-md relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          
          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="flex items-center gap-1.5 opacity-90">
              <Wallet className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Referral Wallet Balance</span>
            </div>
            <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-black rounded-lg uppercase tracking-wider">
              Active
            </span>
          </div>
          <p className="text-3xl font-black font-mono relative z-10">₹{walletBalance.toFixed(2)}</p>
          <p className="text-[10px] opacity-80 mt-2 relative z-10 leading-normal">
            Use this balance during sandbox secure checkout to claim direct instant rebates on your local food order!
          </p>
        </div>

        {/* 3. SAVED ADDRESSES */}
        {savedAddresses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5 pl-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Saved Locations</span>
            </h3>
            
            <div className="space-y-2.5">
              {savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white rounded-[20px] p-4 border border-warmborder/80 shadow-sm flex items-start gap-3">
                  <span className="p-2 bg-background border border-warmborder rounded-xl text-textSecondary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-xs font-black text-textPrimary">{addr.label}</p>
                    <p className="text-[11px] text-textSecondary leading-relaxed mt-0.5">{addr.addressLine}</p>
                    <p className="text-[10px] text-textSecondary/70 mt-0.5 font-bold uppercase tracking-wider">
                      {addr.city}, {addr.state} · {addr.pincode}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RECENT ORDERS LIST */}
        {recentOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5 pl-1">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Recent Orders</span>
            </h3>
            
            <div className="space-y-2.5">
              {recentOrders.map((order, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/orders`)}
                  className="bg-white rounded-[20px] p-4 border border-warmborder/80 hover:border-primary/50 cursor-pointer transition-all shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-textPrimary font-mono">#{order.orderNumber?.split('-').pop()}</span>
                      <span className="text-[9px] text-textSecondary/50 font-bold">·</span>
                      <span className="text-[10px] text-textSecondary">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs font-black text-primary font-mono mt-1">₹{order.total?.toFixed(2) || order.totalPrice?.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${getStatusBadge(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-textSecondary/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DISSOCIATIVE ACTIONS */}
        <div className="space-y-3 pt-3 border-t border-dotted border-warmborder">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 text-xs font-black rounded-2xl transition-colors uppercase tracking-widest"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </div>
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
};
