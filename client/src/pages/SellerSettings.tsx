import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle, Navigation, Truck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SellerSettingsData {
  businessName: string;
  description?: string;
  category: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryRadiusKm: number;
  deliveryOptions: string[];
  baseDeliveryFee: number;
  perKmRate: number;
  maxDeliveryFee: number;
}

export const SellerSettings: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [_settings, setSettings] = useState<SellerSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'location' | 'delivery' | 'store'>('location');
  const [locating, setLocating] = useState(false);

  // Location form state
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Delivery form state
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(20);
  const [perKmRate, setPerKmRate] = useState(5);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState(80);

  // Store form state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');

  // Redirect if not logged in or not a seller
  useEffect(() => {
    if (!user || !user.role.includes('seller')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch seller settings
  const fetchSettings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/sellers/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data as SellerSettingsData);
        const [coordLng, coordLat] = data.data.location.coordinates;
        setLat(coordLat);
        setLng(coordLng);
        setAddressLine(data.data.address.addressLine);
        setCity(data.data.address.city);
        setState(data.data.address.state);
        setPincode(data.data.address.pincode);
        setDeliveryRadius(data.data.deliveryRadiusKm || 5);
        setBaseDeliveryFee(data.data.baseDeliveryFee || 20);
        setPerKmRate(data.data.perKmRate || 5);
        setMaxDeliveryFee(data.data.maxDeliveryFee || 80);
        setBusinessName(data.data.businessName);
        setDescription(data.data.description || '');
      } else {
        setError(data.error?.message || 'Failed to fetch settings');
      }
    } catch {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess(null);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(msg);
      setError(null);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  // Get device location
  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
        showToast('📍 Location detected successfully!');
      },
      (error) => {
        setLocating(false);
        showToast(error.message || 'Unable to detect location. Please enable location services.', true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save location
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || lat === 0 || lng === 0) {
      showToast('Please provide valid coordinates', true);
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch('/api/v1/sellers/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lng, address: { addressLine, city, state, pincode } })
      });
      const data = await res.json();
      if (data.success) {
        setLoading(true);
        showToast('Kitchen location updated. You are now visible to nearby neighbors!');
      } else {
        showToast(data.error?.message || 'Failed to update location', true);
      }
    } catch {
      showToast('Failed to update location', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Save delivery settings
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/v1/sellers/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryRadiusKm: deliveryRadius, baseDeliveryFee, perKmRate, maxDeliveryFee })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Delivery pricing and radius updated successfully!');
      } else {
        showToast(data.error?.message || 'Failed to update settings', true);
      }
    } catch {
      showToast('Failed to update settings', true);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-5">
        <div className="h-11 w-full bg-warmborder rounded-2xl shimmer" />
        <div className="h-64 w-full bg-warmborder rounded-[28px] shimmer" />
      </div>
    );
  }

  const tabs = [
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'delivery', label: 'Delivery', icon: Truck },
    { key: 'store', label: 'Store', icon: Store },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-28"
    >
      {/* HEADER BAR */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-warmborder/80 flex items-center gap-3 shadow-[0_4px_24px_rgba(26,18,8,0.01)]">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dashboard')}
          className="p-2 bg-white border border-warmborder rounded-full hover:bg-surface text-textPrimary shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <h2 className="text-xs font-black uppercase tracking-wider text-textSecondary">Store Settings</h2>
      </div>

      {/* TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mx-4 mt-4 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold ${
              error
                ? 'bg-rose-50 border border-rose-100 text-rose-700'
                : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
            }`}
          >
            {error
              ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              : <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            }
            <span className="leading-relaxed">{error || success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 mt-5 space-y-5">

        {/* TAB PILL SWITCHER */}
        <div className="grid grid-cols-3 gap-1.5 bg-white border border-warmborder rounded-2xl p-1 shadow-sm">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-5"
          >
            <div>
              <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Kitchen GPS Coordinates
              </h3>
              <p className="text-[10px] text-textSecondary leading-relaxed mt-1">
                Accurate location helps neighbors discover your products within delivery radius.
              </p>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Coordinate inputs */}
              <div className="bg-surface border border-warmborder rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="input-base bg-white font-mono text-[11px]"
                      placeholder="11.2588"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="input-base bg-white font-mono text-[11px]"
                      placeholder="75.7804"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={getDeviceLocation}
                  disabled={locating}
                  className="w-full py-2.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {locating
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting Location...</>
                    : <><Navigation className="w-3.5 h-3.5" /> Use My Current GPS Location</>
                  }
                </motion.button>
              </div>

              {/* Address Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Street Address *</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="House No. 12, Mavoor Road, Calicut"
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Kozhikode"
                      className="input-base"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Kerala"
                      className="input-base"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="673001"
                    className="input-base"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Kitchen Location</>}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* DELIVERY TAB */}
        {activeTab === 'delivery' && (
          <motion.div
            key="delivery"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-5"
          >
            <div>
              <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                Delivery Radius & Pricing
              </h3>
              <p className="text-[10px] text-textSecondary leading-relaxed mt-1">
                Configure your delivery zone and the dynamic fee structure for neighbors ordering from you.
              </p>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-5">
              {/* Radius slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Delivery Radius</label>
                  <span className="text-xs font-black text-primary font-mono bg-primary/5 px-2.5 py-0.5 rounded-lg border border-primary/10">{deliveryRadius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[9px] text-textSecondary/50 font-bold">
                  <span>1 km</span><span>25 km</span>
                </div>
              </div>

              {/* Fee fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Base Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={baseDeliveryFee}
                    onChange={(e) => setBaseDeliveryFee(parseInt(e.target.value))}
                    className="input-base font-mono"
                  />
                  <p className="text-[8px] text-textSecondary/60 font-medium">Fixed charge per order</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Per KM Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(parseFloat(e.target.value))}
                    className="input-base font-mono"
                  />
                  <p className="text-[8px] text-textSecondary/60 font-medium">Extra per km traveled</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Maximum Delivery Fee Cap (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={maxDeliveryFee}
                  onChange={(e) => setMaxDeliveryFee(parseInt(e.target.value))}
                  className="input-base font-mono"
                />
                <p className="text-[8px] text-textSecondary/60 font-medium">Regardless of actual distance, fee will not exceed this</p>
              </div>

              {/* Fee Preview */}
              <div className="bg-surface border border-warmborder rounded-2xl p-4 space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Sample Fee Preview (2 km away)</p>
                <p className="text-sm font-black text-textPrimary font-mono">
                  ₹{Math.min(baseDeliveryFee + Math.round(2 * perKmRate), maxDeliveryFee)}
                  <span className="text-[10px] text-textSecondary font-medium ml-1.5">({baseDeliveryFee} base + {Math.round(2 * perKmRate)} distance)</span>
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Delivery Config</>}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* STORE TAB */}
        {activeTab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-warmborder rounded-[28px] p-5 shadow-sm space-y-5"
          >
            <div>
              <h3 className="font-serif font-black text-sm text-textPrimary flex items-center gap-1.5">
                <Store className="w-4 h-4 text-primary" />
                Store Information
              </h3>
              <p className="text-[10px] text-textSecondary leading-relaxed mt-1">
                Tell neighbors more about your home cottage kitchen and unique specialties.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  disabled
                  className="input-base opacity-50 cursor-not-allowed"
                />
                <p className="text-[8px] text-textSecondary/60 font-medium">
                  Business name is locked. Contact NearNest support to request changes.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-textSecondary">Kitchen Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell neighbors about your specialty dishes, allergen-safe cooking environment, and home kitchen story..."
                  rows={4}
                  className="input-base resize-none"
                />
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 text-left">
                <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                  ℹ️ More store customization options — photos, business hours, and delivery slots — are coming in the next NearNest platform update.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};

export default SellerSettings;
