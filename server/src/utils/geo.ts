interface LocationBucketKey {
  lat: number;
  lng: number;
}

/**
 * Round coordinates to 2 decimal places for caching location buckets
 * Precision: ~1.1km at equator
 */
export const getLocationBucket = (lat: number, lng: number): LocationBucketKey => {
  return {
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Generate cache key for nearby products/sellers
 */
export const generateGeoCacheKey = (
  lat: number,
  lng: number,
  radiusKm: number,
  category?: string,
  type: 'products' | 'sellers' = 'products'
): string => {
  const bucket = getLocationBucket(lat, lng);
  const key = `geo:${type}:${bucket.lat}:${bucket.lng}:${radiusKm}`;
  return category ? `${key}:${category}` : key;
};
