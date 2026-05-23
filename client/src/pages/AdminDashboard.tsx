import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  BarChart3,
  LogOut,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not an admin
  useEffect(() => {
    if (!user || (!user.role.includes('admin') && !user.role.includes('superadmin'))) {
      navigate('/');
    }
  }, [user, navigate]);

  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch admin dashboard
  const fetchAdminDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);

      // Fetch admin metrics
      const metricsRes = await fetch('/api/v1/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setAdminMetrics(metricsData.data);
      }

      // Fetch pending sellers
      const sellersRes = await fetch('/api/v1/admin/sellers/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sellersData = await sellersRes.json();
      if (sellersData.success) {
        setPendingSellers(sellersData.data);
      }

      // Fetch all users
      const usersRes = await fetch('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setAllUsers(usersData.data);
      }

      // Fetch all orders
      const ordersRes = await fetch('/api/v1/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setAllOrders(ordersData.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading admin dashboard...</p>
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
              <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
              <p className="text-sm text-textSecondary">Platform Management</p>
            </div>
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Key Metrics */}
        {adminMetrics && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{adminMetrics.totalOrders || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Users</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{adminMetrics.totalUsers || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{adminMetrics.totalRevenue?.toFixed(0) || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
              <AlertCircle className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Active Sellers</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{adminMetrics.activeSellers || '0'}</p>
            </div>
          </div>
        )}

        {/* Pending Seller Approvals */}
        {pendingSellers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Pending Seller Approvals ({pendingSellers.length})
            </h3>
            <div className="space-y-2">
              {pendingSellers.slice(0, 5).map((seller, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-textPrimary">{seller.businessName}</span>
                      <p className="text-sm text-textSecondary">{seller.ownerName}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 uppercase">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-textSecondary">{seller.email}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1 px-2 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 transition-colors flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button className="flex-1 py-1 px-2 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {allOrders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <div className="space-y-2">
              {allOrders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-primary/10">
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

        {/* Users Overview */}
        {allUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Users Overview
            </h3>
            <div className="bg-white rounded-lg p-4 border border-primary/10">
              <p className="text-sm text-textSecondary mb-3">Total Users: <span className="font-bold text-textPrimary">{allUsers.length}</span></p>
              <div className="space-y-2">
                {allUsers.slice(0, 3).map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-textPrimary">{u.name}</p>
                      <p className="text-textSecondary">{u.email}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {u.role.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
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
