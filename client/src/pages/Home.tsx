import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Search, Filter, Loader, AlertCircle } from 'lucide-react';
import LocationPicker from '../components/discovery/LocationPicker';
import RadiusSlider from '../components/discovery/RadiusSlider';
import ProductCard from '../components/discovery/ProductCard';
import { useGeolocator, SEEDED_HUBS } from '../hooks/useGeolocator';
import { useNearbyProducts, NearbyProduct } from '../hooks/useNearbyProducts';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { coords, radiusKm, setRadiusKm, loading, acquireDeviceGPS, selectManualLocation } = useGeolocator();
  const { products, isLoading, error, hasNextPage, fetchNearbyProducts } =
    useNearbyProducts();
  const { addToCart } = useCart();
  const { user, activeRole, setActiveRole } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filterByLocation, setFilterByLocation] = useState(true); // Toggle for location filtering
  const currentLocation = coords ? { lat: (coords as any).lat, lng: (coords as any).lng } : undefined;

  // Removed local auth submit handler since login is now separate.

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'food', name: 'Food', icon: '🍛' },
    { id: 'bakery', name: 'Bakery', icon: '🥐' },
    { id: 'snacks', name: 'Snacks', icon: '🍪' },
    { id: 'beverages', name: 'Beverages', icon: '☕' },
    { id: 'crafts', name: 'Crafts', icon: '🎨' },
  ];

  // Fetch products when location or filters change
  useEffect(() => {
    if (coords) {
      const filters = {
        lat: coords.lat,
        lng: coords.lng,
        radius: radiusKm,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery: searchQuery || undefined,
        sortBy,
        filterByLocation,
      };
      fetchNearbyProducts(filters);
    }
  }, [coords, radiusKm, selectedCategory, sortBy, filterByLocation]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout) window.clearTimeout(searchTimeout);
    setSearchTimeout(
      window.setTimeout(() => {
        if (coords) {
          fetchNearbyProducts({
            lat: coords.lat,
            lng: coords.lng,
            radius: radiusKm,
            searchQuery: query || undefined,
            filterByLocation,
          });
        }
      }, 500)
    );
  };

  const handleAddToCart = (product: NearbyProduct) => {
    addToCart(
      {
        productId: product._id,
        sellerId: product.sellerId,
        sellerName: product.seller.businessName,
        title: product.title,
        image: product.images[0],
        price: product.discountedPrice || product.price,
        unit: product.unit || 'unit',
      },
      1
    );
  };

  const handleLoadMore = () => {
    if (coords) {
      fetchNearbyProducts({
        lat: coords.lat,
        lng: coords.lng,
        radius: radiusKm,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        searchQuery: searchQuery || undefined,
        sortBy,
        filterByLocation,
        page: 2, // Load next page
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#FFFDFB] pb-24"
    >
      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-warmborder/70 shadow-[0_4px_24px_rgba(26,18,8,0.02)]">
        <div className="max-w-lg mx-auto px-4 py-3.5 lg:max-w-none lg:px-6">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h1 className="font-serif font-black text-2xl text-primary tracking-tight">NearNest</h1>
              <p className="text-[10px] text-textSecondary uppercase tracking-widest font-black mt-0.5">Community Kitchen Hub</p>
            </div>
            <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-2.5 py-1 rounded-xl text-xs font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Calicut</span>
            </div>
          </div>

          {/* Gated top auth cards removed since we use dedicated routes. */}

          {/* Location Info */}
          <div className="mb-4 bg-white border border-warmborder rounded-[24px] p-4.5 shadow-sm space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">📍</span>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-textSecondary font-black">Active Coordinates</p>
                <p className="text-xs font-bold text-textPrimary leading-normal mt-0.5">
                  {coords.label || `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-dotted border-warmborder">
              <button
                type="button"
                onClick={acquireDeviceGPS}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition disabled:opacity-50"
              >
                {loading ? 'Detecting...' : 'Detect GPS Location'}
              </button>
              <button
                type="button"
                onClick={() => selectManualLocation(SEEDED_HUBS[0])}
                className="px-3.5 py-2 rounded-xl bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider hover:bg-secondary/20 transition"
              >
                Set Calicut Center
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 pt-1.5">
              {SEEDED_HUBS.map((hub) => (
                <button
                  key={hub.label}
                  type="button"
                  onClick={() => selectManualLocation(hub)}
                  className="rounded-xl border border-warmborder px-3 py-2 text-[10px] text-textSecondary font-bold hover:border-primary/40 hover:bg-surfaceAlt/20 text-left transition"
                >
                  🌴 {hub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-textSecondary/40" />
              <input
                type="text"
                placeholder="Search homemade creations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-warmborder rounded-[20px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-xs placeholder:text-textSecondary/40 font-medium transition"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 bg-white border border-warmborder rounded-[20px] hover:bg-surfaceAlt/20 transition flex items-center justify-center shrink-0"
              title="Toggle filters drawer"
            >
              <Filter className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Role switcher for quick sandbox demo toggling */}
          <div className="mb-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-[24px] p-4 flex items-center justify-between gap-4 shadow-[inset_0_4px_12px_rgba(26,18,8,0.01)]">
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-wider text-textPrimary">Sandbox Role Toggle</h2>
              <p className="text-[10px] text-textSecondary mt-0.5 leading-snug">Switch view to buy products, or act as a merchant seller.</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('buyer');
                  navigate('/');
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                  activeRole === 'buyer'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-textSecondary border border-warmborder hover:bg-surface'
                }`}
              >
                Buy Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  if (user && user.role.includes('seller')) {
                    setActiveRole('seller');
                    navigate('/seller-dashboard');
                  } else if (user) {
                    alert('You need a seller account to access seller mode.');
                  } else {
                    navigate('/login');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                  activeRole === 'seller'
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-white text-textSecondary border border-warmborder hover:bg-surface'
                }`}
              >
                Sell Mode
              </button>
            </div>
          </div>

          {/* Radius Slider */}
          {coords && (
            <div className="mb-4 space-y-3">
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              
              {/* Location Filter Toggle */}
              <label className="flex items-start gap-3 p-4 bg-white border border-warmborder rounded-[24px] shadow-sm cursor-pointer hover:border-primary/20 transition">
                <input
                  type="checkbox"
                  id="locationFilter"
                  checked={filterByLocation}
                  onChange={(e) => setFilterByLocation(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-textPrimary">Filter by search radius</p>
                  <p className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">
                    {filterByLocation 
                      ? `Showing only creations within your ${radiusKm}km radius.` 
                      : 'Showing all Kozhikode listings, sorted by distance.'}
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-[28px] border border-warmborder bg-white p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary mb-3">Quick stats</p>
                <div className="space-y-3 text-sm text-textSecondary">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-textSecondary/70">Radius</span>
                    <span className="font-bold text-textPrimary">{radiusKm} km</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-textSecondary/70">Sort</span>
                    <span className="font-bold text-textPrimary capitalize">{sortBy}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-textSecondary/70">Results</span>
                    <span className="font-bold text-textPrimary">{products.length}</span>
                  </div>
                  <div className="rounded-2xl bg-secondary/10 px-3 py-3 text-xs text-textSecondary">
                    Filter by location is <span className="font-bold text-textPrimary">{filterByLocation ? 'enabled' : 'disabled'}</span>.
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-warmborder bg-white p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider font-black text-textSecondary mb-3">Nearby highlights</p>
                <div className="space-y-4">
                  <div className="rounded-3xl bg-primary/5 p-3">
                    <p className="text-[11px] text-textSecondary">Fastest delivery</p>
                    <p className="mt-1 font-black text-textPrimary text-sm">25 mins</p>
                  </div>
                  <div className="rounded-3xl bg-secondary/5 p-3">
                    <p className="text-[11px] text-textSecondary">Popular category</p>
                    <p className="mt-1 font-black text-textPrimary text-sm">{selectedCategory !== 'all' ? selectedCategory : 'Food'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-3">
                    <p className="text-[11px] text-textSecondary">Current hub</p>
                    <p className="mt-1 font-black text-textPrimary text-sm">{coords?.label || 'Calicut Beach Hub'}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative z-30 bg-white border-b border-warmborder p-4 shadow-[0_12px_24px_rgba(26,18,8,0.04)] rounded-[24px]"
                >
                  <div className="max-w-lg mx-auto">
                    <h3 className="text-xs font-black uppercase tracking-wider text-textSecondary mb-3">Sort Settings</h3>

                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {(['distance', 'rating', 'price'] as const).map((option) => {
                          const isActive = sortBy === option;
                          return (
                            <button
                              key={option}
                              onClick={() => setSortBy(option)}
                              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
                                isActive
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-textSecondary border border-warmborder hover:bg-surfaceAlt/20'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-sm transition"
                    >
                      Apply Sort Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-lg mx-auto px-4 py-4 lg:max-w-none lg:px-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-width-none no-scrollbar">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-extrabold whitespace-nowrap transition border ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-textSecondary border-warmborder hover:border-primary/45'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="max-w-lg mx-auto px-4 lg:max-w-none lg:px-0">
              {isLoading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs text-textSecondary font-medium">Finding nearby kitchen creations...</p>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-[24px] p-5 flex gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-900">Failed to load creations</h3>
                    <p className="text-xs text-rose-700 font-medium mt-1">{error}</p>
                    <button
                      onClick={() =>
                        coords &&
                        fetchNearbyProducts({
                          lat: coords.lat,
                          lng: coords.lng,
                          radius: radiusKm,
                          filterByLocation,
                        })
                      }
                      className="mt-3.5 text-xs text-primary hover:underline font-extrabold"
                    >
                      Tap to try again &larr;
                    </button>
                  </div>
                </div>
              )}

              {coords && !isLoading && !error && products.length === 0 && (
                <div className="bg-white border border-warmborder rounded-[24px] p-6 text-center mb-6 space-y-3 shadow-sm">
                  <h3 className="font-serif font-black text-sm text-textPrimary">No creations in search zone</h3>
                  <p className="text-xs text-textSecondary leading-relaxed max-w-xs mx-auto">
                    We couldn't find listings near this location. Try expanding your search radius or select the Calicut Beach hub above.
                  </p>
                  <button
                    onClick={() => selectManualLocation(SEEDED_HUBS[0])}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest shadow-sm hover:bg-primary-dark transition"
                  >
                    Calicut Beach Hub
                  </button>
                </div>
              )}

              {!coords && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-[24px] p-6 text-center mb-6 space-y-4">
                  <MapPin className="w-10 h-10 text-primary mx-auto animate-bounce" />
                  <div>
                    <h3 className="font-serif font-black text-sm text-textPrimary">Enable Hub Location</h3>
                    <p className="text-xs text-textSecondary leading-relaxed mt-1 max-w-xs mx-auto">
                      Share your location coordinates to discover homemade bakers and cottage kitchens within delivery distance.
                    </p>
                  </div>
                  <div className="max-w-xs mx-auto">
                    <LocationPicker
                      onLocationSelect={(lat, lng) => selectManualLocation({ lat, lng, label: 'Selected location' })}
                      currentLocation={currentLocation}
                      isLoading={loading}
                    />
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08 },
                    },
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between text-xs text-textSecondary font-medium px-1">
                    <span>Found {products.length} {products.length === 1 ? 'creation' : 'creations'}</span>
                    {selectedCategory !== 'all' && <span className="capitalize font-bold text-primary">{selectedCategory}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {products.map((product) => (
                      <motion.div
                        key={product._id}
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        <ProductCard
                          id={product._id}
                          title={product.title}
                          image={product.images[0]}
                          price={product.price}
                          discountedPrice={product.discountedPrice}
                          rating={product.rating}
                          distance={product.distanceFromUser}
                          preparationTime={product.preparationTimeMinutes}
                          seller={{
                            name: product.seller.businessName,
                            slug: product.seller.slug,
                          }}
                          onAddToCart={() => handleAddToCart(product)}
                          isWishlisted={isWishlisted(product._id)}
                          onWishlistToggle={() =>
                            toggle({
                              productId: product._id,
                              title: product.title,
                              image: product.images[0],
                              price: product.discountedPrice || product.price,
                            })
                          }
                        />
                      </motion.div>
                    ))}
                  </div>

                  {hasNextPage && (
                    <div className="flex justify-center pb-8">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="px-6 py-2.5 border-2 border-primary text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More Products'
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
