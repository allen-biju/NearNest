import { Product, Seller, IProduct } from '../models/Schemas';

export class RecommendationService {
  /**
   * Search active products within a given radius using MongoDB geospatial aggregation.
   * Returns products with computed distance and integrated seller profiles.
   */
  public static async getNearbyProducts(params: {
    lat: number;
    lng: number;
    radiusKm: number;
    category?: string;
    searchQuery?: string;
    dietaryTags?: string[];
    sort?: 'distance' | 'rating' | 'price_asc' | 'price_desc' | 'recommended';
  }) {
    const { lat, lng, radiusKm, category, searchQuery, dietaryTags, sort = 'recommended' } = params;
    const radiusInMeters = radiusKm * 1000;

    // Build the query object inside geoNear
    const queryConditions: any = { isActive: true };

    if (category && category !== 'all') {
      queryConditions.category = category;
    }

    if (dietaryTags && dietaryTags.length > 0) {
      queryConditions.dietaryTags = { $in: dietaryTags };
    }

    if (searchQuery) {
      // Use case-insensitive regex for basic text search
      queryConditions.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Aggregation pipeline starting with $geoNear
    const pipeline: any[] = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceFromUser', // Output field in meters
          maxDistance: radiusInMeters,
          spherical: true,
          query: queryConditions
        }
      },
      // Add distance in kilometers
      {
        $addFields: {
          distanceKm: { $divide: ['$distanceFromUser', 1000] }
        }
      },
      // Lookup Seller details
      {
        $lookup: {
          from: 'sellers',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' }
    ];

    // Sorting stage
    if (sort === 'distance') {
      pipeline.push({ $sort: { distanceKm: 1 } });
    } else if (sort === 'rating') {
      pipeline.push({ $sort: { 'rating.average': -1, totalOrders: -1 } });
    } else if (sort === 'price_asc') {
      pipeline.push({ $sort: { price: 1 } });
    } else if (sort === 'price_desc') {
      pipeline.push({ $sort: { price: -1 } });
    } else {
      // Default: Recommended. Sort by distance, but also factor in rating and popularity.
      // We will perform in-memory ranking or Mongo projections. Let's do a smart Mongo sort or manual scoring.
      pipeline.push({ $sort: { distanceKm: 1, 'rating.average': -1 } });
    }

    const results = await Product.aggregate(pipeline);
    
    // Compute recommendations in-memory based on formula
    if (sort === 'recommended') {
      return results.map(item => {
        const rating = item.rating?.average || 5;
        const totalOrders = item.totalOrders || 0;
        
        // Invert distance: closer items get higher score (max radius is radiusKm)
        const distScore = Math.max(0, 1 - (item.distanceKm / radiusKm));
        const ratScore = rating / 5;
        const popScore = Math.min(1, totalOrders / 100); // capped popularity
        
        const recommendationScore = (0.50 * distScore) + (0.30 * ratScore) + (0.20 * popScore);
        return { ...item, recommendationScore };
      }).sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    return results;
  }

  /**
   * Search active sellers within a given radius using MongoDB geospatial aggregation.
   */
  public static async getNearbySellers(lat: number, lng: number, radiusKm: number, category?: string) {
    const radiusInMeters = radiusKm * 1000;
    const queryConditions: any = { isApproved: true, approvalStatus: 'approved' };

    if (category && category !== 'all') {
      queryConditions.category = category;
    }

    const pipeline = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceFromUser',
          maxDistance: radiusInMeters,
          spherical: true,
          query: queryConditions
        }
      },
      {
        $addFields: {
          distanceKm: { $divide: ['$distanceFromUser', 1000] }
        }
      },
      { $sort: { distanceKm: 1 } }
    ];

    return await Seller.aggregate(pipeline);
  }
}
