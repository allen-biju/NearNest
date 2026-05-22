import { useEffect, useState } from 'react';
import { MapPin, Search, Filter, Loader, AlertCircle } from 'lucide-react';
import LocationPicker from '../components/discovery/LocationPicker';
import RadiusSlider from '../components/discovery/RadiusSlider';
import ProductCard from '../components/discovery/ProductCard';
import { useGeolocator } from '../hooks/useGeolocator';
import { useNearbyProducts } from '../hooks/useNearbyProducts';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/api';

export default function Home() {
  const { coords, radiusKm, setRadiusKm } = useGeolocator();
  const { products, isLoading, error, hasNextPage, fetchNearbyProducts } =
    useNearbyProducts();
  const { addToCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [showFilters, setShowFilters] = useState(false);

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
      };
      fetchNearbyProducts(filters);
    }
  }, [coords, radiusKm, selectedCategory, sortBy]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        if (coords) {
          fetchNearbyProducts({
            lat: coords.lat,
            lng: coords.lng,
            radius: radiusKm,
            searchQuery: query || undefined,
          });
        }
      }, 500)
    );
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product._id,
      sellerId: product.sellerId,
      title: product.title,
      image: product.images[0],
      price: product.discountedPrice || product.price,
      quantity: 1,
    });
  };

  const handleLoadMore = () => {
    if (coords) {
      fetchNearbyProducts(
        {
          lat: coords.lat,
          lng: coords.lng,
          radius: radiusKm,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          searchQuery: searchQuery || undefined,
          sortBy,
        },
        true // append mode
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-orange-600">NearNest</h1>
            <MapPin className="w-5 h-5 text-green-600" />
          </div>

          {/* Location Info */}
          {coords ? (
            <div className="text-xs text-gray-600 mb-3">
              📍 {coords.label || `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`}
            </div>
          ) : (
            <div className="mb-3">
              <LocationPicker />
            </div>
          )}

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

          {/* Radius Slider */}
          {coords && (
            <div className="mb-3">
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
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
                  })
                }
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try again
              </button>
            </div>
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
            <LocationPicker />
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
