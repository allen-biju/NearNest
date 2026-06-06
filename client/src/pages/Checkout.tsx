import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useGeolocator } from '../hooks/useGeolocator';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Wallet, 
  CreditCard, 
  ShoppingBag,
  CheckCircle,
  Truck,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Distance calculation helper inside React
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const Checkout: React.FC = () => {
  const { user, token } = useAuth();
  if (!user) return null;
  const { cart, getTotal, clearCart } = useCart();
  const { coords } = useGeolocator();
  const navigate = useNavigate();

  // Checkout configurations
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [isAddingCustomAddress, setIsAddingCustomAddress] = useState<boolean>(false);
  const [customAddressLine, setCustomAddressLine] = useState<string>('');
  const [customPincode, setCustomPincode] = useState<string>('673001');
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'COD'>('Razorpay');
  const [useWallet, setUseWallet] = useState<boolean>(false);

  // Simulated Razorpay Overlay
  const [showRazorpaySandbox, setShowRazorpaySandbox] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');
  const [selectedUpi, setSelectedUpi] = useState<string>('gpay');

  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [sellerRates, setSellerRates] = useState<Record<string, { fee: number; distance: number }>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Fetch or calculate delivery fee breakdown
  useEffect(() => {
    const calculateDeliveryFees = async () => {
      // Get current coordinates of selected address
      let currentCoords = [coords.lng, coords.lat];
      if (user && user.addresses && user.addresses[selectedAddressIndex]) {
        currentCoords = user.addresses[selectedAddressIndex].location.coordinates;
      }

      const rates: Record<string, { fee: number; distance: number }> = {};

      for (const item of cart) {
        if (rates[item.sellerId]) continue;
        try {
          // Fetch seller details for actual base fee and per-km rate
          const res = await fetch(`/api/v1/sellers/${item.sellerId === 'calicut-crusts-crumbs' ? 'calicut-crusts-crumbs' : 'malabar-spice-kitchen'}`);
          const data = await res.json();
          if (data.success) {
            const seller = data.data.seller;
            const sCoords = seller.location.coordinates;
            const dist = calculateDistance(currentCoords[1], currentCoords[0], sCoords[1], sCoords[0]);
            
            let fee = 0;
            if (deliveryMode === 'delivery') {
              const base = seller.baseDeliveryFee || 20;
              const perKm = seller.perKmRate || 5;
              fee = base + Math.round(dist * perKm);
              fee = Math.min(fee, seller.maxDeliveryFee || 80);
              if (seller.freeDeliveryAbove && getTotal() >= seller.freeDeliveryAbove) {
                fee = 0;
              }
            }
            rates[item.sellerId] = { fee, distance: dist };
          } else {
            // Fallback estimation
            rates[item.sellerId] = { fee: deliveryMode === 'delivery' ? 25 : 0, distance: 1.5 };
          }
        } catch (err) {
          rates[item.sellerId] = { fee: deliveryMode === 'delivery' ? 25 : 0, distance: 1.5 };
        }
      }
      setSellerRates(rates);
    };

    calculateDeliveryFees();
  }, [cart, user, selectedAddressIndex, deliveryMode, coords]);

  // Removed local auth submit handler since login is now separate.

  const handlePlaceOrderSubmit = async () => {
    try {
      let deliveryAddressObj = {
        addressLine: coords.label,
        city: 'Kozhikode',
        state: 'Kerala',
        pincode: '673001',
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      };

      if (user && user.addresses && user.addresses[selectedAddressIndex]) {
        const addr = user.addresses[selectedAddressIndex];
        deliveryAddressObj = {
          addressLine: addr.addressLine,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          location: {
            type: 'Point',
            coordinates: addr.location.coordinates
          }
        };
      } else if (isAddingCustomAddress && customAddressLine) {
        deliveryAddressObj = {
          addressLine: customAddressLine,
          city: 'Kozhikode',
          state: 'Kerala',
          pincode: customPincode,
          location: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          }
        };
      }

      const bodyData = {
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
        deliveryAddress: deliveryAddressObj,
        deliveryMode,
        deliverySlot: 'Everyday (ASAP)',
        paymentMethod,
        useWallet
      };

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        navigate('/orders');
      } else {
        alert(data.error?.message || 'Checkout failed');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Network error placing order');
    } finally {
      setPlacingOrder(false);
      setShowRazorpaySandbox(false);
    }
  };

  // Calculate pricing summaries
  const creationsTotal = getTotal();
  const deliveryTotal = Object.values(sellerRates).reduce((sum, r) => sum + r.fee, 0);
  const platformTotal = 5; // flat charge
  
  let walletDiscount = 0;
  if (useWallet && user) {
    const grossTotal = creationsTotal + deliveryTotal + platformTotal;
    walletDiscount = Math.min(user.walletBalance, grossTotal);
  }

  const finalCheckoutAmount = creationsTotal + deliveryTotal + platformTotal - walletDiscount;

  // Trigger simulated placement
  const triggerOrderPlacement = () => {
    if (paymentMethod === 'Razorpay') {
      setShowRazorpaySandbox(true);
      setPaymentStep('method');
    } else {
      if (window.confirm('Place this cash on delivery order?')) {
        handlePlaceOrderSubmit();
      }
    }
  };

  const handleSimulatePaymentSuccess = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        handlePlaceOrderSubmit();
      }, 1500);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-32"
    >
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/85 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/cart')} 
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">
          Secure Checkout
        </h2>
        <div className="w-8 h-8" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* SHOW CHECKOUT WIZARD FORM */}
      {/* ---------------------------------------------------- */}
      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
          
          {/* 1. DELIVERY MODE SELECTOR */}
          <div className="grid grid-cols-2 gap-2 bg-white border border-warmborder rounded-2xl p-1 shadow-sm">
            <button
              onClick={() => setDeliveryMode('delivery')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                deliveryMode === 'delivery' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Truck className="w-4 h-4" />
              Home Delivery
            </button>
            <button
              onClick={() => setDeliveryMode('pickup')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                deliveryMode === 'pickup' ? 'bg-primary text-white shadow-sm' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Building className="w-4 h-4" />
              Kitchen Pickup
            </button>
          </div>

          {/* 2. DELIVERY ADDRESS ADDRESSES SELECTOR */}
          <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{deliveryMode === 'delivery' ? 'Delivery Address' : 'Pickup Instructions'}</span>
            </h3>

            {deliveryMode === 'pickup' ? (
              <p className="text-xs text-textSecondary leading-relaxed italic">
                Store coordinates are provided after placement. You will pick up directly from each seller's kitchen coordinates centering on Kozhikode.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Saved addresses loop */}
                {user.addresses && user.addresses.length > 0 && !isAddingCustomAddress ? (
                  <div className="space-y-2">
                    {user.addresses.map((addr, idx) => {
                      const isActive = selectedAddressIndex === idx;
                      return (
                        <label 
                          key={idx}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isActive
                              ? 'bg-primary/5 border-primary text-textPrimary ring-2 ring-primary/10'
                              : 'hover:bg-background border-warmborder text-textSecondary'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="addressGroup" 
                            checked={selectedAddressIndex === idx}
                            onChange={() => setSelectedAddressIndex(idx)}
                            className="mt-1 accent-primary"
                          />
                          <div className="text-left">
                            <p className="text-xs font-black text-textPrimary flex items-center gap-1.5">
                              {addr.label}
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </p>
                            <p className="text-[11px] leading-relaxed mt-0.5 text-textSecondary">{addr.addressLine}, {addr.city}</p>
                          </div>
                        </label>
                      );
                    })}
                    
                    <button 
                      onClick={() => setIsAddingCustomAddress(true)}
                      className="text-xs font-black text-primary hover:underline block pt-1.5"
                    >
                      + Add a custom checkout address
                    </button>
                  </div>
                ) : (
                  /* Custom coordinate typed address */
                  <div className="space-y-3 p-4 bg-background border border-warmborder rounded-2xl">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Street Address Line *</label>
                      <input 
                        type="text"
                        value={customAddressLine}
                        onChange={(e) => setCustomAddressLine(e.target.value)}
                        placeholder="House No. 12, Mavoor Road Bypass, Calicut"
                        className="input-base bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Pincode *</label>
                        <input 
                          type="text"
                          value={customPincode}
                          onChange={(e) => setCustomPincode(e.target.value)}
                          placeholder="673016"
                          className="input-base bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Selected Coords Hub</label>
                        <span className="block text-[11px] font-mono font-bold text-textPrimary pt-3">
                          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {user.addresses && user.addresses.length > 0 && (
                      <button 
                        onClick={() => setIsAddingCustomAddress(false)}
                        className="text-xs font-bold text-textSecondary hover:underline block pt-1"
                      >
                        Cancel & return to saved addresses
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. PROMO NEIGHBOR WALLET REBATE */}
          {user.walletBalance > 0 && (
            <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-textPrimary">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-serif font-black text-sm">Referral Wallet</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg font-mono border border-emerald-100">
                  Balance: ₹{user.walletBalance}
                </span>
              </div>

              <label className="flex items-center justify-between bg-emerald-50/40 border border-emerald-100 rounded-2xl p-3.5 cursor-pointer">
                <p className="text-[11px] text-emerald-800 font-bold">
                  Apply wallet balance for this purchase?
                </p>
                <input 
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="w-4.5 h-4.5 text-primary accent-emerald-600 shrink-0 cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* 4. CHOOSE SECURE PAYMENT OPTIONS */}
          <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
            <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Choose Payment Method</span>
            </h3>

            <div className="space-y-2">
              <label 
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'bg-primary/5 border-primary text-textPrimary ring-2 ring-primary/10'
                    : 'hover:bg-background border-warmborder text-textSecondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="paymentGroup" 
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-xs font-black text-textPrimary flex items-center gap-1">
                      💳 Online Sandbox Payment
                    </p>
                    <p className="text-[10px] text-textSecondary mt-0.5 font-medium">UPI, GPay, Credit/Debit cards instantly</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded uppercase tracking-wider">Instant</span>
              </label>

              <label 
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-primary/5 border-primary text-textPrimary ring-2 ring-primary/10'
                    : 'hover:bg-background border-warmborder text-textSecondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="paymentGroup" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-primary"
                  />
                  <div>
                    <p className="text-xs font-black text-textPrimary">
                      💵 Cash on Delivery (COD)
                    </p>
                    <p className="text-[10px] text-textSecondary mt-0.5 font-medium">Pay in cash when neighbors deliver</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 5. ITEMWISE DELIVERIES SPLIT BREAKDOWN */}
          <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3.5">
            <h3 className="font-serif font-black text-sm text-textPrimary">Delivery Schedule Breakdown</h3>
            
            <div className="space-y-3 divide-y divide-warmborder">
              {cart.map((item) => {
                const sRate = sellerRates[item.sellerId] || { fee: 0, distance: 0 };
                return (
                  <div key={item.productId} className="flex justify-between items-center gap-4 text-xs pt-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-serif font-black text-textPrimary truncate">{item.title}</p>
                      <p className="text-[10px] text-textSecondary truncate mt-0.5">🏡 {item.sellerName} · {sRate.distance.toFixed(1)} km away</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-textPrimary font-mono">₹{item.price * item.quantity}</p>
                      {deliveryMode === 'delivery' && (
                        <p className="text-[9px] text-secondary font-black font-mono">Delivery: +₹{sRate.fee}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. PLATFORM CHECKS BILL DETAILS */}
          <div className="bg-white border border-warmborder rounded-[24px] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-textSecondary pb-2.5 border-b border-dotted border-warmborder">Billing Details</h3>
            
            <div className="flex justify-between text-xs font-medium">
              <span className="text-textSecondary">Creations Subtotal</span>
              <span className="font-bold text-textPrimary font-mono">₹{creationsTotal}</span>
            </div>

            {deliveryMode === 'delivery' && (
              <div className="flex justify-between text-xs font-medium">
                <span className="text-textSecondary">Distance-aware Delivery Fees</span>
                <span className="font-bold text-textPrimary font-mono">₹{deliveryTotal}</span>
              </div>
            )}

            <div className="flex justify-between text-xs font-medium">
              <span className="text-textSecondary">Platform Safety Fee</span>
              <span className="font-bold text-textPrimary font-mono">₹{platformTotal}</span>
            </div>

            {walletDiscount > 0 && (
              <div className="flex justify-between text-xs text-emerald-700 bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                <span className="font-bold">Referral Wallet Discount</span>
                <span className="font-bold font-mono">-₹{walletDiscount}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black border-t border-dotted border-warmborder pt-3 text-primary">
              <span>Grand Total</span>
              <span className="font-mono text-base">₹{finalCheckoutAmount}</span>
            </div>
          </div>

        </div>

      {/* STICKY FOOTER ACTIONS */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-warmborder/80 py-3.5 px-4 shadow-[0_-8px_30px_rgba(26,18,8,0.06)]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] text-textSecondary uppercase tracking-wider font-black">Secure Payment</p>
              <p className="text-lg font-black text-primary font-mono">₹{finalCheckoutAmount}</p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => triggerOrderPlacement()}
              disabled={placingOrder}
              className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-2xl shadow-premium uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{placingOrder ? 'Confirming...' : 'Place Secure Order'}</span>
            </motion.button>
          </div>
        </div>

      {/* ---------------------------------------------------- */}
      {/* UPI / RAZORPAY SANDBOX SIMULATED OVERLAY */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {showRazorpaySandbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glassmorphism-dark text-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-lifted p-6 space-y-6"
            >
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black italic">R</span>
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-300">Razorpay Payment Sandbox</span>
                </div>
                
                <button 
                  onClick={() => setShowRazorpaySandbox(false)}
                  className="text-xs text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
              </div>

              {paymentStep === 'method' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Payable Amount</p>
                    <p className="text-3xl font-black text-white font-mono">₹{finalCheckoutAmount}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Select UPI Provider</p>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gpay', name: 'GPay', emoji: '🟢' },
                        { id: 'phonepe', name: 'PhonePe', emoji: '🟣' },
                        { id: 'paytm', name: 'Paytm', emoji: '🔵' }
                      ].map((upi) => (
                        <button
                          key={upi.id}
                          onClick={() => setSelectedUpi(upi.id)}
                          className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                            selectedUpi === upi.id
                              ? 'bg-blue-600/10 border-blue-500 text-white'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="text-lg">{upi.emoji}</span>
                          <span className="text-[10px] font-extrabold">{upi.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulatePaymentSuccess()}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-lifted"
                  >
                    Pay with Sandbox {selectedUpi.toUpperCase()}
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Authorizing Transaction...</p>
                  <p className="text-[10px] text-slate-500 leading-normal">Simulating connection with virtual bank network API</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                  <p className="text-base font-black text-white">Payment Authorized!</p>
                  <p className="text-[10px] text-slate-400">Order successfully logged in database.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

