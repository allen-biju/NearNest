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
  Star, 
  MessageSquare,
  Share2,
  Heart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { t } = useTranslation();

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="pb-28"
    >
      {/* Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 z-[9999] bg-textPrimary text-white text-xs px-4.5 py-3 rounded-full shadow-lifted flex items-center gap-2 font-extrabold"
          >
            <ShoppingBag className="w-4 h-4 text-accent" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/80 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
          Homemade Details
        </h2>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (product) toggle({ productId: product._id, title: product.title, image: product.images[0], price: product.discountedPrice || product.price });
            }}
            className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 transition-colors ${product && isWishlisted(product._id) ? 'fill-primary text-primary' : ''}`} />
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              triggerToast('🔗 Product link copied to clipboard!');
            }}
            className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* IMAGE HERO */}
        <div className="relative rounded-[32px] overflow-hidden border border-warmborder/80 shadow-[0_6px_24px_rgba(26,18,8,0.04)] bg-white aspect-[4/3] sm:aspect-[16/10]">
          <img 
            src={activeImage} 
            alt={product.title} 
            className="w-full h-full object-cover transition-all duration-500"
          />

          {/* Multiple Image Thumbnails if available */}
          {product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/25 p-2 rounded-full backdrop-blur-md border border-white/10">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeImage === img ? 'bg-primary scale-125' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* TITLE & INFO */}
        <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 bg-secondary/15 text-secondary text-[9px] font-black uppercase tracking-wider rounded-xl border border-secondary/10">
              {product.category}
            </span>

            {/* Preparation time badge */}
            <div className="flex items-center gap-1 text-[10px] text-textSecondary font-black uppercase tracking-wider">
              <Clock className="w-4 h-4 text-primary" />
              <span>Ready in {product.preparationTimeMinutes} mins</span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-black text-2xl text-textPrimary leading-snug">
              {product.title}
            </h1>
            
            {/* Dietary Badges */}
            {product.dietaryTags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {product.dietaryTags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100/60 flex items-center gap-1 uppercase tracking-wide shadow-sm"
                  >
                    <Leaf className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Unit Info */}
          <div className="flex items-baseline gap-2 pt-3 border-t border-dotted border-warmborder">
            <span className="text-3xl font-black text-primary font-mono">
              ₹{finalPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-textMuted line-through font-medium font-mono">
                ₹{product.price}
              </span>
            )}
            <span className="text-xs text-textSecondary font-extrabold uppercase tracking-wide">
              / {product.unit}
            </span>
          </div>

          <p className="text-xs text-textSecondary leading-relaxed pt-1">
            {product.description}
          </p>
        </div>

        {/* INGREDIENTS & ALLERGENS ALERT */}
        <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
          <h3 className="font-serif font-black text-sm text-textPrimary">
            {t('ingredientsLabel')}
          </h3>
          <p className="text-xs text-textSecondary leading-relaxed font-medium">
            {product.ingredients}
          </p>

          {product.allergens.length > 0 && (
            <div className="mt-4 p-4 bg-rose-50/50 border border-rose-100/60 rounded-[20px] flex gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">
                  {t('allergenAlert')}
                </p>
                <p className="text-xs text-rose-700 font-medium mt-1 leading-normal">
                  Contains: {product.allergens.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SELLER STOREFRONT LINK */}
        <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-warmborder bg-surfaceAlt/20 shrink-0 shadow-sm">
              <img src={product.sellerId.logo} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[9px] text-textSecondary uppercase tracking-widest font-black">
                Homemade Creator
              </p>
              <h4 className="font-serif font-black text-xs text-textPrimary mt-0.5">
                {product.sellerId.businessName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-textSecondary font-medium">
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
            className="px-4 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-colors shrink-0 shadow-sm text-center"
          >
            {t('viewStore')}
          </Link>
        </div>

        {/* REVIEWS GRID LIST */}
        <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-4">
          <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Community Reviews</span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-textSecondary italic text-center py-2">
              No reviews yet for this homemade item. Be the first to order and review!
            </p>
          ) : (
            <div className="space-y-4 divide-y divide-warmborder">
              {reviews.map((rev) => (
                <div key={rev._id} className="space-y-2 pt-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-textPrimary">{rev.buyerId?.name || 'Anonymous User'}</span>
                    <span className="text-[9px] text-textMuted font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.productRating ? 'fill-amber-400 text-amber-400' : 'text-warmborder'}`} 
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-warmborder/80 py-3.5 px-4 shadow-[0_-8px_30px_rgba(26,18,8,0.06)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center bg-background border border-warmborder rounded-2xl p-1 shrink-0">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl font-black text-textPrimary hover:bg-white text-base transition-colors flex items-center justify-center shadow-sm"
            >
              -
            </motion.button>
            <span className="px-3 font-mono font-black text-xs text-textPrimary">
              {quantity}
            </span>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl font-black text-textPrimary hover:bg-white text-base transition-colors flex items-center justify-center shadow-sm"
            >
              +
            </motion.button>
          </div>

          {/* Add to cart action */}
          <motion.button
            whileTap={{ scale: 0.98 }}
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
            className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 animate-pulse" />
            <span>{t('addToCart')} (₹{finalPrice * quantity})</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
