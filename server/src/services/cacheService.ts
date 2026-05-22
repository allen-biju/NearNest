interface ICacheItem<T> {
  value: T;
  expiry: number; // timestamp in ms
}

class CacheService {
  private cache = new Map<string, ICacheItem<any>>();

  /**
   * Set cache key with TTL in seconds
   */
  public set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get cached item. Returns null if expired or missing
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Delete key from cache
   */
  public del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  public flush(): void {
    this.cache.clear();
  }

  /**
   * Get dynamic cache bucket key based on spatial coordinates
   * Groups close-by coordinates into buckets to improve cache hit rates
   */
  public getGeoBucketKey(lat: number, lng: number, radiusKm: number, category: string): string {
    // Round coordinates to 2 decimal places (approx 1.1km accuracy) to form bucket keys
    const latBucket = lat.toFixed(2);
    const lngBucket = lng.toFixed(2);
    return `geo:nearby:${latBucket}:${lngBucket}:${radiusKm}:${category || 'all'}`;
  }
}

export const cacheService = new CacheService();
