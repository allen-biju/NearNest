import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  Award,
  Power,
  Clock,
  ListPlus,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const Dashboards: React.FC = () => {
  const { user, token, activeRole, setActiveRole, refetchUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // ----------------------------------------------------
  // SELLER STATES
  // ----------------------------------------------------
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerMetrics, setSellerMetrics] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  
  // New Product Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newUnit, setNewUnit] = useState<string>('portion');
  const [newCategory, setNewCategory] = useState<string>('bakery');
  const [newPreparationTime, setNewPreparationTime] = useState<number>(30);
  const newDesc = 'Made fresh in my kitchen with organic home-ground ingredients.';
  const newIngredients = 'Flour, pure water, home starter, salt';
  const [showProductForm, setShowProductForm] = useState<boolean>(false);

  // ----------------------------------------------------
  // ADMIN STATES
  // ----------------------------------------------------
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_allOrders, setAllOrders] = useState<any[]>([]);

  // ----------------------------------------------------
  // COMMON EFFECTS
  // ----------------------------------------------------
  const fetchSellerDashboard = async () => {
    if (!token) return;
    try {
      // 1. Fetch storefront
      const profileRes = await fetch('/api/v1/sellers/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      await profileRes.json();
      // Since storefront uses settings or query, if they are already registered:
      
      // 2. Fetch seller orders
      const ordersRes = await fetch('/api/v1/orders/seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setSellerOrders(ordersData.data);
      }

      // 3. Fetch analytics
      const analyticsRes = await fetch('/api/v1/sellers/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setSellerMetrics(analyticsData.data.metrics);
        setIsOpen(analyticsData.data.metrics.revenue !== undefined); // mock toggle base
      }
    } catch (err) {
      console.error('Failed to load seller dashboard details:', err);
    }
  };

  const fetchAdminDashboard = async () => {
    if (!token) return;
    try {
      // 1. Fetch metrics
      const metricsRes = await fetch('/api/v1/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setAdminMetrics(metricsData.data);
      }

      // 2. Fetch pending onboarding list
      const pendingRes = await fetch('/api/v1/admin/sellers/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setPendingSellers(pendingData.data);
      }

      // 3. Fetch all platform users
      const usersRes = await fetch('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setAllUsers(usersData.data);
      }

      // 4. Fetch all orders
      const ordersRes = await fetch('/api/v1/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setAllOrders(ordersData.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    if (activeRole === 'seller') {
      fetchSellerDashboard();
    } else if (activeRole === 'admin') {
      fetchAdminDashboard();
    }
  }, [activeRole, token]);

  // Toggle Store Status
  const handleToggleStoreStatus = async () => {
    try {
      const res = await fetch('/api/v1/sellers/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isOpen: !isOpen })
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(!isOpen);
        alert(`Storefront status is now: ${!isOpen ? 'OPEN' : 'CLOSED'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Product Listing
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newUnit) {
      alert('Please fill product details');
      return;
    }
    try {
      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          price: newPrice,
          unit: newUnit,
          category: newCategory,
          description: newDesc,
          ingredients: newIngredients,
          preparationTimeMinutes: newPreparationTime,
          stock: 15,
          isUnlimitedStock: true
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Homemade product listed successfully!');
        setShowProductForm(false);
        setNewTitle('');
        fetchSellerDashboard();
      } else {
        alert(data.error?.message || 'Listing creation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advance Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, note: `Status updated by creator` })
      });
      const data = await res.json();
      if (data.success) {
        fetchSellerDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Onboarding action (approve / reject)
  const handleOnboardingAction = async (sellerId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/v1/admin/sellers/${sellerId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Kitchen application has been: ${action.toUpperCase()}D!`);
        fetchAdminDashboard();
        refetchUser(); // Refresh user role lists
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-xs uppercase tracking-wider text-textSecondary flex items-center gap-1">
          {activeRole === 'seller' ? <Store className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          <span>Control Panel</span>
        </h2>
        
        {/* Dynamic role switch toggles */}
        <div className="flex bg-surface border border-warmborder rounded-full p-0.5 shadow-sm text-[10px] font-bold">
          {user?.role.includes('seller') && (
            <button
              onClick={() => setActiveRole('seller')}
              className={`px-3 py-1 rounded-full ${activeRole === 'seller' ? 'bg-primary text-white' : 'text-textSecondary'}`}
            >
              Seller
            </button>
          )}
          {(user?.role.includes('admin') || user?.role.includes('superadmin')) && (
            <button
              onClick={() => setActiveRole('admin')}
              className={`px-3 py-1 rounded-full ${activeRole === 'admin' ? 'bg-primary text-white' : 'text-textSecondary'}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-6">

        {/* ---------------------------------------------------- */}
        {/* CASE A: SELLER CONTROL PANEL */}
        {/* ---------------------------------------------------- */}
        {activeRole === 'seller' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Seller profile overview & store switch */}
            <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-premium flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-secondary font-black uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 fill-secondary animate-pulse" />
                  Local Creator Store
                </p>
                <h3 className="font-serif font-black text-lg text-textPrimary leading-snug mt-1">
                  {user?.name} Kitchen
                </h3>
                <p className="text-xs text-textSecondary mt-0.5">Calicut Hyperlocal Hub</p>
              </div>

              {/* Toggle switch open closed */}
              <button
                onClick={handleToggleStoreStatus}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isOpen 
                    ? 'bg-emerald-500 text-white shadow-lifted scale-95' 
                    : 'bg-red-500 text-white'
                }`}
                title={isOpen ? 'Open Now (Click to Close)' : 'Closed Now (Click to Open)'}
              >
                <Power className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics cards */}
            {sellerMetrics && (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-warmborder rounded-2xl p-3 text-center shadow-sm">
                  <p className="text-[8px] text-textSecondary uppercase font-black tracking-wider">Earnings</p>
                  <p className="text-sm font-black text-primary mt-1 font-mono">₹{sellerMetrics.revenue || 0}</p>
                </div>
                <div className="bg-white border border-warmborder rounded-2xl p-3 text-center shadow-sm">
                  <p className="text-[8px] text-textSecondary uppercase font-black tracking-wider">Total Orders</p>
                  <p className="text-sm font-black text-secondary mt-1 font-mono">{sellerMetrics.orders || 0}</p>
                </div>
                <div className="bg-white border border-warmborder rounded-2xl p-3 text-center shadow-sm">
                  <p className="text-[8px] text-textSecondary uppercase font-black tracking-wider">Kitchen Rating</p>
                  <p className="text-sm font-black text-amber-500 mt-1 font-mono">★ {sellerMetrics.rating || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* INCOMING ACTIVE ORDERS */}
            <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="font-serif font-black text-sm text-textPrimary">Incoming Kitchen Orders</h3>
              
              {sellerOrders.length === 0 ? (
                <p className="text-xs text-textSecondary italic text-center py-4">No active orders queued in your kitchen.</p>
              ) : (
                <div className="space-y-4 divide-y divide-warmborder">
                  {sellerOrders.map((order) => (
                    <div key={order._id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-black text-textPrimary">{order.orderNumber}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider text-[9px] font-black">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-textSecondary space-y-0.5">
                        <p>👤 Buyer: {order.buyerId?.name || 'Local Neighbor'}</p>
                        <p>📍 Address: {order.deliveryAddress.addressLine}</p>
                        <p>🍲 Item(s): {order.items.map((i: any) => `${i.title} x${i.quantity}`).join(', ')}</p>
                      </div>

                      {/* State transitions buttons */}
                      <div className="flex gap-1.5 flex-wrap pt-1">
                        {order.status === 'placed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Accept Order
                          </button>
                        )}
                        {order.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'preparing')}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'ready')}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Mark Packed & Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'out_for_delivery')}
                            className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Send Out For Delivery
                          </button>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Mark Delivered
                          </button>
                        )}
                        
                        {order.status === 'placed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-black rounded-lg uppercase transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIST A DYNAMIC NEW HOMEMADE CREATION */}
            <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-black text-sm text-textPrimary">Kitchen Creations</h3>
                <button
                  onClick={() => setShowProductForm(!showProductForm)}
                  className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase flex items-center gap-1"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  Add Creation
                </button>
              </div>

              {showProductForm && (
                <form onSubmit={handleCreateProductSubmit} className="space-y-3 bg-background p-3 rounded-xl border border-warmborder">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Product Title</label>
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      placeholder="e.g. Saffron Rose Milk Shake" 
                      className="w-full px-2.5 py-1.5 bg-white border border-warmborder rounded-lg text-xs" 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Price (INR)</label>
                      <input 
                        type="number" 
                        value={newPrice} 
                        onChange={(e) => setNewPrice(Number(e.target.value))} 
                        className="w-full px-2.5 py-1.5 bg-white border border-warmborder rounded-lg text-xs font-mono" 
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Unit Description</label>
                      <input 
                        type="text" 
                        value={newUnit} 
                        onChange={(e) => setNewUnit(e.target.value)} 
                        placeholder="e.g. 500ml jar" 
                        className="w-full px-2.5 py-1.5 bg-white border border-warmborder rounded-lg text-xs" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-warmborder rounded-lg text-xs"
                      >
                        <option value="bakery">🍰 Bakery</option>
                        <option value="food">🍱 Hot Food</option>
                        <option value="snacks">🧁 Snacks</option>
                        <option value="crafts">🧴 Crafts</option>
                        <option value="beverages">🥤 beverages</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-textSecondary">Preparation Time (Mins)</label>
                      <input 
                        type="number" 
                        value={newPreparationTime} 
                        onChange={(e) => setNewPreparationTime(Number(e.target.value))} 
                        className="w-full px-2.5 py-1.5 bg-white border border-warmborder rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-lg uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Confirm Listing
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* CASE B: ADMINISTRATOR CONTROL PANEL */}
        {/* ---------------------------------------------------- */}
        {activeRole === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Admin metrics breakdown */}
            {adminMetrics && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-textSecondary uppercase font-bold">Total Users</p>
                    <p className="text-base font-black text-textPrimary font-mono mt-0.5">{adminMetrics.totalUsers}</p>
                  </div>
                </div>

                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-textSecondary uppercase font-bold">Approved Kitchens</p>
                    <p className="text-base font-black text-textPrimary font-mono mt-0.5">{adminMetrics.totalSellers}</p>
                  </div>
                </div>

                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-textSecondary uppercase font-bold">Commission Revenue</p>
                    <p className="text-base font-black text-emerald-700 font-mono mt-0.5">₹{adminMetrics.totalCommissionCollected}</p>
                  </div>
                </div>

                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-textSecondary uppercase font-bold">Platform Orders</p>
                    <p className="text-base font-black text-indigo-700 font-mono mt-0.5">{adminMetrics.totalOrdersCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ONBOARDING MODERATION QUEUE */}
            <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Pending Onboarding Queue</span>
              </h3>

              {pendingSellers.length === 0 ? (
                <p className="text-xs text-textSecondary italic text-center py-4">No pending kitchen applications in moderation.</p>
              ) : (
                <div className="space-y-4 divide-y divide-warmborder">
                  {pendingSellers.map((seller) => (
                    <div key={seller._id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <h4 className="font-serif font-black text-textPrimary">🏡 {seller.businessName}</h4>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-wider">
                          Pending Approval
                        </span>
                      </div>

                      <div className="text-xs text-textSecondary space-y-0.5">
                        <p>📍 Address: {seller.address.addressLine}, {seller.address.city}</p>
                        <p>🥗 Category: {seller.category}</p>
                        <p>🏦 Bank Account: {seller.bankDetails.bankName} - {seller.bankDetails.accountNumber}</p>
                      </div>

                      {/* Onboarding buttons */}
                      <div className="flex gap-2 pt-1.5">
                        <button
                          onClick={() => handleOnboardingAction(seller._id, 'approve')}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase transition-colors shadow-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve Onboarding
                        </button>
                        <button
                          onClick={() => handleOnboardingAction(seller._id, 'reject')}
                          className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-black rounded-lg uppercase transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* USER REGISTER FEED */}
            <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-serif font-black text-sm text-textPrimary">Platform Neighbors ({allUsers.length})</h3>
              
              <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1.5">
                {allUsers.map((u) => (
                  <div key={u._id} className="text-xs flex justify-between items-center py-1.5 border-b border-dotted border-warmborder last:border-b-0">
                    <span className="font-bold text-textPrimary">{u.name}</span>
                    <div className="space-x-1">
                      {u.role.map((r: string) => (
                        <span key={r} className="px-1.5 py-0.5 bg-surface text-[8px] font-bold uppercase rounded text-textSecondary">{r}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
