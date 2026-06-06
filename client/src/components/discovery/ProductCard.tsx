import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  discountedPrice?: number;
  rating: {
    average: number;
    count: number;
  };
  distance: string;
  preparationTime?: number;
  seller: {
    name: string;
    slug: string;
  };
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  image,
  price,
  discountedPrice,
  rating,
  distance,
  preparationTime,
  seller,
  isWishlisted = false,
  onWishlistToggle,
  onAddToCart
}) => {
  const discountPercent = discountedPrice
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  return (
    <Link to={`/product/${id}`}>
      <motion.div
        whileHover={{ y: -6, borderColor: 'rgba(232, 93, 38, 0.3)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-[24px] overflow-hidden border border-warmborder/80 shadow-[0_4px_20px_rgba(26,18,8,0.03)] hover:shadow-[0_12px_30px_rgba(26,18,8,0.08)] flex flex-col h-full transition-all duration-300"
      >
        {/* Image Section */}
        <div className="relative overflow-hidden aspect-square bg-surfaceAlt/30">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />

          {/* Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle?.();
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-white shadow-[0_2px_8px_rgba(26,18,8,0.08)] transition-all z-10"
            title="Add to saved items"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-primary text-primary' : 'text-textSecondary/60 hover:text-primary'
              }`}
            />
          </motion.button>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-wider shadow-sm z-10">
              Save {discountPercent}%
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4 gap-2.5">
          {/* Seller & Rating */}
          <div className="flex items-center justify-between text-[10px] text-textSecondary font-bold uppercase tracking-wider">
            <span>🏡 {seller.name || 'Local Seller'}</span>
            <div className="flex items-center gap-0.5 bg-accent/10 text-primary px-1.5 py-0.5 rounded-lg">
              <Star className="w-2.5 h-2.5 fill-primary text-primary" />
              <span className="font-extrabold text-[9px]">{rating.average}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif font-black text-textPrimary line-clamp-2 text-xs leading-snug">
            {title}
          </h3>

          {/* Distance & Time */}
          <div className="flex items-center gap-3 text-[10px] text-textSecondary/80 font-semibold">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary/70" />
              {distance}
            </div>
            {preparationTime && (
              <div className="flex items-center gap-1 border-l border-warmborder pl-3">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
                {preparationTime} min
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-warmborder/60">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-primary text-sm font-mono">
                ₹{discountedPrice || price}
              </span>
              {discountedPrice && (
                <span className="text-[10px] line-through text-textMuted font-mono">
                  ₹{price}
                </span>
              )}
              <span className="text-[9px] text-textSecondary font-medium">/ unit</span>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:bg-primary-dark transition-colors shadow-sm"
            >
              Add
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
