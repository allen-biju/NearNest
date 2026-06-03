import { useState } from 'react';

export interface NearbyProduct {
  _id: string;
  title: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  rating: { average: number; count: number };
  distanceFromUser: string;
  seller: { businessName: string; slug: string };
  sellerId: string;
  unit?: string;
  preparationTimeMinutes?: number;
}

interface FetchFilters {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  searchQuery?: string;
  sortBy?: 'distance' | 'rating' | 'price';
  filterByLocation?: boolean; // New parameter
  page?: number;
}

interface UseNearbyProductsReturn {
  products: NearbyProduct[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  fetchNearbyProducts: (filters: FetchFilters) => Promise<void>;
}

export const useNearbyProducts = (): UseNearbyProductsReturn => {
  const [products, setProducts] = useState<NearbyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchNearbyProducts = async (filters: FetchFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        lat,
        lng,
        radius = 5,
        category,
        searchQuery,
        sortBy = 'distance',
        filterByLocation = true,
        page = 1
      } = filters;

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        filterByLocation: filterByLocation.toString()
      });

      if (category) {
        params.append('category', category);
      }

      if (searchQuery) {
        params.append('searchQuery', searchQuery);
      }

      const apiRoot = import.meta.env.VITE_API_URL?.trim() || '/api/v1';
      const endpoint = `${apiRoot}/geo/nearby-products?${params}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setProducts(data.data);
        } else {
          setProducts((prev) => [...prev, ...data.data]);
        }
        setHasNextPage(data.pagination?.hasNext || false);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    hasNextPage,
    fetchNearbyProducts
  };
};

export default useNearbyProducts;
