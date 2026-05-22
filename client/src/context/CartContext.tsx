import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ICartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  unit: string;
}

interface CartContextType {
  cart: ICartItem[];
  addToCart: (item: Omit<ICartItem, 'quantity'>, qty?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getSellerSubtotal: (sellerId: string) => number;
  getItemsCount: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<ICartItem[]>(() => {
    const saved = localStorage.getItem('nn_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nn_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<ICartItem, 'quantity'>, qty: number = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === newItem.productId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += qty;
        return updated;
      } else {
        return [...prev, { ...newItem, quantity: qty }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSellerSubtotal = (sellerId: string): number => {
    return cart
      .filter((item) => item.sellerId === sellerId)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getItemsCount = (): number => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getSellerSubtotal,
      getItemsCount,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
