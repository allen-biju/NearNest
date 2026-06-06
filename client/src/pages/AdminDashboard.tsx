import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  LogOut,
  RefreshCw,
  ShoppingBag,
  Store,
  Star,
  Eye,
  EyeOff,
  Flag,
  Trash2,
  Package,
  Search,
  Ban,
  CircleCheck,
  FileText,
  IndianRupee,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'overview' | 'sellers' | 'products' | 'reviews' | 'orders';

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  suspended: 'bg-slate-100 text-slate-600 border-slate-200',
  placed: 'bg-blue-50 text-blue-700 border-blue-100',
  accepted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  preparing: 'bg-violet-50 text-violet-700 border-violet-100',
  ready: 'bg-teal-50 text-teal-700 border-teal-100',
  out_for_delivery: 'bg-sky-50 text-sky-700 border-sky-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  rejected_order: 'bg-rose-50 text-rose-700 border-rose-100',
  refunded: 'bg-purple-50 text-purple-700 border-purple-100',
};

export const AdminDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Data States
  const [allSellers, setAllSellers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [sellerStatusFilter, setSellerStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; type: 'seller' | 'product' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!user || (!user.role.includes('admin') && !user.role.includes('superadmin'))) {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [metricsR, sellersR, productsR, usersR, ordersR, reviewsR] = await Promise.all([
        fetch('/api/v1/admin/metrics', { headers }),
        fetch('/api/v1/admin/sellers', { headers }),
        fetch('/api/v1/admin/products', { headers }),
        fetch('/api/v1/admin/users', { headers }),
        fetch('/api/v1/admin/orders', { headers }),
        fetch('/api/v1/admin/reviews', { headers }),
      ]);

      const [metricsData, sellersData, productsData, usersData, ordersData, reviewsData] = await Promise.all([
        metricsR.json(), sellersR.json(), productsR.json(), usersR.json(), ordersR.json(), reviewsR.json()
      ]);

      if (!metricsData.success) console.warn('Metrics fetch failed');
      if (sellersData.success) setAllSellers(sellersData.data);
      if (productsData.success) setAllProducts(productsData.data);
      if (usersData.success) setAllUsers(usersData.data);
      if (ordersData.success) setAllOrders(ordersData.data);
      if (reviewsData.success) setAllReviews(reviewsData.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = () => { logout(); navigate('/'); };

  // --- SELLER ACTIONS ---
  const updateSellerStatus = async (id: string, approvalStatus: string, reason?: string) => {
    setActionLoading(id);
    try {
      // Use original approve/reject endpoint for pending→approved/rejected
      // Use new status endpoint for active → suspended / suspended → approved
      const endpoint = (approvalStatus === 'approved' || approvalStatus === 'rejected') && allSellers.find(s => s._id === id)?.approvalStatus === 'pending'
        ? `/api/v1/admin/sellers/${id}`
        : `/api/v1/admin/sellers/${id}/status`;
      
      const body = endpoint.includes('/status')
        ? { approvalStatus, rejectionReason: reason }
        : { action: approvalStatus === 'approved' ? 'approve' : 'reject', reason };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAllSellers(prev => prev.map(s => s._id === id ? { ...s, approvalStatus, isApproved: approvalStatus === 'approved' } : s));
      } else {
        alert(data.error?.message || 'Failed to update seller status');
      }
    } catch (err) {
      console.error('Seller update error:', err);
    } finally {
      setActionLoading(null);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  // --- PRODUCT ACTIONS ---
  const updateProductStatus = async (id: string, field: string, value: boolean) => {
    setActionLoading(id + field);
    try {
      const res = await fetch(`/api/v1/admin/products/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setAllProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
      }
    } catch (err) {
      console.error('Product update error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Permanently delete this product? This action cannot be undone.')) return;
    setActionLoading(id + 'del');
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllProducts(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Product delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // --- REVIEW ACTIONS ---
  const updateReview = async (id: string, field: string, value: boolean) => {
    setActionLoading(id + field);
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        setAllReviews(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
      }
    } catch (err) {
      console.error('Review update error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm('Permanently delete this review?')) return;
    setActionLoading(id + 'del');
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllReviews(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Review delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // --- DERIVED COMPUTATIONS ---
  const totalRevenue = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalCommission = allOrders.reduce((s, o) => s + (o.commissionAmount || 0), 0);
  const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
  const pendingSellers = allSellers.filter(s => s.approvalStatus === 'pending');
  const filteredSellers = sellerStatusFilter === 'all' ? allSellers : allSellers.filter(s => s.approvalStatus === sellerStatusFilter);
  const filteredProducts = allProducts.filter(p => !productSearch || p.title?.toLowerCase().includes(productSearch.toLowerCase()) || (p.sellerId?.businessName || '').toLowerCase().includes(productSearch.toLowerCase()));

  const metricCards = [
    { label: 'Platform Orders', value: allOrders.length, sub: `${deliveredOrders.length} delivered`, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'Registered Users', value: allUsers.length, sub: `${allSellers.length} sellers`, icon: Users, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Platform Revenue', value: `₹${totalRevenue.toFixed(0)}`, sub: `₹${totalCommission.toFixed(0)} earned (commissions)`, icon: IndianRupee, color: 'text-violet-600 bg-violet-50', border: 'border-violet-100' },
    { label: 'Pending Approvals', value: pendingSellers.length, sub: `${allSellers.filter(s => s.approvalStatus === 'suspended').length} suspended`, icon: AlertCircle, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
  ];

  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sellers', label: 'Sellers', icon: Store, badge: pendingSellers.length || undefined },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: allReviews.filter(r => r.isFlagged).length || undefined },
    { id: 'orders', label: 'Orders & Reports', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-textSecondary font-medium">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFB]">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3.5 border-b border-warmborder/80 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.04)]">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-textPrimary leading-none">Admin Control Panel</h2>
            <p className="text-[10px] text-textSecondary font-bold uppercase tracking-widest mt-0.5 hidden sm:block">NearNest Platform Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.92 }} onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-warmborder rounded-xl hover:bg-surface text-primary shadow-sm text-[10px] font-black uppercase tracking-wider transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.92 }} onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* ADMIN HERO */}
        <div className="bg-gradient-to-br from-textPrimary to-[#2d2010] text-white rounded-[28px] p-6 relative overflow-hidden shadow-md">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
          <div className="absolute right-8 -bottom-8 w-40 h-40 bg-primary/20 rounded-full blur-xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <span className="p-3 bg-white/10 rounded-2xl border border-white/10 shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Signed in as</p>
                <h3 className="font-serif font-black text-lg text-white leading-snug">{user?.name}</h3>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Access Level</p>
              <p className="text-xs text-primary font-black uppercase tracking-widest mt-0.5">Platform Administrator</p>
              <p className="text-[10px] text-white/40 font-semibold mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-white border ${card.border} rounded-[24px] p-5 shadow-sm flex flex-col justify-between h-[7.5rem] hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-textSecondary">{card.label}</span>
                  <span className={`p-2 rounded-xl ${card.color}`}><Icon className="w-4 h-4" /></span>
                </div>
                <div>
                  <p className="text-2xl font-black text-textPrimary font-mono">{card.value}</p>
                  <p className="text-[10px] text-textSecondary mt-0.5">{card.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-1 bg-surface/50 border border-warmborder rounded-2xl p-1.5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-max flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isActive ? 'bg-white text-textPrimary shadow-sm border border-warmborder/60' : 'text-textSecondary hover:text-textPrimary'}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-5">
                  {/* Pending Approvals Quick View */}
                  {pendingSellers.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Creator Approvals
                        <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black rounded border border-amber-100 uppercase">{pendingSellers.length} waiting</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingSellers.slice(0, 4).map((seller, idx) => (
                          <motion.div key={seller._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[20px] p-4 border border-amber-100/80 shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-black text-textPrimary truncate">{seller.businessName}</p>
                                <p className="text-[10px] text-textSecondary">{seller.category} · {seller.address?.city}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black rounded border border-amber-100 uppercase shrink-0">Pending</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => updateSellerStatus(seller._id, 'approved')} disabled={actionLoading === seller._id}
                                className="flex-1 py-2 text-[10px] font-black rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {actionLoading === seller._id ? 'Saving…' : 'Approve'}
                              </button>
                              <button onClick={() => setRejectModal({ id: seller._id, type: 'seller' })}
                                className="flex-1 py-2 text-[10px] font-black rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors flex items-center justify-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {pendingSellers.length > 4 && (
                        <button onClick={() => setActiveTab('sellers')} className="text-xs text-primary font-black hover:underline">
                          View all {pendingSellers.length} pending →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Recent Orders */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-primary" /> Recent Orders
                    </h3>
                    <div className="bg-white rounded-[24px] border border-warmborder shadow-sm overflow-hidden">
                      <div className="hidden md:grid grid-cols-4 gap-4 px-5 py-3 bg-surface/50 border-b border-warmborder text-[9px] font-black uppercase tracking-wider text-textSecondary">
                        <span>Order #</span><span>Date</span><span>Commission</span><span>Total / Status</span>
                      </div>
                      <div className="divide-y divide-warmborder/60 max-h-[420px] overflow-y-auto">
                        {allOrders.slice(0, 15).map((order, idx) => (
                          <div key={idx} className="px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-4 items-center hover:bg-surface/10 transition-colors">
                            <p className="text-xs font-black text-textPrimary font-mono">#{order._id?.slice(-8)}</p>
                            <p className="text-[10px] text-textSecondary">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                            <p className="text-xs font-bold text-secondary font-mono">₹{((order.total || 0) * 0.1).toFixed(0)}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-primary font-mono">₹{(order.total || 0).toFixed(0)}</span>
                              <span className={`px-1.5 py-0.5 text-[7px] font-black rounded border uppercase ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>{order.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> Recent Users <span className="ml-auto text-[9px] text-textSecondary">{allUsers.length} total</span>
                    </h3>
                    <div className="bg-white rounded-[24px] border border-warmborder shadow-sm overflow-hidden divide-y divide-warmborder/60">
                      {allUsers.slice(0, 8).map((u, idx) => (
                        <div key={idx} className="px-4 py-3 flex items-center justify-between gap-2 hover:bg-surface/10 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-black text-textPrimary truncate">{u.name}</p>
                            <p className="text-[10px] text-textSecondary truncate">{u.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 shrink-0">
                            {u.role?.slice(0, 2).map((r: string) => (
                              <span key={r} className={`px-1.5 py-0.5 text-[7px] font-black rounded border uppercase ${r === 'admin' || r === 'superadmin' ? 'bg-rose-50 text-rose-600 border-rose-100' : r === 'seller' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Info */}
                  <div className="bg-white rounded-[24px] border border-warmborder p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-black font-serif text-textPrimary">Platform Summary</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'Total Products', val: allProducts.length },
                        { label: 'Active Products', val: allProducts.filter(p => p.isActive).length },
                        { label: 'Featured', val: allProducts.filter(p => p.isFeatured).length },
                        { label: 'Reviews', val: allReviews.length },
                        { label: 'Flagged Reviews', val: allReviews.filter(r => r.isFlagged).length },
                        { label: 'Total Sellers', val: allSellers.length },
                        { label: 'Approved Sellers', val: allSellers.filter(s => s.approvalStatus === 'approved').length },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-0.5 border-b border-dashed border-warmborder last:border-0">
                          <span className="text-textSecondary">{item.label}</span>
                          <span className="font-black text-textPrimary font-mono">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SELLERS TAB ── */}
            {activeTab === 'sellers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2"><Store className="w-4 h-4 text-primary" /> All Sellers</h3>
                  <div className="flex gap-1.5 flex-wrap ml-auto">
                    {['all', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
                      <button key={status} onClick={() => setSellerStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${sellerStatusFilter === status ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-textSecondary border-warmborder hover:bg-surface'}`}>
                        {status} {status !== 'all' && <span className="opacity-60">({allSellers.filter(s => s.approvalStatus === status).length})</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSellers.map((seller, idx) => (
                    <motion.div key={seller._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className="bg-white rounded-[24px] border border-warmborder shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-textPrimary truncate">{seller.businessName}</p>
                          <p className="text-[10px] text-textSecondary mt-0.5">{seller.category} · {seller.address?.city}</p>
                          <p className="text-[10px] text-textSecondary">{(seller.userId as any)?.email || seller.email}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded-lg border uppercase shrink-0 ${STATUS_COLORS[seller.approvalStatus]}`}>
                          {seller.approvalStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="bg-surface rounded-xl p-2">
                          <p className="font-black text-textPrimary font-mono">{seller.totalOrders ?? 0}</p>
                          <p className="text-textSecondary">Orders</p>
                        </div>
                        <div className="bg-surface rounded-xl p-2">
                          <p className="font-black text-textPrimary font-mono">₹{(seller.totalRevenue ?? 0).toFixed(0)}</p>
                          <p className="text-textSecondary">Revenue</p>
                        </div>
                        <div className="bg-surface rounded-xl p-2">
                          <p className="font-black text-textPrimary font-mono">⭐ {seller.rating?.average ?? '—'}</p>
                          <p className="text-textSecondary">Rating</p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {seller.approvalStatus === 'pending' && (
                          <>
                            <button onClick={() => updateSellerStatus(seller._id, 'approved')} disabled={actionLoading === seller._id}
                              className="flex-1 py-2 text-[10px] font-black rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                              <CircleCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => setRejectModal({ id: seller._id, type: 'seller' })}
                              className="flex-1 py-2 text-[10px] font-black rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors flex items-center justify-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {seller.approvalStatus === 'approved' && (
                          <button onClick={() => { if (window.confirm('Suspend this seller? They will lose seller access.')) updateSellerStatus(seller._id, 'suspended'); }}
                            className="flex-1 py-2 text-[10px] font-black rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors flex items-center justify-center gap-1">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                        {(seller.approvalStatus === 'suspended' || seller.approvalStatus === 'rejected') && (
                          <button onClick={() => updateSellerStatus(seller._id, 'approved')} disabled={actionLoading === seller._id}
                            className="flex-1 py-2 text-[10px] font-black rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
                            <CircleCheck className="w-3.5 h-3.5" /> Re-Activate
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PRODUCTS TAB ── */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> All Products <span className="text-textSecondary font-sans text-xs font-normal">({allProducts.length})</span></h3>
                  <div className="relative w-full sm:w-72 sm:ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textSecondary" />
                    <input type="text" placeholder="Search by product or seller name…" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-warmborder rounded-2xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
                  </div>
                </div>

                <div className="bg-white rounded-[24px] border border-warmborder shadow-sm overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-surface/50 border-b border-warmborder text-[9px] font-black uppercase tracking-wider text-textSecondary">
                    <span className="col-span-4">Product</span>
                    <span className="col-span-2">Seller</span>
                    <span className="col-span-1">Price</span>
                    <span className="col-span-1">Stock</span>
                    <span className="col-span-4 text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-warmborder/60 max-h-[600px] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center hover:bg-surface/10 transition-colors">
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                          {product.images?.[0] && <img src={product.images[0]} alt={product.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-xs font-black text-textPrimary truncate">{product.title}</p>
                            <p className="text-[10px] text-textSecondary">{product.category}</p>
                          </div>
                        </div>
                        <div className="col-span-6 md:col-span-2 min-w-0">
                          <p className="text-[10px] font-bold text-textSecondary truncate">{(product.sellerId as any)?.businessName || 'Unknown Seller'}</p>
                        </div>
                        <div className="col-span-3 md:col-span-1">
                          <p className="text-xs font-black text-primary font-mono">₹{product.price}</p>
                          {product.discountedPrice && <p className="text-[10px] line-through text-textSecondary">₹{product.discountedPrice}</p>}
                        </div>
                        <div className="col-span-3 md:col-span-1">
                          <p className="text-[10px] font-bold text-textSecondary">{product.isUnlimitedStock ? '∞' : product.stock}</p>
                        </div>
                        <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 text-[7px] font-black rounded-lg border uppercase ${product.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {product.isFeatured && <span className="px-2 py-0.5 text-[7px] font-black rounded-lg border uppercase bg-amber-50 text-amber-700 border-amber-100">Featured</span>}
                          <button onClick={() => updateProductStatus(product._id, 'isActive', !product.isActive)} disabled={actionLoading === product._id + 'isActive'}
                            className="p-1.5 rounded-lg bg-surface hover:bg-warmborder border border-warmborder text-textSecondary transition-colors" title={product.isActive ? 'Deactivate' : 'Activate'}>
                            {product.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => updateProductStatus(product._id, 'isFeatured', !product.isFeatured)} disabled={actionLoading === product._id + 'isFeatured'}
                            className={`p-1.5 rounded-lg border transition-colors ${product.isFeatured ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-surface border-warmborder text-textSecondary hover:bg-warmborder'}`} title="Toggle Featured">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteProduct(product._id)} disabled={actionLoading === product._id + 'del'}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 transition-colors" title="Delete Product">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" /> Review Moderation
                  <span className="ml-auto text-[9px] text-textSecondary">{allReviews.length} reviews · {allReviews.filter(r => r.isFlagged).length} flagged</span>
                </h3>
                <div className="space-y-3">
                  {allReviews.length === 0 && (
                    <div className="bg-white rounded-[24px] border border-warmborder p-10 text-center shadow-sm">
                      <p className="text-xs text-textSecondary">No reviews have been submitted yet.</p>
                    </div>
                  )}
                  {allReviews.map((review, idx) => (
                    <motion.div key={review._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className={`bg-white rounded-[24px] border shadow-sm p-5 space-y-3 transition-all ${review.isFlagged ? 'border-rose-200' : 'border-warmborder'} ${!review.isVisible ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-black text-textPrimary">{(review.buyerId as any)?.name || 'Unknown Buyer'}</p>
                            <span className="text-[10px] text-textSecondary">→</span>
                            <p className="text-[10px] font-bold text-textSecondary">{(review.productId as any)?.title || 'Product'}</p>
                          </div>
                          <p className="text-[10px] text-textSecondary">Seller: {(review.sellerId as any)?.businessName || 'Unknown'}</p>
                          <p className="text-[10px] text-textSecondary">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {review.isFlagged && <span className="px-2 py-0.5 text-[8px] font-black rounded-lg border uppercase bg-rose-50 text-rose-600 border-rose-100 flex items-center gap-1"><Flag className="w-2.5 h-2.5" /> Flagged</span>}
                          {!review.isVisible && <span className="px-2 py-0.5 text-[8px] font-black rounded-lg border uppercase bg-slate-50 text-slate-500 border-slate-200">Hidden</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.productRating ? 'fill-amber-400' : 'fill-none stroke-amber-300'}`} />
                          ))}
                        </div>
                        <span className="text-[10px] text-textSecondary">Product: {review.productRating}/5</span>
                        <span className="text-[10px] text-textSecondary">| Seller: {review.sellerRating}/5</span>
                      </div>

                      {review.comment && <p className="text-xs text-textSecondary bg-surface/30 rounded-xl px-3 py-2.5 leading-relaxed">{review.comment}</p>}

                      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-dashed border-warmborder">
                        <button onClick={() => updateReview(review._id, 'isVisible', !review.isVisible)} disabled={actionLoading === review._id + 'isVisible'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-colors ${review.isVisible ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'}`}>
                          {review.isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {review.isVisible ? 'Hide Review' : 'Show Review'}
                        </button>
                        <button onClick={() => updateReview(review._id, 'isFlagged', !review.isFlagged)} disabled={actionLoading === review._id + 'isFlagged'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-colors ${review.isFlagged ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' : 'bg-surface text-textSecondary border-warmborder hover:bg-warmborder'}`}>
                          <Flag className="w-3 h-3" />
                          {review.isFlagged ? 'Unflag' : 'Flag'}
                        </button>
                        <button onClick={() => deleteReview(review._id)} disabled={actionLoading === review._id + 'del'}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ORDERS & REPORTS TAB ── */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Gross Revenue (GMV)', val: `₹${totalRevenue.toFixed(0)}`, color: 'text-violet-600 bg-violet-50 border-violet-100' },
                    { label: 'Platform Commission (10%)', val: `₹${totalCommission.toFixed(0)}`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'Seller Payouts', val: `₹${allOrders.reduce((s, o) => s + (o.sellerEarnings || 0), 0).toFixed(0)}`, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { label: 'Delivered Orders', val: deliveredOrders.length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                  ].map((item, i) => (
                    <div key={i} className={`bg-white rounded-[24px] border p-5 shadow-sm ${item.color.split(' ')[2]}`}>
                      <p className="text-[9px] font-black uppercase tracking-wider text-textSecondary">{item.label}</p>
                      <p className={`text-2xl font-black font-mono mt-2 ${item.color.split(' ')[0]}`}>{item.val}</p>
                    </div>
                  ))}
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-white rounded-[24px] border border-warmborder shadow-sm p-5 space-y-4">
                  <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Order Status Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['placed', 'accepted', 'preparing', 'delivered', 'cancelled'].map(status => {
                      const count = allOrders.filter(o => o.status === status).length;
                      const pct = allOrders.length ? Math.round((count / allOrders.length) * 100) : 0;
                      return (
                        <div key={status} className={`rounded-2xl border p-4 text-center ${STATUS_COLORS[status] || ''}`}>
                          <p className="text-xl font-black font-mono">{count}</p>
                          <p className="text-[9px] font-black uppercase tracking-wider mt-0.5">{status}</p>
                          <p className="text-[10px] opacity-60 mt-0.5">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Orders Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black font-serif text-textPrimary flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> All Orders ({allOrders.length})</h3>
                  <div className="bg-white rounded-[24px] border border-warmborder shadow-sm overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-surface/50 border-b border-warmborder text-[9px] font-black uppercase tracking-wider text-textSecondary">
                      <span className="col-span-3">Order #</span>
                      <span className="col-span-2">Date</span>
                      <span className="col-span-2">Buyer</span>
                      <span className="col-span-2">Commission</span>
                      <span className="col-span-3">Total / Status</span>
                    </div>
                    <div className="divide-y divide-warmborder/60 max-h-[500px] overflow-y-auto">
                      {allOrders.map((order, idx) => (
                        <div key={idx} className="px-4 py-3 grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-4 items-center hover:bg-surface/5 transition-colors">
                          <div className="col-span-12 md:col-span-3">
                            <p className="text-xs font-black text-textPrimary font-mono">{order.orderNumber || `#${order._id?.slice(-10)}`}</p>
                          </div>
                          <div className="col-span-6 md:col-span-2">
                            <p className="text-[10px] text-textSecondary">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="col-span-6 md:col-span-2">
                            <p className="text-[10px] font-bold text-textSecondary truncate">{(order.buyerId as any)?.name || '—'}</p>
                          </div>
                          <div className="col-span-6 md:col-span-2">
                            <p className="text-xs font-bold text-secondary font-mono">₹{(order.commissionAmount || 0).toFixed(0)}</p>
                          </div>
                          <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                            <span className="text-xs font-black text-primary font-mono">₹{(order.total || 0).toFixed(0)}</span>
                            <span className={`px-1.5 py-0.5 text-[7px] font-black rounded border uppercase ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setRejectModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl border border-warmborder"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-serif font-black text-base text-textPrimary mb-1">Reject Application</h3>
              <p className="text-xs text-textSecondary mb-4">Provide a reason so the seller can correct their application and reapply.</p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Missing FSSAI food license, incomplete address details, unclear business name…"
                rows={4}
                className="w-full px-4 py-3 border border-warmborder rounded-2xl text-xs text-textPrimary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                  className="flex-1 py-2.5 bg-surface border border-warmborder text-textSecondary text-xs font-black rounded-2xl hover:bg-warmborder transition-colors uppercase tracking-wider">
                  Cancel
                </button>
                <button onClick={() => updateSellerStatus(rejectModal.id, 'rejected', rejectReason)} disabled={actionLoading === rejectModal.id}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-2xl transition-colors uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  {actionLoading === rejectModal.id ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
