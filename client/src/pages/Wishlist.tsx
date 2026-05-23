import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/discovery/ProductCard';
import { useNavigate } from 'react-router-dom';

export const Wishlist: React.FC = () => {
  const { items, toggle, remove } = useWishlist();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h3 className="font-bold text-lg">Your Wishlist is empty</h3>
        <p className="text-sm text-textSecondary mt-2">Save items you like by tapping the heart.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">Discover</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="font-bold text-xl mb-4">Saved Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.productId}>
            <ProductCard
              id={it.productId}
              title={it.title || 'Saved item'}
              image={it.image || '/placeholder.png'}
              price={it.price || 0}
              rating={{ average: 0, count: 0 }}
              distance={'-'}
              seller={{ name: '', slug: '' }}
              isWishlisted={true}
              onWishlistToggle={() => toggle(it)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
