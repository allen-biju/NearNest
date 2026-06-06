import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface IWishlistItem {
  productId: string;
  // store minimal metadata so wishlist page can render without extra fetches
  title?: string;
  image?: string;
  price?: number;
}

interface WishlistContextType {
  items: IWishlistItem[];
  toggle: (item: IWishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<IWishlistItem[]>(() => {
    try {
      const raw = localStorage.getItem('nn_wishlist');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nn_wishlist', JSON.stringify(items));
    } catch {}
  }, [items]);

  const toggle = (item: IWishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.productId === item.productId);
      if (exists) return prev.filter((p) => p.productId !== item.productId);
      return [...prev, item];
    });
  };

  const remove = (productId: string) => setItems((prev) => prev.filter((p) => p.productId !== productId));

  const clear = () => setItems([]);

  const isWishlisted = (productId: string) => items.some((p) => p.productId === productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, remove, clear, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
