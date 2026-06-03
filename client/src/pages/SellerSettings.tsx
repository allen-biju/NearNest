import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface SellerSettings {
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

  const [settings, setSettings] = useState<SellerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'location' | 'delivery' | 'store'>('location');

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
        setSettings(data.data);
        // Populate location form
        const [lng, lat] = data.data.location.coordinates;
        setLat(lat);
        setLng(lng);
        setAddressLine(data.data.address.addressLine);
        setCity(data.data.address.city);
        setState(data.data.address.state);
        setPincode(data.data.address.pincode);

        // Populate delivery form
        setDeliveryRadius(data.data.deliveryRadiusKm || 5);
        setBaseDeliveryFee(data.data.baseDeliveryFee || 20);
        setPerKmRate(data.data.perKmRate || 5);
        setMaxDeliveryFee(data.data.maxDeliveryFee || 80);

        // Populate store form
        setBusinessName(data.data.businessName);
        setDescription(data.data.description || '');
      } else {
        setError(data.error?.message || 'Failed to fetch settings');
      }
    } catch (err: any) {
      console.error('Error fetching seller settings:', err);
      setError(err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  // Get device location
  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      setSuccess('Location detected successfully');
      setTimeout(() => setSuccess(null), 3000);
    };

    const handleError = (err: GeolocationPositionError) => {
      setError('Unable to access your location. Please enable location services.');
      console.error('Geolocation error:', err);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  };

  // Save location
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || lat === 0 || lng === 0) {
      setError('Please provide valid location coordinates');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        lat,
        lng,
        address: {
          addressLine,
          city,
          state,
          pincode
        }
      };

      const res = await fetch('/api/v1/sellers/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setSuccess('Location updated successfully! Your products will be visible to nearby customers.');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error?.message || 'Failed to update location');
      }
    } catch (err: any) {
      console.error('Error updating location:', err);
      setError(err.message || 'Failed to update location');
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
      setError(null);

      const payload = {
        deliveryRadiusKm: deliveryRadius,
        baseDeliveryFee,
        perKmRate,
        maxDeliveryFee
      };

      const res = await fetch('/api/v1/sellers/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setSuccess('Delivery settings updated successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error?.message || 'Failed to update settings');
      }
    } catch (err: any) {
      console.error('Error updating delivery settings:', err);
      setError(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="p-2 hover:bg-orange-50 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-orange-600">Store Settings</h1>
              <p className="text-sm text-gray-600">Manage your location, delivery & store info</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-orange-100">
          {(['location', 'delivery', 'store'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Store Location
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Your store location is crucial for customers to discover your products. Update it if you've moved to a new location.
            </p>

            <form onSubmit={handleSaveLocation} className="space-y-4">
              {/* Coordinates */}
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm font-mono"
                      placeholder="11.2588"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm font-mono"
                      placeholder="75.7804"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getDeviceLocation}
                  className="mt-3 w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition text-sm"
                >
                  📍 Detect My Current Location
                </button>
              </div>

              {/* Address Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="123 Main Street, Apartment 4B"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Calicut"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Kerala"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="673001"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Location
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Settings</h2>
            <p className="text-sm text-gray-600 mb-6">
              Configure how far you can deliver and the fees charged for delivery.
            </p>

            <form onSubmit={handleSaveDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum distance you can deliver from your store
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Base Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fixed fee for each delivery
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Per Km Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={perKmRate}
                  onChange={(e) => setPerKmRate(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional fee per kilometer traveled
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxDeliveryFee}
                  onChange={(e) => setMaxDeliveryFee(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cap on delivery fee regardless of distance
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Delivery Settings
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Store Tab */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Store Information</h2>
            <p className="text-sm text-gray-600 mb-6">
              Update your store name and description to help customers understand your business better.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Business name cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your store, specialties, and unique offerings..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-600"
                />
              </div>

              <p className="text-xs text-gray-500">
                ℹ️ More store details coming soon. For now, focus on providing accurate location and delivery information to boost visibility.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerSettings;
