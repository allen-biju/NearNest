import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { useGeolocator } from '../hooks/useGeolocator';
import {
  ArrowLeft, MapPin, Star, Clock, Truck, ShoppingBag, Share2, Sparkles
} from 'lucide-react';

interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  category: string;
  price: number;
  discountedPrice?: number;
  unit: string;
  preparationTimeMinutes: number;
  allergens: string[];
  dietaryTags: string[];
  stock: number;
  isUnlimitedStock: boolean;
}

interface ISeller {
  _id: string;
  businessName: string;
  slug: string;
  description: string;
  category: string;
  subCategories: string[];
  logo: string;
  banner: string;
  isOpen: boolean;
  address: { addressLine: string; city: string; state: string; pincode: string };
  location: { coordinates: [number, number] };
  rating: { average: number; count: number };
  deliveryRadiusKm: number;
  baseDeliveryFee: number;
  freeDeliveryAbove?: number;
  operatingHours?: { day: string; open: string; close: string; isClosed: boolean }[];
}

export const SellerStorefront: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const { coords } = useGeolocator();

  const [seller, setSeller] = useState<ISeller | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/sellers/${slug}`);
        const data = await res.json();
        if (data.success) {
          setSeller(data.data.seller);
          setProducts(data.data.products || []);
        }
      } catch (err) {
        console.error('Storefront load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // Straight-line distance helper
  const distKm = (() => {
    if (!seller) return null;
    const [sLng, sLat] = seller.location.coordinates;
    const R = 6371;
    const dLat = (sLat - coords.lat) * Math.PI / 180;
    const dLon = (sLng - coords.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(coords.lat * Math.PI / 180) * Math.cos(sLat * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  })();

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  const uniqueCategories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse p-4 space-y-4 pb-24">
        <div className="h-40 bg-warmborder rounded-2xl" />
        <div className="h-6 bg-warmborder rounded w-2/3" />
        <div className="h-4 bg-warmborder rounded w-1/2" />
        {[1, 2, 3].map(n => (
          <div key={n} className="h-24 bg-warmborder rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-4 pb-24">
        <div className="text-4xl">🔍</div>
        <h3 className="font-serif font-black text-lg text-textPrimary">Kitchen Not Found</h3>
        <p className="text-xs text-textSecondary">This seller profile may have been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary max-w-xs mx-auto">
          Back to Discover
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-textPrimary text-white text-xs px-4 py-2.5 rounded-full shadow-lifted flex items-center gap-2 font-semibold animate-in">
          <ShoppingBag className="w-4 h-4 text-accent" />
          {toast}
        </div>
      )}

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface">
          <ArrowLeft className="w-4 h-4 text-textPrimary" />
        </button>
        <span className="font-bold text-xs uppercase tracking-wider text-textSecondary truncate max-w-[60%]">
          {seller.businessName}
        </span>
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('🔗 Link copied!'); }}
          className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface"
        >
          <Share2 className="w-4 h-4 text-textPrimary" />
        </button>
      </div>

      {/* HERO BANNER */}
      <div className="relative h-44 bg-background overflow-hidden">
        <img src={seller.banner} alt={seller.businessName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Open / Closed badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-black uppercase rounded-full shadow-sm ${
          seller.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {seller.isOpen ? '● Open Now' : '● Closed'}
        </span>

        {/* Distance badge */}
        {distKm !== null && (
          <span className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-mono font-black text-secondary rounded shadow-sm">
            📍 {distKm.toFixed(1)} km away
          </span>
        )}
      </div>

      {/* SELLER PROFILE CARD */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-10 space-y-4">
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-premium flex gap-4">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-background">
            <img src={seller.logo} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-serif font-black text-base text-textPrimary leading-snug">
                {seller.businessName}
              </h1>
              {seller.rating.average > 0 && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-black text-amber-600">{seller.rating.average}</span>
                  <span className="text-[10px] text-textSecondary">({seller.rating.count})</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-textSecondary leading-relaxed mt-1 line-clamp-2">
              {seller.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center gap-1 text-[10px] text-textSecondary font-medium">
                <MapPin className="w-3 h-3 text-primary" />
                {seller.address.city}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-textSecondary font-medium">
                <Truck className="w-3 h-3 text-secondary" />
                Delivery up to {seller.deliveryRadiusKm} km
              </span>
              {seller.freeDeliveryAbove && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                  <Sparkles className="w-3 h-3" />
                  Free delivery above ₹{seller.freeDeliveryAbove}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SUBCATEGORY / TAG CHIPS */}
        {seller.subCategories && seller.subCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            {seller.subCategories.map(sub => (
              <span key={sub} className="px-3 py-1 bg-surfaceAlt text-textSecondary text-[10px] font-bold rounded-full border border-warmborder shrink-0 uppercase tracking-wide">
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* PRODUCTS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-textPrimary">
              {t('freshBakesTitle')}
            </h2>
            <span className="text-[10px] text-textSecondary">{filteredProducts.length} items</span>
          </div>

          {/* Category filter pills */}
          {uniqueCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveCategory('')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 border transition-all ${
                  !activeCategory ? 'bg-primary text-white border-primary' : 'bg-white text-textSecondary border-warmborder'
                }`}
              >
                All
              </button>
              {uniqueCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold shrink-0 border transition-all capitalize ${
                    activeCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-textSecondary border-warmborder'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product cards */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-warmborder rounded-2xl p-8 text-center space-y-2">
              <p className="text-2xl">🛒</p>
              <p className="text-xs text-textSecondary">No products listed yet in this kitchen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(product => {
                const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
                const finalPrice = hasDiscount ? product.discountedPrice! : product.price;
                const inStock = product.isUnlimitedStock || product.stock > 0;

                return (
                  <div key={product._id} className="bg-white border border-warmborder rounded-2xl p-3 flex gap-3 shadow-sm hover:border-accent transition-all group">
                    {/* Image */}
                    <Link to={`/product/${product._id}`} className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-background relative">
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] text-white font-black uppercase bg-black/60 px-1.5 py-0.5 rounded">Sold Out</span>
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link to={`/product/${product._id}`} className="font-serif font-black text-sm text-textPrimary hover:text-primary transition-colors line-clamp-1">
                          {product.title}
                        </Link>
                        <p className="text-[11px] text-textSecondary line-clamp-2 mt-0.5">{product.description}</p>

                        {/* Tags */}
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {product.dietaryTags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {tag}
                            </span>
                          ))}
                          <span className="flex items-center gap-0.5 text-[9px] text-textSecondary">
                            <Clock className="w-2.5 h-2.5" />{product.preparationTimeMinutes}m
                          </span>
                        </div>
                      </div>

                      {/* Price + Add */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-dotted border-warmborder">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-textPrimary">₹{finalPrice}</span>
                          {hasDiscount && (
                            <span className="text-[10px] text-textSecondary line-through">₹{product.price}</span>
                          )}
                          <span className="text-[9px] text-textSecondary">/{product.unit}</span>
                        </div>

                        <button
                          disabled={!inStock}
                          onClick={() => {
                            addToCart({
                              productId: product._id,
                              title: product.title,
                              image: product.images[0],
                              price: finalPrice,
                              sellerId: seller._id,
                              sellerName: seller.businessName,
                              unit: product.unit,
                            });
                            showToast(`🛒 ${product.title} added!`);
                          }}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide flex items-center gap-1 transition-colors ${
                            inStock
                              ? 'bg-primary hover:bg-primary-dark text-white shadow-sm'
                              : 'bg-warmborder text-textMuted cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          {inStock ? t('addToCart') : 'Sold Out'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
