import React from 'react';
import { useCart, ICartItem } from '../context/CartContext';
import { useTranslation } from '../context/TranslationContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, getItemsCount } = useCart();
  const { t } = useTranslation();
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-40"
      >
        {/* HEADER BAR */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/85 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')} 
            className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
            Your Cart
          </h2>
          <div className="w-8 h-8" />
        </div>

        <div className="max-w-lg mx-auto px-4 mt-16 text-center space-y-5">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary text-3xl animate-pulse border border-primary/10">
            🛒
          </div>
          <div>
            <h3 className="font-serif font-black text-xl text-textPrimary">Your Basket is Empty</h3>
            <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed mt-1.5">
              Support neighborhood home-bakers, chefs, and crafters. Fill your cart with authentic creations!
            </p>
          </div>
          <Link 
            to="/" 
            className="inline-block px-7 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-premium transition-all"
          >
            Explore Creations
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-40 animate-in"
    >
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/85 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
          Shopping Basket
        </h2>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if(window.confirm('Clear all items from your basket?')) {
              clearCart();
            }
          }}
          className="px-2.5 py-1.5 text-[10px] text-rose-600 bg-rose-50 hover:bg-rose-100 font-extrabold rounded-xl transition"
        >
          Clear All
        </motion.button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        
        {/* HYPERLOCAL SPLIT NOTICE */}
        <div className="p-4 bg-secondary/5 border border-secondary/15 rounded-2xl flex gap-3 shadow-[inset_0_4px_12px_rgba(45,106,79,0.01)]">
          <Sparkles className="w-4.5 h-4.5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-secondary">Hyperlocal Marketplace Split</p>
            <p className="text-[11px] text-textSecondary/90 font-medium leading-relaxed mt-0.5">
              Creations are grouped by creator coordinates. At checkout, delivery slots and fees are auto-calculated separately for each kitchen center.
            </p>
          </div>
        </div>

        {/* GROUPED SELLERS ITEMS */}
        <div className="space-y-4">
          {Object.keys(groupedItems).map((sellerId) => {
            const group = groupedItems[sellerId];
            const sellerSubtotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return (
              <div key={sellerId} className="bg-white border border-warmborder rounded-[24px] overflow-hidden shadow-sm">
                
                {/* Seller Header */}
                <div className="px-4 py-3 bg-surfaceAlt/20 border-b border-warmborder/80 flex items-center justify-between text-xs font-black">
                  <span className="text-textPrimary flex items-center gap-1.5">
                    🏡 {group.name}
                  </span>
                  <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-lg font-mono">
                    Sub: ₹{sellerSubtotal}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-warmborder">
                  {group.items.map((item) => (
                    <div key={item.productId} className="p-4 flex gap-4 group transition-colors hover:bg-surfaceAlt/5">
                      
                      {/* Item Thumbnail */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-background border border-warmborder/80 shadow-sm">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-black text-xs text-textPrimary truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-textSecondary font-bold mt-0.5">
                            ₹{item.price} / {item.unit}
                          </p>
                        </div>

                        {/* Modifier controls */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center bg-background border border-warmborder/80 rounded-xl p-0.5 shrink-0">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1.5 hover:bg-white text-textPrimary rounded-lg transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="px-3 font-mono text-xs font-black text-textPrimary">
                              {item.quantity}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1.5 hover:bg-white text-textPrimary rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>

                          {/* Price Subtotal & delete */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-textPrimary font-mono">
                              ₹{item.price * item.quantity}
                            </span>
                            <motion.button 
                              whileTap={{ scale: 0.85 }}
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ORDER BREAKDOWN ESTIMATION SUMMARY */}
        <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-textSecondary pb-2.5 border-b border-dotted border-warmborder">
            Creations Summary
          </h3>
          <div className="flex justify-between text-xs">
            <span className="text-textSecondary font-semibold">Creations Subtotal ({getItemsCount()} items)</span>
            <span className="font-extrabold text-textPrimary font-mono text-sm">₹{getTotal()}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-textSecondary font-semibold">Delivery & platform safety fees</span>
            <span className="text-secondary font-black text-[9px] uppercase tracking-wider bg-secondary/10 px-2 py-0.5 rounded-md font-mono">
              Calculated at checkout
            </span>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM CHECKOUT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-warmborder/80 py-3.5 px-4 shadow-[0_-8px_30px_rgba(26,18,8,0.06)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] text-textSecondary uppercase tracking-wider font-black">Estimated Payable</p>
            <p className="text-xl font-black text-primary font-mono">₹{getTotal()}</p>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <span>{t('checkoutBtn')}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
