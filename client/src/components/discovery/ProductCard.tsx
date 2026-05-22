import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Clock } from 'lucide-react';

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
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-warmBorder aspect-square">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle?.();
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : 'text-textSecondary'}`}
            />
          </button>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary text-white text-xs font-bold">
              Save {discountPercent}%
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-3 gap-2">
          {/* Title */}
          <h3 className="font-semibold text-textPrimary line-clamp-2 text-sm">
            {title}
          </h3>

          {/* Seller & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-textSecondary">{seller.name}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-accent text-accent" />
              <span className="font-semibold text-textPrimary">
                {rating.average}
              </span>
              <span className="text-textSecondary">({rating.count})</span>
            </div>
          </div>

          {/* Distance & Time */}
          <div className="flex items-center gap-3 text-xs text-textSecondary">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {distance}
            </div>
            {preparationTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {preparationTime} min
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-warmborder">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-primary text-base">
                ₹{discountedPrice || price}
              </span>
              {discountedPrice && (
                <span className="text-xs line-through text-textSecondary">
                  ₹{price}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.();
              }}
              className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primaryDark transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
