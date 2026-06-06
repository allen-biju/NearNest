import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Truck,
  RefreshCw,
  Send,
  UtensilsCrossed,
  ChefHat
} from 'lucide-react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

interface IOrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface IOrder {
  _id: string;
  orderNumber: string;
  sellerId: {
    _id: string;
    businessName: string;
    logo: string;
    phone?: string;
  };
  items: IOrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  deliveryAddress: {
    addressLine: string;
  };
  deliveryMode: string;
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export const Orders: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  
  // Real-time Chat/Updates sandbox
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({});
  const [chatInput, setChatInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        if (data.data.length > 0 && !selectedOrder) {
          setSelectedOrder(data.data[0]); // default select the newest order
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Establish Socket.io connection for simulated or real-time status shifts
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('🔌 Order socket.io connection established');
    });

    socket.on('order_status_update', (updatedOrder: any) => {
      console.log('🛰️ Received real-time status update:', updatedOrder);
      // Sync local state
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o));
      if (selectedOrder && selectedOrder._id === updatedOrder._id) {
        setSelectedOrder(prev => prev ? { ...prev, ...updatedOrder } : null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Scroll to bottom of chat whenever messages list updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, selectedOrder]);

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this delicious homemade order?')) return;
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Changed mind' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order cancelled successfully!');
        fetchOrders();
      } else {
        alert(data.error?.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  // Chat message submit
  const sendChatMessage = (orderId: string, textOverride?: string) => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim()) return;
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { sender: 'buyer', text: textToSend, time: now };
    
    setChatMessages(prev => {
      const messages = prev[orderId] || [];
      return { ...prev, [orderId]: [...messages, newMsg] };
    });
    if (!textOverride) setChatInput('');
    
    // Simulate seller responding within 2.5 seconds
    setTimeout(() => {
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sellerRes = { 
        sender: 'seller', 
        text: 'Sure! Your homemade items are being prepared with extra care, delivering shortly. Thank you!',
        time: responseTime
      };
      setChatMessages(prev => {
        const messages = prev[orderId] || [];
        return { ...prev, [orderId]: [...messages, sellerRes] };
      });
    }, 2000);
  };

  // Get status color styling
  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'placed':
        return { color: 'text-blue-600 bg-blue-50 border-blue-100', label: 'Placed' };
      case 'accepted':
        return { color: 'text-indigo-600 bg-indigo-50 border-indigo-100', label: 'Accepted' };
      case 'preparing':
        return { color: 'text-amber-600 bg-amber-50 border-amber-100', label: 'Preparing' };
      case 'ready':
        return { color: 'text-yellow-600 bg-yellow-50 border-yellow-100', label: 'Ready' };
      case 'out_for_delivery':
        return { color: 'text-pink-600 bg-pink-50 border-pink-100', label: 'Out for Delivery' };
      case 'delivered':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', label: 'Delivered' };
      case 'cancelled':
        return { color: 'text-rose-600 bg-rose-50 border-rose-100', label: 'Cancelled' };
      default:
        return { color: 'text-textSecondary bg-surface border-warmborder', label: status };
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-warmborder rounded-full shimmer" />
          <div className="h-6 w-32 bg-warmborder rounded-xl shimmer" />
        </div>
        <div className="h-24 w-full bg-warmborder rounded-3xl shimmer" />
        <div className="h-64 w-full bg-warmborder rounded-3xl shimmer" />
      </div>
    );
  }

  // Define full list of states for delivery/pickup steps
  const statesList = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const activeStatusIdx = selectedOrder ? statesList.indexOf(selectedOrder.status) : 0;
  
  // Quick replies for the chat simulator
  const quickReplies = [
    'How long until preparation completes? ⏰',
    'Please leave it at my doorstep. 🚪',
    'Thank you so much, smells amazing! ❤️',
    'Any specific allergy check for peanuts? 🥜'
  ];

  return (
    <div className="pb-32">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/80 flex items-center justify-between shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')} 
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
          Order Tracker
        </h2>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchOrders()}
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-primary shadow-sm flex items-center justify-center"
          title="Refresh orders"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-6">
        
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-warmborder rounded-[32px] p-8 text-center space-y-4 shadow-premium"
          >
            <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary text-2xl">
              🍳
            </div>
            <h4 className="font-serif font-black text-lg text-textPrimary">No Active Orders Yet</h4>
            <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed">
              Order fresh organic bakes and meals directly from neighboring home kitchens today to show support.
            </p>
            <Link to="/" className="btn-primary inline-flex max-w-[200px] mx-auto">
              Explore Kitchens
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            
            {/* HORIZONTAL MINI-LIST FOR QUICK SELECT */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {orders.map((ord) => {
                const isActive = selectedOrder?._id === ord._id;
                const statusMeta = getStatusMeta(ord.status);
                
                return (
                  <button
                    key={ord._id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`px-4 py-2.5 rounded-2xl text-[11px] font-black shrink-0 border transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-primary text-white border-primary shadow-premium scale-98' 
                        : 'bg-white text-textPrimary border-warmborder hover:bg-surface'
                    }`}
                  >
                    <span>🏡 #{ord.orderNumber.split('-').pop()}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : statusMeta.color
                    }`}>
                      {statusMeta.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedOrder && (
              <motion.div 
                key={selectedOrder._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                
                {/* 1. ORDER SUMMARY CARD */}
                <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-warmborder/70 pb-3">
                    <div>
                      <p className="text-[9px] text-textSecondary uppercase tracking-widest font-black">Order ID</p>
                      <h3 className="text-xs font-mono font-black text-textPrimary">{selectedOrder.orderNumber}</h3>
                    </div>

                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-xl border ${getStatusMeta(selectedOrder.status).color}`}>
                      {getStatusMeta(selectedOrder.status).label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-warmborder bg-background shrink-0 shadow-inner">
                      <img src={selectedOrder.sellerId.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                        {selectedOrder.sellerId.businessName}
                        <ChefHat className="w-3.5 h-3.5 text-primary shrink-0" />
                      </h4>
                      <p className="text-[10px] text-textSecondary font-medium">
                        Placed: {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Items loop */}
                  <div className="space-y-2 pt-3 border-t border-dotted border-warmborder/80">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-textSecondary font-medium">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                          {item.title} <span className="text-[10px] font-bold text-textPrimary">x {item.quantity}</span>
                        </span>
                        <span className="font-bold font-mono text-textPrimary">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-warmborder/80 text-sm font-black text-primary">
                    <span className="font-serif">Total Payment</span>
                    <span className="font-mono text-base bg-primary/5 px-2.5 py-0.5 rounded-lg border border-primary/10">₹{selectedOrder.total}</span>
                  </div>
                </div>

                {/* 2. REAL-TIME TRACKING PROGRESS STEPPER */}
                <div className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                      <Truck className="w-4.5 h-4.5 text-primary" />
                      <span>Delivery Stepper</span>
                    </h3>
                    
                    <span className="text-[9px] font-black text-textSecondary uppercase tracking-widest bg-surface border border-warmborder px-2.5 py-1 rounded-xl">
                      {selectedOrder.deliveryMode === 'pickup' ? 'Kitchen Pickup' : 'Home Delivery'}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-5 pb-1">
                    {/* Stepper bar vertical connector */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-[3px] bg-warmborder/60 rounded-full" />
                    
                    {/* Stepper Active Progress overlay */}
                    {selectedOrder.status !== 'cancelled' && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ 
                          height: `${(activeStatusIdx / (statesList.length - 1)) * 92}%` 
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute left-[7px] top-2 w-[3px] bg-gradient-to-b from-primary to-accent rounded-full"
                      />
                    )}

                    {[
                      { state: 'placed', label: 'Order Confirmed', desc: 'Placed and securely registered' },
                      { state: 'accepted', label: 'Kitchen Accepted', desc: 'Neighbor agreed to bake & deliver' },
                      { state: 'preparing', label: 'Artisanal Preparation', desc: 'Crafting fresh custom ingredients' },
                      { state: 'ready', label: 'Neatly Packed', desc: 'Boxed and ready inside the kitchen' },
                      { state: 'out_for_delivery', label: 'Out for Delivery', desc: 'Creator is cycling over to you' },
                      { state: 'delivered', label: 'Delivered & Shared', desc: 'Bite into warm, authentic food!' }
                    ].map((step, idx) => {
                      const stepIdx = statesList.indexOf(step.state);
                      const isCompleted = stepIdx <= activeStatusIdx && selectedOrder.status !== 'cancelled';
                      const isActive = step.state === selectedOrder.status;

                      return (
                        <div key={idx} className="relative flex gap-3 text-left">
                          {/* Stepper dot */}
                          <div className="absolute -left-6.5 top-1.5 flex items-center justify-center">
                            {isActive ? (
                              <div className="relative w-4 h-4">
                                <motion.div 
                                  animate={{ scale: [1, 1.4, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="absolute inset-0 bg-primary/30 rounded-full"
                                />
                                <div className="absolute inset-0.5 bg-primary rounded-full border-2 border-white shadow" />
                              </div>
                            ) : (
                              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500 border-emerald-500 shadow-sm' 
                                  : 'bg-white border-warmborder'
                              }`} />
                            )}
                          </div>

                          <div className="pl-1">
                            <p className={`text-xs font-black transition-colors ${
                              isActive ? 'text-primary' : isCompleted ? 'text-textPrimary' : 'text-textSecondary/40'
                            }`}>
                              {step.label}
                            </p>
                            <p className={`text-[10px] leading-relaxed mt-0.5 ${
                              isActive ? 'text-textSecondary font-medium' : isCompleted ? 'text-textSecondary/60' : 'text-textSecondary/30'
                            }`}>
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cancel button */}
                  {selectedOrder.status === 'placed' && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/80 text-xs font-black rounded-2xl transition-colors uppercase tracking-wider"
                    >
                      Cancel Order
                    </motion.button>
                  )}
                </div>

                {/* 3. SIMULATED NEIGHBOR CHAT WINDOW */}
                <div className="bg-white border border-warmborder rounded-[28px] overflow-hidden shadow-sm flex flex-col h-[320px] transition-all">
                  {/* Chat header */}
                  <div className="px-4 py-3 bg-surface border-b border-warmborder flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-warmborder/80">
                        <img src={selectedOrder.sellerId.logo} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-black text-textPrimary flex items-center gap-1">
                        <span>Chat with {selectedOrder.sellerId.businessName}</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Active</span>
                    </span>
                  </div>

                  {/* Chat message display */}
                  <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-background/30">
                    {/* Welcome message */}
                    <div className="flex justify-start">
                      <div className="bg-white border border-warmborder text-[11px] p-3 rounded-2xl rounded-tl-none max-w-[85%] text-textSecondary leading-relaxed shadow-sm">
                        Hello neighbor! Thanks for supporting my home cottage kitchen. Preparing your creations now with clean ingredients. Let me know if you have specific choices!
                        <span className="block text-[8px] text-textSecondary/40 mt-1 font-bold">Creator · System</span>
                      </div>
                    </div>

                    {(chatMessages[selectedOrder._id] || []).map((msg, idx) => {
                      const isMe = msg.sender === 'buyer';
                      return (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          key={idx} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`p-3 rounded-2xl text-[11px] max-w-[85%] leading-relaxed shadow-sm ${
                            isMe 
                              ? 'bg-primary text-white rounded-tr-none' 
                              : 'bg-white border border-warmborder text-textSecondary rounded-tl-none'
                          }`}>
                            <p>{msg.text}</p>
                            <span className={`block text-[8px] mt-1 text-right font-bold ${isMe ? 'text-white/60' : 'text-textSecondary/40'}`}>
                              {msg.time}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Action Suggestion Tags */}
                  <div className="px-3 py-1.5 bg-surface border-t border-warmborder/80 flex gap-1.5 overflow-x-auto no-scrollbar">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => sendChatMessage(selectedOrder._id, reply)}
                        className="px-3 py-1.5 bg-white border border-warmborder text-[9px] font-bold text-textSecondary hover:text-primary hover:border-primary shrink-0 rounded-full shadow-sm transition-all"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>

                  {/* Chat input form */}
                  <div className="p-3 border-t border-warmborder/85 flex gap-2 bg-white items-center">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the home cook a question..." 
                      className="flex-1 px-4 py-2.5 border border-warmborder rounded-2xl text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-background transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(selectedOrder._id)}
                    />
                    
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => sendChatMessage(selectedOrder._id)}
                      className="p-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark shadow-sm flex items-center justify-center shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
