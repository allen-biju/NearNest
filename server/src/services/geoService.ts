import { Product, Seller } from '../models/Schemas';
import { getRedis } from '../config/redis';
import { generateGeoCacheKey } from '../utils/geo';
import logger from '../config/logger';

/**
 * GeoService: Handles all geospatial queries for nearby discovery
 */
export class GeoService {
  /**
   * Find nearby products within a radius from user's location
   * Can optionally show all products with distance calculation instead of just nearby ones
   */
  static async getNearbyProducts(
    userLat: number,
    userLng: number,
    radiusKm: number = 5,
    filters?: {
      category?: string;
      searchQuery?: string;
      minPrice?: number;
      maxPrice?: number;
      dietaryTags?: string[];
      sortBy?: 'distance' | 'rating' | 'price' | 'new';
      skip?: number;
      limit?: number;
      filterByLocation?: boolean; // true = only nearby, false = all with distance calculation
    }
  ) {
    try {
      const radiusInMeters = radiusKm * 1000;
      const skip = filters?.skip || 0;
      const limit = Math.min(filters?.limit || 20, 100);
      const filterByLocation = filters?.filterByLocation !== false; // Default to true (only nearby)

      // Try to get from cache first (if Redis is available)
      const cacheKey = generateGeoCacheKey(userLat, userLng, radiusKm, filters?.category, 'products');
      const redis = getRedis();
      
      if (redis && filterByLocation) {
        try {
          const cachedResult = await redis.get(cacheKey);
          if (cachedResult && !filters?.searchQuery) {
            const parsed = JSON.parse(cachedResult);
            return {
              ...parsed,
              data: parsed.data.slice(skip, skip + limit)
            };
          }
        } catch (cacheErr) {
          logger.warn('Cache retrieval failed, proceeding without cache', cacheErr);
        }
      }

      // Build aggregation pipeline
      const pipeline: any[] = [];

      if (filterByLocation) {
        // Only nearby products within radius
        pipeline.push({
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceFromUser',
            maxDistance: radiusInMeters,
            spherical: true,
            query: {
              isActive: true,
              stock: { $gt: 0 }
            }
          }
        });
      } else {
        // All products with distance calculation
        pipeline.push({
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceFromUser',
            spherical: true,
            query: {
              isActive: true,
              stock: { $gt: 0 }
            }
          }
        });
      }

      // Add category filter if specified
      if (filters?.category) {
        pipeline.push({ $match: { category: filters.category } });
      }

      // Add text search if query provided
      if (filters?.searchQuery) {
        pipeline.push({
          $match: {
            $text: { $search: filters.searchQuery }
          }
        });
        // Add text score for sorting
        pipeline.push({ $addFields: { textScore: { $meta: 'textScore' } } });
      }

      // Add price filters
      if (filters?.minPrice || filters?.maxPrice) {
        const priceMatch: any = {};
        if (filters.minPrice) priceMatch.$gte = filters.minPrice;
        if (filters.maxPrice) priceMatch.$lte = filters.maxPrice;
        pipeline.push({ $match: { price: priceMatch } });
      }

      // Add dietary tags filter
      if (filters?.dietaryTags && filters.dietaryTags.length > 0) {
        pipeline.push({
          $match: { dietaryTags: { $in: filters.dietaryTags } }
        });
      }

      // Add seller info
      pipeline.push({
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      });
      pipeline.push({ $unwind: '$seller' });
      pipeline.push({
        $match: { 'seller.isApproved': true, 'seller.isOpen': true }
      });

      // Sort - when showing all products, always sort by distance first
      let sortStage: any = {};
      if (filters?.searchQuery) {
        sortStage = { textScore: { $meta: 'textScore' }, distanceFromUser: 1 };
      } else {
        switch (filters?.sortBy) {
          case 'rating':
            sortStage = !filterByLocation ? { distanceFromUser: 1, 'rating.average': -1 } : { 'rating.average': -1, distanceFromUser: 1 };
            break;
          case 'price':
            sortStage = !filterByLocation ? { distanceFromUser: 1, price: 1 } : { price: 1 };
            break;
          case 'new':
            sortStage = !filterByLocation ? { distanceFromUser: 1, createdAt: -1 } : { createdAt: -1 };
            break;
          default:
            sortStage = { distanceFromUser: 1 };
        }
      }
      pipeline.push({ $sort: sortStage });

      // Get count
      const countPipeline = pipeline.slice(0, -1);
      countPipeline.push({ $count: 'total' });
      const countResult = await Product.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const products = await Product.aggregate(pipeline);

      const result = {
        total,
        products: products.map((p) => ({
          ...p,
          distanceFromUser: (p.distanceFromUser / 1000).toFixed(2) + ' km',
          seller: {
            _id: p.seller._id,
            businessName: p.seller.businessName,
            slug: p.seller.slug,
            rating: p.seller.rating,
            badges: p.seller.badges
          }
        }))
      };

      // Cache result (5 minutes) if Redis available and filterByLocation is true
      if (!filters?.searchQuery && redis && filterByLocation) {
        try {
          await redis.setex(cacheKey, 300, JSON.stringify(result));
        } catch (cacheErr) {
          logger.warn('Cache save failed', cacheErr);
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting nearby products:', error);
      throw error;
    }
  }

  /**
   * Find nearby sellers within a radius
   */
  static async getNearbySellers(
    userLat: number,
    userLng: number,
    radiusKm: number = 5,
    filters?: {
      category?: string;
      sortBy?: 'distance' | 'rating' | 'reviews';
      skip?: number;
      limit?: number;
    }
  ) {
    try {
      const radiusInMeters = radiusKm * 1000;
      const skip = filters?.skip || 0;
      const limit = Math.min(filters?.limit || 20, 100);

      // Try cache (if Redis is available)
      const cacheKey = generateGeoCacheKey(userLat, userLng, radiusKm, filters?.category, 'sellers');
      const redis = getRedis();
      
      if (redis) {
        try {
          const cachedResult = await redis.get(cacheKey);
          if (cachedResult) {
            const parsed = JSON.parse(cachedResult);
            return {
              ...parsed,
              data: parsed.data.slice(skip, skip + limit)
            };
          }
        } catch (cacheErr) {
          logger.warn('Cache retrieval failed, proceeding without cache', cacheErr);
        }
      }

      const pipeline: any[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceFromUser',
            maxDistance: radiusInMeters,
            spherical: true,
            query: {
              isApproved: true,
              isOpen: true,
              approvalStatus: 'approved'
            }
          }
        }
      ];

      if (filters?.category) {
        pipeline.push({ $match: { category: filters.category } });
      }

      // Sort
      let sortStage: any = { distanceFromUser: 1 };
      switch (filters?.sortBy) {
        case 'rating':
          sortStage = { 'rating.average': -1 };
          break;
        case 'reviews':
          sortStage = { 'rating.count': -1 };
          break;
      }
      pipeline.push({ $sort: sortStage });

      // Count
      const countPipeline = pipeline.slice(0, -1);
      countPipeline.push({ $count: 'total' });
      const countResult = await Seller.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // Pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const sellers = await Seller.aggregate(pipeline);

      const result = {
        total,
        sellers: sellers.map((s) => ({
          _id: s._id,
          businessName: s.businessName,
          slug: s.slug,
          logo: s.logo,
          banner: s.banner,
          category: s.category,
          deliveryRadiusKm: s.deliveryRadiusKm,
          rating: s.rating,
          badges: s.badges,
          distanceFromUser: (s.distanceFromUser / 1000).toFixed(2) + ' km'
        }))
      };

      // Cache (5 minutes) if Redis available
      if (redis) {
        try {
          await redis.setex(cacheKey, 300, JSON.stringify(result));
        } catch (cacheErr) {
          logger.warn('Cache save failed', cacheErr);
        }
      }

      return result;
    } catch (error) {
      logger.error('Error getting nearby sellers:', error);
      throw error;
    }
  }

  /**
   * Get trending products in user's area (last 48 hours)
   */
  static async getTrendingNearby(
    userLat: number,
    userLng: number,
    radiusKm: number = 5
  ) {
    try {
      const radiusInMeters = radiusKm * 1000;
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const products = await Product.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceFromUser',
            maxDistance: radiusInMeters,
            spherical: true,
            query: {
              isActive: true,
              stock: { $gt: 0 },
              createdAt: { $gte: fortyEightHoursAgo }
            }
          }
        },
        {
          $lookup: {
            from: 'sellers',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: '$seller' },
        { $match: { 'seller.isApproved': true, 'seller.isOpen': true } },
        { $sort: { totalOrders: -1, distanceFromUser: 1 } },
        { $limit: 10 }
      ]);

      return products;
    } catch (error) {
      logger.error('Error getting trending nearby products:', error);
      throw error;
    }
  }

  /**
   * Validate if delivery is possible (buyer address within seller's delivery zone)
   */
  static async validateDeliveryZone(
    sellerId: string,
    buyerLat: number,
    buyerLng: number
  ): Promise<boolean> {
    try {
      const seller = await Seller.findById(sellerId);
      if (!seller) return false;

      const sellerCoords = seller.location.coordinates;
      const deliveryRadiusKm = seller.deliveryRadiusKm;

      // Use MongoDB geospatial query
      const isWithinZone = await Seller.findOne({
        _id: sellerId,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [buyerLng, buyerLat]
            },
            $maxDistance: deliveryRadiusKm * 1000
          }
        }
      });

      return !!isWithinZone;
    } catch (error) {
      logger.error('Error validating delivery zone:', error);
      return false;
    }
  }

  /**
   * Get recommendations for user based on location + purchase history
   */
  static async getPersonalizedRecommendations(
    userId: string,
    userLat: number,
    userLng: number,
    limit: number = 10
  ) {
    try {
      const radiusInMeters = 5000; // 5km default

      // This is a simplified version; in production, you'd also consider user's order history
      const products = await Product.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [userLng, userLat]
            },
            distanceField: 'distanceFromUser',
            maxDistance: radiusInMeters,
            spherical: true,
            query: { isActive: true, stock: { $gt: 0 } }
          }
        },
        {
          $lookup: {
            from: 'sellers',
            localField: 'sellerId',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: '$seller' },
        { $match: { 'seller.isApproved': true, 'seller.isOpen': true } },
        {
          $addFields: {
            // Scoring algorithm
            score: {
              $add: [
                { $multiply: [{ $divide: ['$rating.average', 5] }, 0.35] }, // Rating: 35%
                { $multiply: [{ $divide: [1, { $add: ['$distanceFromUser', 1] }] }, 100, 0.3] }, // Distance: 30%
                { $multiply: [{ $divide: ['$totalOrders', 1000] }, 0.2] }, // Popularity: 20%
                { $cond: ['$isPromoted', 0.15, 0] } // Promotion bonus: 15%
              ]
            }
          }
        },
        { $sort: { score: -1, distanceFromUser: 1 } },
        { $limit: limit }
      ]);

      return products;
    } catch (error) {
      logger.error('Error getting personalized recommendations:', error);
      throw error;
    }
  }
}

export default GeoService;
