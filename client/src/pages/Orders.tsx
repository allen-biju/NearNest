import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Truck,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { io } from 'socket.io-client';

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
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  
  // Real-time Chat/Updates sandbox
  const [chatMessages, setChatMessages] = useState<Record<string, { sender: string; text: string }[]>>({});
  const [chatInput, setChatInput] = useState<string>('');

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
  const sendChatMessage = (orderId: string) => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'buyer', text: chatInput };
    setChatMessages(prev => {
      const messages = prev[orderId] || [];
      return { ...prev, [orderId]: [...messages, newMsg] };
    });
    setChatInput('');
    
    // Simulate seller responding within 3 seconds
    setTimeout(() => {
      const sellerRes = { sender: 'seller', text: 'Sure! Your homemade items are being prepared with extra care, delivering shortly. Thank you!' };
      setChatMessages(prev => {
        const messages = prev[orderId] || [];
        return { ...prev, [orderId]: [...messages, sellerRes] };
      });
    }, 2500);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-4 animate-pulse">
        <div className="h-6 w-24 bg-warmborder rounded" />
        <div className="h-20 w-full bg-warmborder rounded-2xl" />
        <div className="h-40 w-full bg-warmborder rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-warmborder flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="p-1.5 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-xs uppercase tracking-wider text-textSecondary">
          Order Tracking
        </h2>
        <button 
          onClick={() => fetchOrders()}
          className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
        >
          Refresh Feed
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-5">
        
        {orders.length === 0 ? (
          <div className="bg-white border border-warmborder rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary text-xl">
              🥘
            </div>
            <h4 className="font-serif font-black text-sm text-textPrimary">No Orders Placed Yet</h4>
            <p className="text-xs text-textSecondary max-w-xs mx-auto leading-relaxed">
              You haven't ordered any delicious creations from your local bakers or home chefs. Let's make your first support!
            </p>
            <Link to="/" className="inline-block px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm">
              Discover Nearby Food
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* HORIZONTAL MINI-LIST FOR QUICK SELECT */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {orders.map((ord) => {
                const isActive = selectedOrder?._id === ord._id;
                return (
                  <button
                    key={ord._id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold shrink-0 border transition-all ${
                      isActive 
                        ? 'bg-primary text-white border-primary shadow-sm scale-95' 
                        : 'bg-white text-textPrimary border-warmborder hover:bg-surface'
                    }`}
                  >
                    🏡 {ord.orderNumber.split('-').pop()} ({ord.status.replace(/_/g, ' ')})
                  </button>
                );
              })}
            </div>

            {selectedOrder && (
              <div className="space-y-4">
                
                {/* 1. ORDER SUMMARY CARD */}
                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-warmborder pb-2.5">
                    <div>
                      <p className="text-[9px] text-textSecondary uppercase font-bold">Order Number</p>
                      <h3 className="text-xs font-mono font-black text-textPrimary">{selectedOrder.orderNumber}</h3>
                    </div>

                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">
                      {selectedOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-warmborder bg-background shrink-0">
                      <img src={selectedOrder.sellerId.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-xs text-textPrimary">
                        {selectedOrder.sellerId.businessName}
                      </h4>
                      <p className="text-[10px] text-textSecondary">
                        Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Items loop */}
                  <div className="space-y-1.5 pt-2 border-t border-dotted border-warmborder">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-textSecondary">
                        <span>{item.title} x {item.quantity}</span>
                        <span className="font-bold font-mono text-textPrimary">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-warmborder text-sm font-black text-primary">
                    <span>Amount Paid</span>
                    <span className="font-mono">₹{selectedOrder.total}</span>
                  </div>
                </div>

                {/* 2. REAL-TIME TRACKING PROGRESS STEPPER */}
                <div className="bg-white border border-warmborder rounded-2xl p-4 shadow-sm space-y-4">
                  <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Real-time Status</span>
                  </h3>

                  <div className="space-y-4 relative pl-5">
                    {/* Stepper bar vertical connector */}
                    <div className="absolute left-1.5 top-2.5 bottom-2.5 w-[2px] bg-warmborder" />

                    {[
                      { state: 'placed', label: 'Order Received', desc: 'Awaiting neighbor acceptance' },
                      { state: 'accepted', label: 'Order Accepted', desc: 'Home kitchen preparing clean ingredients' },
                      { state: 'preparing', label: 'Baking & Preparing', desc: 'Cottage kitchen is crafting your order' },
                      { state: 'ready', label: 'Ready for delivery', desc: 'Fresh homemade items packed neatly' },
                      { state: 'out_for_delivery', label: 'Out for delivery', desc: 'Neighbor is delivering on eco-wheels' },
                      { state: 'delivered', label: 'Completed & Delivered', desc: 'Enjoy authentic local flavors!' }
                    ].map((step, idx) => {
                      const statesList = ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
                      const currentIdx = statesList.indexOf(selectedOrder.status);
                      const stepIdx = statesList.indexOf(step.state);
                      
                      const isCompleted = stepIdx <= currentIdx && selectedOrder.status !== 'cancelled';
                      const isActive = step.state === selectedOrder.status;

                      return (
                        <div key={idx} className="relative flex gap-3 text-left">
                          {/* Stepper dot */}
                          <div className={`absolute -left-5 top-1 w-3 h-3 rounded-full border-2 z-10 transition-all ${
                            isActive 
                              ? 'bg-primary border-primary scale-125 pulse-gps-dot' 
                              : isCompleted 
                              ? 'bg-emerald-500 border-emerald-500' 
                              : 'bg-white border-warmborder'
                          }`} />

                          <div>
                            <p className={`text-xs font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-textPrimary' : 'text-textSecondary/50'}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-textSecondary leading-relaxed mt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cancel button */}
                  {selectedOrder.status === 'placed' && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* 3. SIMULATED NEIGHBOR CHAT WINDOW */}
                <div className="bg-white border border-warmborder rounded-2xl overflow-hidden shadow-sm flex flex-col h-[280px]">
                  {/* Chat header */}
                  <div className="px-4 py-2.5 bg-surface border-b border-warmborder flex items-center justify-between">
                    <span className="text-xs font-black text-textPrimary flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-primary" />
                      <span>Chat with Creator</span>
                    </span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold uppercase px-1.5 py-0.5 rounded">Online</span>
                  </div>

                  {/* Chat message display */}
                  <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2 bg-background/50">
                    <div className="bg-white border border-warmborder text-[11px] p-2.5 rounded-xl rounded-tl-none max-w-[80%] text-textSecondary leading-relaxed">
                      Hello! Thanks for supporting my home cottage kitchen. Preparing your creations now. Let me know if you have specific spice/delivery choices!
                    </div>

                    {(chatMessages[selectedOrder._id] || []).map((msg, idx) => {
                      const isMe = msg.sender === 'buyer';
                      return (
                        <div 
                          key={idx} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`p-2.5 rounded-xl text-[11px] max-w-[85%] leading-relaxed ${
                            isMe 
                              ? 'bg-primary text-white rounded-tr-none shadow-sm' 
                              : 'bg-white border border-warmborder text-textSecondary rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat input form */}
                  <div className="p-2 border-t border-warmborder flex gap-2 bg-white">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message to bake instructions..." 
                      className="flex-1 px-3 py-1.5 border border-warmborder rounded-xl text-xs focus:outline-none focus:border-primary"
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage(selectedOrder._id)}
                    />
                    <button
                      onClick={() => sendChatMessage(selectedOrder._id)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl"
                    >
                      Send
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
