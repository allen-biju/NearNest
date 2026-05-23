import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  Award,
  LogOut,
  Clock,
  ListPlus,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { user, token, logout, refetchUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!user || !user.role.includes('seller')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Seller states
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerMetrics, setSellerMetrics] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  
  // New Product Form state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newUnit, setNewUnit] = useState<string>('portion');
  const [newCategory, setNewCategory] = useState<string>('bakery');
  const [newDesc, setNewDesc] = useState<string>('Made fresh in my kitchen with organic home-ground ingredients.');
  const [newIngredients, setNewIngredients] = useState<string>('Flour, pure water, home starter, salt');
  const [newPreparationTime, setNewPreparationTime] = useState<number>(30);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Fetch seller dashboard
  const fetchSellerDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Fetch seller profile/settings
      const profileRes = await fetch('/api/v1/sellers/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) {
        setSellerProfile(profileData.data);
        setIsOpen(profileData.data.isOpen || true);
      }
      
      // Fetch seller orders
      const ordersRes = await fetch('/api/v1/orders/seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setSellerOrders(ordersData.data);
      }

      // Fetch seller metrics
      const metricsRes = await fetch('/api/v1/sellers/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      if (metricsData.success) {
        setSellerMetrics(metricsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDashboard();
  }, [token]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setIsSubmittingProduct(true);
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
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Product added successfully!');
        setNewTitle('');
        setNewPrice(100);
        setNewDesc('Made fresh in my kitchen with organic home-ground ingredients.');
        setNewIngredients('Flour, pure water, home starter, salt');
        setNewPreparationTime(30);
        setShowProductForm(false);
        fetchSellerDashboard();
      } else {
        alert(data.error?.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Error adding product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleToggleOpen = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/sellers/status', {
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
      }
    } catch (err) {
      console.error('Error toggling store status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading seller dashboard...</p>
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
              <h1 className="text-2xl font-bold text-primary">Seller Hub</h1>
              <p className="text-sm text-textSecondary">Manage your store & products</p>
            </div>
            <Store className="w-8 h-8 text-primary" />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Store Status Card */}
        {sellerProfile && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-primary/10 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">{sellerProfile.businessName || 'My Store'}</h2>
                <p className="text-sm text-textSecondary">{sellerProfile.description}</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-primary/30" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg mb-4">
              <div>
                <p className="text-sm font-semibold text-textSecondary uppercase tracking-wide">Store Status</p>
                <p className="text-lg font-bold text-textPrimary mt-1">
                  {isOpen ? '🟢 Open' : '🔴 Closed'}
                </p>
              </div>
              <button
                onClick={handleToggleOpen}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  isOpen 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {isOpen ? 'Close' : 'Open'} Store
              </button>
            </div>

            {sellerProfile.location && (
              <div className="flex items-start gap-2 text-sm text-textSecondary">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>{sellerProfile.location.coordinates.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Metrics Cards */}
        {sellerMetrics && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Sales</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">₹{sellerMetrics.totalSales?.toFixed(0) || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Customers</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{sellerMetrics.totalCustomers || '0'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
              <Award className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Rating</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {sellerMetrics.averageRating?.toFixed(1) || 'N/A'} ⭐
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
              <ShoppingBag className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Orders</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{sellerOrders.length}</p>
            </div>
          </div>
        )}

        {/* Add Product Button */}
        {!showProductForm && (
          <button
            onClick={() => setShowProductForm(true)}
            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <ListPlus className="w-5 h-5" />
            Add New Product
          </button>
        )}

        {/* Add Product Form */}
        {showProductForm && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-primary/10 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Add New Product</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Product Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Sourdough Bread"
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-2">Unit *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                  >
                    <option value="piece">Piece</option>
                    <option value="portion">Portion</option>
                    <option value="dozen">Dozen</option>
                    <option value="kg">KG</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                >
                  <option value="bakery">Bakery</option>
                  <option value="snacks">Snacks</option>
                  <option value="food">Food</option>
                  <option value="beverages">Beverages</option>
                  <option value="crafts">Crafts</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your product..."
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Ingredients</label>
                <input
                  type="text"
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  placeholder="e.g., Flour, Water, Salt, Starter"
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Preparation Time (minutes)</label>
                <input
                  type="number"
                  value={newPreparationTime}
                  onChange={(e) => setNewPreparationTime(parseInt(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="flex-1 py-2 px-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isSubmittingProduct ? 'Adding...' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-textPrimary font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Orders */}
        {sellerOrders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-textPrimary mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <div className="space-y-2">
              {sellerOrders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-primary/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-textPrimary">Order #{order._id?.slice(-6)}</span>
                      <p className="text-sm text-textSecondary">Customer: {order.buyerName}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">₹{order.totalPrice?.toFixed(2)}</p>
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
