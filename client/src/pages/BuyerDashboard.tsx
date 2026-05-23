import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag,
  MapPin,
  Heart,
  Wallet,
  LogOut,
  Settings,
  User,
  Package
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user, token, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [buyerProfile, setBuyerProfile] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/checkout');
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
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-primary/10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Buyer Profile</h1>
              <p className="text-sm text-textSecondary">Your shopping hub</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 border border-primary/10 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-textPrimary">{buyerProfile?.name}</h2>
              <p className="text-sm text-textSecondary">{buyerProfile?.email}</p>
              <p className="text-sm text-textSecondary">{buyerProfile?.phone}</p>
            </div>
            <User className="w-10 h-10 text-primary/30" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">My Orders</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Discover</span>
            </button>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-sm font-semibold text-textSecondary uppercase tracking-wide">Wallet Balance</span>
          </div>
          <p className="text-3xl font-bold text-primary">₹{walletBalance.toFixed(2)}</p>
          <p className="text-xs text-textSecondary mt-2">Available for purchases and refunds</p>
        </div>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Addresses
            </h3>
            <div className="space-y-2">
              {savedAddresses.map((addr, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-primary/10">
                  <p className="font-semibold text-textPrimary">{addr.label}</p>
                  <p className="text-sm text-textSecondary">{addr.addressLine}</p>
                  <p className="text-sm text-textSecondary">
                    {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <div className="space-y-2">
              {recentOrders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-primary/10 hover:border-primary/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/orders`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-textPrimary">Order #{order._id?.slice(-6)}</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary uppercase">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-textSecondary">₹{order.totalPrice?.toFixed(2)}</p>
                  <p className="text-xs text-textSecondary mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
