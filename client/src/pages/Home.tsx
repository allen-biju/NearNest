import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Search, Filter, Loader, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import LocationPicker from '../components/discovery/LocationPicker';
import RadiusSlider from '../components/discovery/RadiusSlider';
import ProductCard from '../components/discovery/ProductCard';
import { useGeolocator, SEEDED_HUBS } from '../hooks/useGeolocator';
import { useNearbyProducts, NearbyProduct } from '../hooks/useNearbyProducts';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { coords, radiusKm, setRadiusKm, loading, acquireDeviceGPS, selectManualLocation } = useGeolocator();
  const { products, isLoading, error, hasNextPage, fetchNearbyProducts } =
    useNearbyProducts();
  const { addToCart } = useCart();
  const { user, activeRole, setActiveRole, login, signup, logout } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authRole, setAuthRole] = useState<'buyer' | 'seller'>('buyer');
  const [loginAsRole, setLoginAsRole] = useState<'buyer' | 'seller'>('buyer');

  // Seller-specific fields
  const [sellerBusinessName, setSellerBusinessName] = useState('');
  const [sellerCategory, setSellerCategory] = useState('food');
  const [sellerAddressLine, setSellerAddressLine] = useState('');
  const [sellerCity, setSellerCity] = useState('');
  const [sellerPincode, setSellerPincode] = useState('');
  const [sellerBankAccount, setSellerBankAccount] = useState('');
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filterByLocation, setFilterByLocation] = useState(true); // Toggle for location filtering
  const currentLocation = coords ? { lat: (coords as any).lat, lng: (coords as any).lng } : undefined;

  const handleHomeAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!authName || !authEmail || !authPhone) {
        alert('Please fill in all registration fields.');
        return;
      }

      if (authRole === 'seller') {
        if (!sellerBusinessName || !sellerCity || !sellerPincode) {
          alert('Please fill in seller business name, city and pincode.');
          return;
        }
      }
      const payload: any = {
        name: authName,
        email: authEmail,
        phone: authPhone,
        password: authPassword,
      };

      if (authRole === 'seller') {
        payload.role = ['seller'];
        payload.sellerData = {
          businessName: sellerBusinessName,
          category: sellerCategory,
          address: {
            addressLine: sellerAddressLine || `${sellerBusinessName}`,
            city: sellerCity,
            state: 'Unknown',
            pincode: sellerPincode,
          },
          location: coords ? { type: 'Point', coordinates: [coords.lng, coords.lat] } : { type: 'Point', coordinates: [0, 0] },
          bankDetails: { accountHolder: authName, accountNumber: sellerBankAccount || '0000000', ifscCode: 'NA', bankName: 'NA' },
        };
      }

      const success = await signup(payload);
      if (success) {
        setIsRegistering(false);
        setAuthName('');
        setAuthPhone('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthRole('buyer');
        setSellerBusinessName('');
        setSellerCity('');
        setSellerPincode('');
        if (authRole === 'seller') {
          setActiveRole('seller');
          navigate('/seller-dashboard');
        } else {
          navigate('/');
        }
      }
    } else {
      if (!authIdentifier) {
        alert('Please enter your email or mobile number.');
        return;
      }
      const loginResult = await login(authIdentifier, authPassword);
      if (loginResult.success) {
        setAuthIdentifier('');
        setAuthPassword('');

        const isAdmin = loginResult.user?.role.includes('admin') || loginResult.user?.role.includes('superadmin');
        const isSeller = loginResult.user?.role.includes('seller');

        if (isAdmin) {
          logout();
          alert('Admin users must use the separate admin login page.');
          return;
        }

        if (loginAsRole === 'seller') {
          if (isSeller) {
            setActiveRole('seller');
            navigate('/seller-dashboard');
          } else {
            alert('This account is not registered as a seller.');
            setActiveRole('buyer');
            navigate('/');
          }
        } else {
          setActiveRole('buyer');
          navigate('/');
        }

        if (coords) {
          await fetchNearbyProducts({
            lat: coords.lat,
            lng: coords.lng,
            radius: radiusKm,
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            searchQuery: searchQuery || undefined,
            sortBy,
            filterByLocation,
          });
        }
      }
    }
  };

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
  }, [coords, radiusKm, selectedCategory, sortBy, user, filterByLocation]);

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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">NearNest</h1>
              <p className="text-sm text-gray-600">Login or browse nearby homemade products.</p>
            </div>
            <MapPin className="w-5 h-5 text-green-600" />
          </div>

          {!user && (
            <div className="mb-4 rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                  {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">
                    {isRegistering ? 'Register with email or mobile' : 'Login with email or mobile'}
                  </p>
                  <p className="text-xs text-textSecondary">
                    Use your phone number or email address to get started.
                  </p>
                </div>
              </div>
              <form onSubmit={handleHomeAuthSubmit} className="space-y-3">
                {isRegistering ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                      Full Name
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ananya Ramesh"
                        className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                        required
                      />
                    </label>
                    <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                      Mobile Number
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="9876543210"
                        className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                        required
                      />
                    </label>
                    <label className="block text-[10px] uppercase tracking-wider text-textSecondary sm:col-span-2">
                      Email Address
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="buyer@nearnest.in"
                        className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                        required
                      />
                    </label>
                    {/* Role selection */}
                    <div className="sm:col-span-2 flex items-center gap-3 mt-1">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="role" checked={authRole==='buyer'} onChange={() => setAuthRole('buyer')} />
                        <span className="text-[11px] text-textSecondary">Register as Buyer</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="role" checked={authRole==='seller'} onChange={() => setAuthRole('seller')} />
                        <span className="text-[11px] text-textSecondary">Register as Seller</span>
                      </label>
                    </div>

                    {authRole === 'seller' && (
                      <>
                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary sm:col-span-2">
                          Business Name
                          <input
                            type="text"
                            value={sellerBusinessName}
                            onChange={(e) => setSellerBusinessName(e.target.value)}
                            placeholder="Ananya's Kitchen"
                            className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                            required
                          />
                        </label>

                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                          Category
                          <select value={sellerCategory} onChange={(e) => setSellerCategory(e.target.value)} className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm">
                            <option value="food">Food</option>
                            <option value="bakery">Bakery</option>
                            <option value="snacks">Snacks</option>
                            <option value="beverages">Beverages</option>
                            <option value="crafts">Crafts</option>
                            <option value="other">Other</option>
                          </select>
                        </label>

                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary sm:col-span-2">
                          Address Line
                          <input type="text" value={sellerAddressLine} onChange={(e) => setSellerAddressLine(e.target.value)} placeholder="123 Main St" className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm" />
                        </label>

                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                          City
                          <input type="text" value={sellerCity} onChange={(e) => setSellerCity(e.target.value)} placeholder="Calicut" className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm" />
                        </label>

                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                          Pincode
                          <input type="text" value={sellerPincode} onChange={(e) => setSellerPincode(e.target.value)} placeholder="673001" className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm" />
                        </label>

                        <label className="block text-[10px] uppercase tracking-wider text-textSecondary sm:col-span-2">
                          Bank Account (optional)
                          <input type="text" value={sellerBankAccount} onChange={(e) => setSellerBankAccount(e.target.value)} placeholder="Account number" className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm" />
                        </label>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                      Email or Mobile
                      <input
                        type="text"
                        value={authIdentifier}
                        onChange={(e) => setAuthIdentifier(e.target.value)}
                        placeholder="email@nearnest.in or 9876543210"
                        className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                        required
                      />
                    </label>

                    <div className="sm:col-span-2 flex flex-col gap-3 mt-3">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="loginRole" checked={loginAsRole === 'buyer'} onChange={() => setLoginAsRole('buyer')} />
                          <span className="text-[11px] text-textSecondary">Login as Buyer</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="loginRole" checked={loginAsRole === 'seller'} onChange={() => setLoginAsRole('seller')} />
                          <span className="text-[11px] text-textSecondary">Login as Seller</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <label className="block text-[10px] uppercase tracking-wider text-textSecondary">
                  Password
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="mt-2 w-full rounded-2xl border border-warmborder px-3 py-2 text-sm"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-orange-600 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  {isRegistering ? 'Register & Start Shopping' : 'Login & Continue'}
                </button>
              </form>

              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="mt-3 w-full rounded-2xl border border-orange-200 bg-orange-50 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                {isRegistering ? 'Already have an account? Login' : 'New here? Register now'}
              </button>
            </div>
          )}

          {/* Location Info */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">
              📍 {coords.label || `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={acquireDeviceGPS}
                disabled={loading}
                className="px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-200 transition disabled:opacity-50"
              >
                {loading ? 'Detecting location...' : 'Use current GPS location'}
              </button>
              <button
                type="button"
                onClick={() => selectManualLocation(SEEDED_HUBS[0])}
                className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Set default Calicut hub
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              {SEEDED_HUBS.map((hub) => (
                <button
                  key={hub.label}
                  type="button"
                  onClick={() => selectManualLocation(hub)}
                  className="rounded-full border border-orange-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 transition"
                >
                  {hub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, sellers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-orange-200 rounded-lg hover:bg-orange-50 transition"
            >
              <Filter className="w-4 h-4 text-orange-600" />
            </button>
          </div>

          <div className="mb-4 bg-white border border-orange-100 rounded-3xl p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Switch your view</h2>
                <p className="text-sm text-gray-600">
                  Choose buyer mode to shop nearby, or seller mode to manage your kitchen.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRole('buyer');
                    navigate('/');
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    activeRole === 'buyer'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Buy
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
                      navigate('/checkout');
                    }
                  }}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    activeRole === 'seller'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          {/* Radius Slider */}
          {coords && (
            <div className="mb-3 space-y-3">
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
              
              {/* Location Filter Toggle */}
              <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 rounded-lg border border-orange-200">
                <input
                  type="checkbox"
                  id="locationFilter"
                  checked={filterByLocation}
                  onChange={(e) => setFilterByLocation(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="locationFilter" className="flex-1 cursor-pointer">
                  <p className="text-sm font-semibold text-gray-800">Show nearby products only</p>
                  <p className="text-xs text-gray-600">
                    {filterByLocation 
                      ? 'Filtering to show only products within your radius' 
                      : 'Showing all products, sorted by distance'}
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="sticky top-24 z-30 bg-white border-b border-orange-100 p-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <h3 className="font-semibold text-gray-800 mb-3">Filters</h3>

            {/* Sort */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['distance', 'rating', 'price'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      sortBy === option
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-orange-200 hover:border-orange-600'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Loading State */}
        {isLoading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600">Finding nearby products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error loading products</h3>
              <p className="text-sm text-red-700">{error}</p>
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
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* No Products Found */}
        {coords && !isLoading && !error && products.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found nearby</h3>
            <p className="text-sm text-slate-600 mb-4">
              Your current location does not have listings. Try increasing the radius or selecting a seeded Calicut hub above.
            </p>
            <button
              onClick={() => selectManualLocation(SEEDED_HUBS[0])}
              className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Show Calicut Beach products
            </button>
          </div>
        )}

        {/* No Location */}
        {!coords && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center mb-6">
            <MapPin className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-900 mb-2">Enable Location</h3>
            <p className="text-sm text-amber-700 mb-4">
              Share your location to discover nearby homemade products from local sellers
            </p>
            <LocationPicker
              onLocationSelect={(lat, lng) => selectManualLocation({ lat, lng, label: 'Selected location' })}
              currentLocation={currentLocation}
              isLoading={loading}
            />
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {products.length} products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
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
                    slug: product.seller.slug
                  }}
                  onAddToCart={() => handleAddToCart(product)}
                  isWishlisted={isWishlisted(product._id)}
                  onWishlistToggle={() => toggle({ productId: product._id, title: product.title, image: product.images[0], price: product.discountedPrice || product.price })}
                />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Products'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && coords && !error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try expanding your search radius or changing filters
            </p>
            <button
              onClick={() => setRadiusKm(Math.min(radiusKm + 5, 20))}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Expand Search Radius
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
