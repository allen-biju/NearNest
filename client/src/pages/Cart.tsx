import React from 'react';
import { useCart, ICartItem } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, getItemsCount } = useCart();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Group cart items by seller
  const groupedItems = cart.reduce((groups: Record<string, { name: string; items: ICartItem[] }>, item) => {
    if (!groups[item.sellerId]) {
      groups[item.sellerId] = { name: item.sellerName, items: [] };
    }
    groups[item.sellerId].items.push(item);
    return groups;
  }, {});

  if (cart.length === 0) {
    return (
      <div className="pb-40">
        {/* HEADER BAR */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-bold text-xs uppercase tracking-wider text-textSecondary">
            Your Cart
          </h2>
          <div className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto px-4 mt-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary text-2xl animate-pulse">
            🛒
          </div>
          <h3 className="font-serif font-black text-lg text-textPrimary">Your Cart is Empty</h3>
          <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed">
            Fill your home cart with delicious homemade cakes, bakes, meals, and crafts from creative neighbors around Calicut.
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-premium"
          >
            Start Discovering
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-xs uppercase tracking-wider text-textSecondary">
          Shopping Basket
        </h2>
        <button 
          onClick={() => {
            if(window.confirm('Clear all items from your basket?')) {
              clearCart();
            }
          }}
          className="p-1 text-xs text-red-600 font-bold hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-5">
        
        {/* HYPERLOCAL SPLIT NOTICE */}
        <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-xl flex gap-2.5">
          <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p className="text-[11px] text-secondary font-medium leading-relaxed">
            💡 <strong>Hyperlocal note:</strong> You can add creations from different neighbors! At checkout, orders will be split per seller with specific coordinates and delivery rates.
          </p>
        </div>

        {/* GROUPED SELLERS ITEMS */}
        {Object.keys(groupedItems).map((sellerId) => {
          const group = groupedItems[sellerId];
          const sellerSubtotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return (
            <div key={sellerId} className="bg-white border border-warmborder rounded-2xl overflow-hidden shadow-sm">
              
              {/* Seller Header */}
              <div className="px-4 py-3 bg-surface border-b border-warmborder flex items-center justify-between">
                <span className="text-xs font-black text-textPrimary flex items-center gap-1">
                  🏡 {group.name}
                </span>
                <span className="text-[10px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-full">
                  Subtotal: ₹{sellerSubtotal}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-warmborder">
                {group.items.map((item) => (
                  <div key={item.productId} className="p-4 flex gap-3 group">
                    
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-background border border-warmborder">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif font-black text-xs text-textPrimary truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-textSecondary font-medium">
                          ₹{item.price} / {item.unit}
                        </p>
                      </div>

                      {/* Modifier controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center bg-background border border-warmborder rounded-lg p-0.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-white text-textPrimary rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-bold text-textPrimary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-white text-textPrimary rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price Subtotal & delete */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-textPrimary font-mono">
                            ₹{item.price * item.quantity}
                          </span>
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="p-1 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* ORDER BREAKDOWN ESTIMATION SUMMARY */}
        <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-textSecondary">
            Order Estimation
          </h3>
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary">Total creations ({getItemsCount()} items)</span>
            <span className="font-bold text-textPrimary font-mono">₹{getTotal()}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-dotted border-warmborder pt-2.5">
            <span className="text-textSecondary">Delivery & Platform Fees</span>
            <span className="text-secondary font-bold text-[10px] uppercase">Calculated at Checkout</span>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM CHECKOUT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warmborder py-3.5 px-4 shadow-lifted">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold">Total Amount</p>
            <p className="text-lg font-black text-primary font-mono">₹{getTotal()}</p>
          </div>
          
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t('checkoutBtn')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
