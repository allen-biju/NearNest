import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Award,
  ShoppingBag,
  LogOut,
  Clock,
  MapPin,
  AlertCircle,
  Settings,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Package,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SellerDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
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
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
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
  const [newStock, setNewStock] = useState<number>(10);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Edit Product state
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editPrice, setEditPrice] = useState<number>(100);
  const [editUnit, setEditUnit] = useState<string>('portion');
  const [editCategory, setEditCategory] = useState<string>('bakery');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editIngredients, setEditIngredients] = useState<string>('');
  const [editPreparationTime, setEditPreparationTime] = useState<number>(30);
  const [editStock, setEditStock] = useState<number>(10);
  const [editIsUnlimited, setEditIsUnlimited] = useState<boolean>(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  // Fetch seller dashboard
  const fetchSellerDashboard = useCallback(async () => {
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
        setIsOpen(profileData.data.isOpen !== undefined ? profileData.data.isOpen : true);
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

      // Fetch seller products
      const productsRes = await fetch('/api/v1/sellers/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productsData = await productsRes.json();
      if (productsData.success) {
        setSellerProducts(productsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSellerDashboard();
  }, [fetchSellerDashboard]);

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      setIsSubmittingProduct(true);
      const payload: any = {
        title: newTitle,
        price: newPrice,
        unit: newUnit,
        category: newCategory,
        description: newDesc,
        ingredients: newIngredients,
        preparationTimeMinutes: newPreparationTime,
        stock: newStock,
      };

      if (newImageFile) {
        const imageDataUrl = await fileToDataUrl(newImageFile);
        payload.images = [imageDataUrl];
      }

      const res = await fetch('/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Product added successfully!');
        setNewTitle('');
        setNewPrice(100);
        setNewDesc('Made fresh in my kitchen with organic home-ground ingredients.');
        setNewIngredients('Flour, pure water, home starter, salt');
        setNewPreparationTime(30);
        setNewStock(10);
        setNewImageFile(null);
        setNewImagePreview('');
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

  const activeProductsCount = sellerProducts.filter((product) => product.isActive).length;
  const inactiveProductsCount = sellerProducts.filter((product) => !product.isActive).length;
  const lowStockProducts = sellerProducts.filter(
    (product) => !product.isUnlimitedStock && product.stock <= 5
  );
  const topCategories = Array.from(
    sellerProducts.reduce((map, product) => {
      if (product.category) {
        map.set(product.category, (map.get(product.category) || 0) + 1);
      }
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  // --- PRODUCT MANAGEMENT HANDLERS ---

  const handleToggleProductActive = async (productId: string, currentVal: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        setSellerProducts(prev => prev.map(p => p._id === productId ? { ...p, isActive: !currentVal } : p));
      }
    } catch (err) {
      console.error('Error toggling product status:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product creation?')) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSellerProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        alert(data.error?.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const startEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price);
    setEditUnit(product.unit);
    setEditCategory(product.category || 'bakery');
    setEditDesc(product.description || '');
    setEditIngredients(product.ingredients || '');
    setEditPreparationTime(product.preparationTimeMinutes || 30);
    setEditStock(product.stock || 0);
    setEditIsUnlimited(product.isUnlimitedStock || false);
    setEditImagePreview(product.images?.[0] || '');
    setEditImageFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    try {
      setIsUpdatingProduct(true);
      const payload: any = {
        title: editTitle,
        price: editPrice,
        unit: editUnit,
        category: editCategory,
        description: editDesc,
        ingredients: editIngredients,
        preparationTimeMinutes: editPreparationTime,
        stock: editStock,
        isUnlimitedStock: editIsUnlimited
      };

      if (editImageFile) {
        const imageDataUrl = await fileToDataUrl(editImageFile);
        payload.images = [imageDataUrl];
      }

      const res = await fetch(`/api/v1/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        setEditingProduct(null);
        fetchSellerDashboard();
      } else {
        alert(data.error?.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Error updating product');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return 'text-blue-600 bg-blue-50 border-blue-100/70';
      case 'accepted':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100/70';
      case 'preparing':
        return 'text-amber-600 bg-amber-50 border-amber-100/70';
      case 'ready':
        return 'text-yellow-600 bg-yellow-50 border-yellow-100/70';
      case 'out_for_delivery':
        return 'text-pink-600 bg-pink-50 border-pink-100/70';
      case 'delivered':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100/70';
      case 'cancelled':
        return 'text-rose-600 bg-rose-50 border-rose-100/70';
      default:
        return 'text-textSecondary bg-surface border-warmborder';
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-warmborder rounded-xl shimmer" />
          <div className="h-9 w-9 bg-warmborder rounded-full shimmer" />
        </div>
        <div className="h-32 w-full bg-warmborder rounded-[32px] shimmer" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-warmborder rounded-2xl shimmer" />
          <div className="h-20 bg-warmborder rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-28"
    >
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/85 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
            Seller Dashboard
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/seller-settings')}
            className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-primary shadow-sm flex items-center justify-center"
            title="Store Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-5">
          {/* 1. STORE PROFILE HEADER CARD */}
          {sellerProfile && (
            <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif font-black text-lg text-textPrimary leading-snug">
                  {sellerProfile.businessName || 'My Store'}
                </h2>
                <p className="text-xs text-textSecondary leading-normal mt-0.5">{sellerProfile.description}</p>
              </div>
              
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* STATUS TOGGLE SWIPE METER */}
            <div className="p-4 bg-background border border-warmborder rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Store Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <p className="text-xs font-black text-textPrimary">
                    {isOpen ? 'Open for Orders' : 'Temporarily Closed'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleOpen}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all ${
                  isOpen 
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100' 
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100'
                }`}
              >
                {isOpen ? 'Go Offline' : 'Go Live'}
              </button>
            </div>

            {sellerProfile.location && (
              <div className="flex items-center gap-2 text-[10px] text-textSecondary font-medium pl-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">Co-ords: </span>
                <span className="font-mono font-bold text-textPrimary bg-surface px-2 py-0.5 rounded border border-warmborder">
                  {sellerProfile.location.coordinates[1].toFixed(4)}, {sellerProfile.location.coordinates[0].toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. METRICS CARDS */}
        {sellerMetrics && (
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white border border-warmborder rounded-[24px] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Sales</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <p className="text-lg font-black text-textPrimary font-mono">₹{sellerMetrics.totalSales?.toFixed(0) || '0'}</p>
                <p className="text-[8px] text-textSecondary font-medium">All-time revenue</p>
              </div>
            </div>

            <div className="bg-white border border-warmborder rounded-[24px] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Neighbors</span>
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <p className="text-lg font-black text-textPrimary font-mono">{sellerMetrics.totalCustomers || '0'}</p>
                <p className="text-[8px] text-textSecondary font-medium">Unique Buyers</p>
              </div>
            </div>

            <div className="bg-white border border-warmborder rounded-[24px] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Trust</span>
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <p className="text-lg font-black text-textPrimary font-mono">
                  {sellerMetrics.averageRating?.toFixed(1) || '4.8'} <span className="text-xs text-amber-500">★</span>
                </p>
                <p className="text-[8px] text-textSecondary font-medium">Average feedback</p>
              </div>
            </div>

            <div className="bg-white border border-warmborder rounded-[24px] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between h-24">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Orders</span>
                <span className="p-1.5 bg-primary/5 text-primary rounded-lg"><ShoppingBag className="w-3.5 h-3.5" /></span>
              </div>
              <div>
                <p className="text-lg font-black text-textPrimary font-mono">{sellerOrders.length}</p>
                <p className="text-[8px] text-textSecondary font-medium">Placed Orders</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADD PRODUCT ACTION */}
        {!showProductForm && sellerProfile && (
          sellerProfile.isApproved ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProductForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </motion.button>
          ) : (
            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider">Verification Pending</h4>
                  <p className="text-[11px] text-textSecondary leading-relaxed mt-1">
                    Your cottage business application is being verified by NearNest safety admins. Product updates unlock once approved.
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* 4. EXPANDABLE ADD PRODUCT FORM */}
        <AnimatePresence>
          {showProductForm && sellerProfile?.isApproved && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-warmborder rounded-[28px] p-5 shadow-premium overflow-hidden space-y-4"
            >
              <h3 className="font-serif font-black text-sm text-textPrimary">List Homemade Product</h3>
              
              <form onSubmit={handleAddProduct} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Product Title *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Spicy Kozhikodan Halwa"
                    className="input-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Price (₹) *</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="input-base"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Sale Unit *</label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="input-base bg-background"
                    >
                      <option value="piece">Piece</option>
                      <option value="portion">Portion</option>
                      <option value="dozen">Dozen</option>
                      <option value="kg">KG</option>
                      <option value="liter">Liter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Initial Stock *</label>
                    <input
                      type="number"
                      value={newStock}
                      onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                      min="0"
                      className="input-base"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={newPreparationTime}
                      onChange={(e) => setNewPreparationTime(parseInt(e.target.value))}
                      min="0"
                      className="input-base"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-base bg-background"
                  >
                    <option value="bakery">Bakery</option>
                    <option value="snacks">Snacks</option>
                    <option value="food">Main Food Course</option>
                    <option value="beverages">Beverages</option>
                    <option value="crafts">Cottage Crafts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Product Image *</label>
                  <div className="relative border border-dashed border-warmborder hover:border-primary rounded-2xl p-4 transition-colors bg-background flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setNewImagePreview(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setNewImagePreview('');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <ImageIcon className="w-6 h-6 text-textSecondary/50 mb-1" />
                    <span className="text-[10px] text-textSecondary font-bold">
                      {newImageFile ? newImageFile.name : 'Upload product photo'}
                    </span>
                  </div>
                </div>

                {newImagePreview && (
                  <div className="border border-warmborder rounded-2xl overflow-hidden mt-3 shadow-inner">
                    <img src={newImagePreview} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Tell neighbors what makes this unique..."
                    className="input-base resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Allergen / Ingredients</label>
                  <input
                    type="text"
                    value={newIngredients}
                    onChange={(e) => setNewIngredients(e.target.value)}
                    placeholder="e.g. Sourdough wheat, water, yeast, salt"
                    className="input-base"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="btn-primary flex-1 py-2.5"
                  >
                    {isSubmittingProduct ? 'Saving...' : 'Add Creation'}
                  </motion.button>
                  
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="btn-ghost flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4.5. PRODUCT CREATIONS LISTING (Seller's Catalog) */}
        {sellerProfile?.isApproved && (
          <div className="space-y-3">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5 pl-1">
              <Package className="w-4 h-4 text-primary" />
              <span>My Menu Creations ({sellerProducts.length})</span>
            </h3>

            {sellerProducts.length === 0 ? (
              <div className="bg-white border border-warmborder rounded-[24px] p-6 text-center shadow-sm">
                <p className="text-xs text-textSecondary">No homemade items listed yet. Click "Add New Product" above to list your first item!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sellerProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className={`bg-white border border-warmborder rounded-[24px] p-4 shadow-sm flex gap-3 text-left transition-all ${
                      !product.isActive ? 'opacity-70 bg-surface/30' : ''
                    }`}
                  >
                    {/* Product Photo */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-background border border-warmborder shrink-0">
                      <img 
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100'} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-black text-textPrimary truncate">{product.title}</h4>
                          <span className="text-[10px] font-black text-primary font-mono shrink-0">₹{product.price}</span>
                        </div>
                        <p className="text-[10px] text-textSecondary line-clamp-1 mt-0.5">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-warmborder">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span className="text-[9px] font-bold text-textSecondary uppercase">
                            {product.isActive ? 'Active' : 'Hidden'}
                          </span>
                          <span className="text-textSecondary/30">·</span>
                          <span className="text-[9px] font-bold text-textSecondary uppercase">
                            Stock: {product.isUnlimitedStock ? '∞' : product.stock}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          {/* Toggle Active status */}
                          <button
                            onClick={() => handleToggleProductActive(product._id, product.isActive)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              product.isActive 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                            title={product.isActive ? 'Hide from store' : 'Publish to store'}
                          >
                            {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => startEditProduct(product)}
                            className="p-1.5 rounded-lg bg-surface border border-warmborder text-textSecondary hover:bg-warmborder transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-100 transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. RECENT ORDERS LIST */}
        {sellerOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5 pl-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>Incoming Orders Feed</span>
            </h3>
            
            <div className="space-y-2.5 text-left">
              {sellerOrders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="bg-white rounded-[20px] p-4 border border-warmborder/80 shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-textSecondary">
                      Order #{order._id?.slice(-6)} · {order.buyerName}
                    </p>
                    <p className="text-xs font-black text-primary font-mono mt-0.5">₹{order.totalPrice?.toFixed(2)}</p>
                    <p className="text-[9px] text-textSecondary/50 font-bold mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${getOrderStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SYSTEM LOGOUT */}
        <div className="pt-3 border-t border-dotted border-warmborder">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 text-xs font-black rounded-2xl transition-colors uppercase tracking-widest"
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Exit Seller Panel</span>
            </div>
          </motion.button>
        </div>

        </div>

        <aside className="hidden lg:block space-y-5">
          <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary">Quick actions</p>
                <p className="text-[11px] text-textSecondary mt-1">Desktop tools for faster store management.</p>
              </div>
              <div className="bg-primary/5 text-primary rounded-2xl px-3 py-1 text-[10px] font-black uppercase">Pro</div>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Creation
              </button>
              <button
                onClick={() => navigate('/seller-settings')}
                className="w-full py-3 bg-white border border-warmborder rounded-2xl text-[10px] font-black uppercase tracking-widest text-textPrimary hover:bg-surface transition"
              >
                Store Settings
              </button>
              <button
                onClick={handleToggleOpen}
                className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition ${isOpen ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'}`}
              >
                {isOpen ? 'Take Store Offline' : 'Open Store Now'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
            <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary">Performance snapshot</p>
            <div className="grid gap-3">
              <div className="rounded-3xl bg-surface p-4">
                <p className="text-[9px] uppercase tracking-wider text-textSecondary">Active items</p>
                <p className="text-2xl font-black text-textPrimary">{activeProductsCount}</p>
              </div>
              <div className="rounded-3xl bg-surface p-4">
                <p className="text-[9px] uppercase tracking-wider text-textSecondary">Hidden creations</p>
                <p className="text-2xl font-black text-textPrimary">{inactiveProductsCount}</p>
              </div>
              <div className="rounded-3xl bg-surface p-4">
                <p className="text-[9px] uppercase tracking-wider text-textSecondary">Low-stock alerts</p>
                <p className="text-2xl font-black text-textPrimary">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
            <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary">Category focus</p>
            {topCategories.length ? (
              <div className="flex flex-wrap gap-2">
                {topCategories.map((category) => (
                  <span key={category} className="rounded-full bg-primary/10 text-primary px-3 py-2 text-[10px] font-black uppercase tracking-wider">
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-textSecondary">Add more items to reveal your top selling categories.</p>
            )}
          </div>

          <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary">Today's orders</p>
              <span className="text-[10px] text-textSecondary">{sellerOrders.length} total</span>
            </div>
            <div className="space-y-3">
              {sellerOrders.slice(0, 3).map((order) => (
                <div key={order._id} className="rounded-3xl border border-warmborder p-3 bg-surface">
                  <p className="text-[9px] font-black uppercase tracking-wider text-textSecondary">#{order._id?.slice(-6)}</p>
                  <p className="text-xs font-bold text-textPrimary mt-1 truncate">{order.buyerName || 'Guest buyer'}</p>
                  <span className={`inline-flex px-2 py-0.5 mt-2 text-[9px] font-black uppercase tracking-wider rounded-full ${getOrderStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
              {!sellerOrders.length && (
                <p className="text-xs text-textSecondary">No recent orders yet. Keep creating to receive customer requests.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl border border-warmborder overflow-y-auto max-h-[85vh] space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-black text-base text-textPrimary">Edit Product Creation</h3>
                <button 
                  onClick={() => setEditingProduct(null)} 
                  className="p-1 rounded-full hover:bg-surface border border-warmborder text-textSecondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Product Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Price (₹) *</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      className="input-base"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Sale Unit *</label>
                    <select
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="input-base bg-background"
                    >
                      <option value="piece">Piece</option>
                      <option value="portion">Portion</option>
                      <option value="dozen">Dozen</option>
                      <option value="kg">KG</option>
                      <option value="liter">Liter</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Stock quantity</label>
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value, 10))}
                      min="0"
                      className="input-base"
                      disabled={editIsUnlimited}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={editPreparationTime}
                      onChange={(e) => setEditPreparationTime(parseInt(e.target.value))}
                      min="0"
                      className="input-base"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="editIsUnlimited"
                    checked={editIsUnlimited}
                    onChange={(e) => setEditIsUnlimited(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="editIsUnlimited" className="text-xs font-bold text-textPrimary cursor-pointer">
                    Unlimited Stock (Infinite availability)
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="input-base bg-background"
                  >
                    <option value="bakery">Bakery</option>
                    <option value="snacks">Snacks</option>
                    <option value="food">Main Food Course</option>
                    <option value="beverages">Beverages</option>
                    <option value="crafts">Cottage Crafts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Product Image</label>
                  <div className="relative border border-dashed border-warmborder hover:border-primary rounded-2xl p-4 transition-colors bg-background flex flex-col items-center justify-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setEditImageFile(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditImagePreview(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <ImageIcon className="w-6 h-6 text-textSecondary/50 mb-1" />
                    <span className="text-[10px] text-textSecondary font-bold">
                      {editImageFile ? editImageFile.name : 'Choose different photo'}
                    </span>
                  </div>
                </div>

                {editImagePreview && (
                  <div className="border border-warmborder rounded-2xl overflow-hidden mt-3 shadow-inner">
                    <img src={editImagePreview} alt="Preview" className="w-full h-32 object-cover" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Tell neighbors what makes this unique..."
                    className="input-base resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Ingredients</label>
                  <input
                    type="text"
                    value={editIngredients}
                    onChange={(e) => setEditIngredients(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdatingProduct}
                    className="btn-primary flex-1 py-2.5"
                  >
                    {isUpdatingProduct ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="btn-ghost flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
