import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  ShieldAlert, 
  Leaf, 
  Home as HomeIcon, 
  Star, 
  MessageSquare,
  ThumbsUp,
  Share2,
  Heart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface IReview {
  _id: string;
  buyerId: { name: string };
  productRating: number;
  sellerRating: number;
  comment: string;
  images: string[];
  helpfulCount: number;
  createdAt: string;
}

interface IProductDetail {
  _id: string;
  title: string;
  description: string;
  ingredients: string;
  allergens: string[];
  images: string[];
  category: string;
  tags: string[];
  dietaryTags: string[];
  price: number;
  discountedPrice?: number;
  unit: string;
  stock: number;
  isUnlimitedStock: boolean;
  preparationTimeMinutes: number;
  sellerId: {
    _id: string;
    businessName: string;
    description: string;
    logo: string;
    rating: { average: number; count: number };
    address: { addressLine: string; city: string };
  };
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, language } = useTranslation();

  const [product, setProduct] = useState<IProductDetail | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isWishlisted, toggle } = useWishlist();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          setActiveImage(data.data.images[0]);
          
          // Fetch reviews (mocked reviews or related reviews in database)
          // We can fetch from reviews endpoint or query product reviews
          const reviewRes = await fetch(`/api/v1/sellers/${data.data.sellerId.slug}`);
          const reviewData = await reviewRes.json();
          if (reviewData.success) {
            // Seeded review is in the DB
            // Let's filter for this product
            setReviews(reviewData.data.reviews || []);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-warmborder rounded" />
        <div className="h-[280px] w-full bg-warmborder rounded-2xl" />
        <div className="h-6 w-3/4 bg-warmborder rounded" />
        <div className="h-4 w-1/2 bg-warmborder rounded" />
        <div className="h-16 w-full bg-warmborder rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-4">
        <h3 className="font-serif font-black text-lg text-textPrimary">Product Not Found</h3>
        <p className="text-xs text-textSecondary">The homemade listing might have been removed by the creator.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg">
          Back to Discover
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const finalPrice = hasDiscount ? product.discountedPrice! : product.price;

  return (
    <div className="pb-24">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-textPrimary text-white text-xs px-4 py-2.5 rounded-full shadow-lifted flex items-center gap-2 font-semibold animate-bounce">
          <ShoppingBag className="w-4 h-4 text-accent" />
          {toastMessage}
        </div>
      )}

      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-xs uppercase tracking-wider text-textSecondary">
          Homemade Details
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (product) toggle({ productId: product._id, title: product.title, image: product.images[0], price: product.discountedPrice || product.price });
            }}
            className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${product && isWishlisted(product._id) ? 'fill-primary text-primary' : ''}`} />
          </button>

          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              triggerToast('🔗 Product link copied to clipboard!');
            }}
            className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-3 space-y-5">
        {/* IMAGE HERO SLIDER */}
        <div className="relative rounded-[24px] overflow-hidden border border-warmborder shadow-premium bg-white">
          <div className="h-[260px] w-full">
            <img 
              src={activeImage} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Multiple Image Thumbnails if available */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 bg-black/30 p-1.5 rounded-full backdrop-blur-sm">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeImage === img ? 'bg-primary scale-110' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* TITLE & INFO */}
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-wider rounded-full">
              {product.category}
            </span>

            {/* Preparation time badge */}
            <div className="flex items-center gap-1 text-[10px] text-textSecondary font-bold">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Ready in {product.preparationTimeMinutes} mins</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-serif font-black text-xl text-textPrimary leading-snug">
              {product.title}
            </h1>
            
            {/* Dietary Badges */}
            {product.dietaryTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {product.dietaryTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5 uppercase"
                  >
                    <Leaf className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Unit Info */}
          <div className="flex items-baseline gap-2 pt-2 border-t border-dotted border-warmborder">
            <span className="text-2xl font-black text-primary">
              ₹{finalPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-textSecondary line-through font-medium">
                ₹{product.price}
              </span>
            )}
            <span className="text-xs text-textSecondary font-medium">
              / {product.unit}
            </span>
          </div>

          <p className="text-xs text-textSecondary leading-relaxed pt-1">
            {product.description}
          </p>
        </div>

        {/* INGREDIENTS & ALLERGENS ALERT */}
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-sm text-textPrimary">
            {t('ingredientsLabel')}
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed">
            {product.ingredients}
          </p>

          {product.allergens.length > 0 && (
            <div className="mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl flex gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-red-800 uppercase tracking-wide">
                  {t('allergenAlert')}
                </p>
                <p className="text-xs text-red-700/90 font-medium mt-0.5">
                  Contains: {product.allergens.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SELLER STOREFRONT LINK */}
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-warmborder bg-background shrink-0">
              <img src={product.sellerId.logo} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold">
                Homemade Creator
              </p>
              <h4 className="font-serif font-black text-sm text-textPrimary">
                {product.sellerId.businessName}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-textSecondary truncate">
                  📍 {product.sellerId.address.city}
                </span>
                {product.sellerId.rating.average > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                    ★ {product.sellerId.rating.average}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to={`/seller/${product.sellerId._id || 'slug'}`}
            className="px-3.5 py-2 bg-secondary hover:bg-secondary-dark text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-colors shrink-0 shadow-sm"
          >
            {t('viewStore')}
          </Link>
        </div>

        {/* REVIEWS GRID LIST */}
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-sm text-textPrimary flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Community Reviews</span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-textSecondary italic text-center py-2">
              No reviews yet for this homemade item. Be the first to order and review!
            </p>
          ) : (
            <div className="space-y-4 division-y division-warmborder">
              {reviews.map((rev) => (
                <div key={rev._id} className="space-y-2 pt-2 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textPrimary">{rev.buyerId?.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-textSecondary font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < rev.productRating ? 'fill-amber-400' : 'text-warmborder'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-xs text-textSecondary leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER QUANTITY MODIFIER & ADD TO CART BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warmborder py-3 px-4 shadow-lifted">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center bg-background border border-warmborder rounded-xl p-1 shrink-0">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg font-black text-textPrimary hover:bg-white text-base transition-colors"
            >
              -
            </button>
            <span className="px-3 font-mono font-bold text-sm text-textPrimary">
              {quantity}
            </span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg font-black text-textPrimary hover:bg-white text-base transition-colors"
            >
              +
            </button>
          </div>

          {/* Add to cart action */}
          <button
            onClick={() => {
              addToCart({
                productId: product._id,
                title: product.title,
                image: product.images[0],
                price: finalPrice,
                sellerId: product.sellerId._id,
                sellerName: product.sellerId.businessName,
                unit: product.unit
              }, quantity);
              triggerToast(`🛒 Added ${quantity} item(s) to Cart!`);
            }}
            className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('addToCart')} (₹{finalPrice * quantity})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
