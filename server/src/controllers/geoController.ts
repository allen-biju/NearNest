import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product, Seller } from '../models/Schemas';
import GeoService from '../services/geoService';
import { sendSuccess, sendError, getPaginationParams, createPaginationResponse } from '../utils/response';
import { optionalAuth } from '../middleware/auth';
import logger from '../config/logger';

/**
 * Get nearby products
 * GET /api/v1/geo/nearby-products?lat=&lng=&radius=&category=&sort=distance&page=1&limit=20
 */
export const getNearbyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius = 5, category, sort = 'distance', searchQuery, search, minPrice, maxPrice, dietaryTags, filterByLocation = 'true' } = req.query;
    const { page, limit, skip } = getPaginationParams(req);
    const normalizedSearchQuery = (searchQuery as string) || (search as string);
    const shouldFilterByLocation = filterByLocation !== 'false';

    if (!lat || !lng) {
      return sendError(res, 'INVALID_LOCATION', 'Latitude and longitude required', 400);
    }

    const result = await GeoService.getNearbyProducts(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(radius as string) || 5,
      {
        category: category as string,
        searchQuery: normalizedSearchQuery as string,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        dietaryTags: dietaryTags ? (dietaryTags as string).split(',') : undefined,
        sortBy: sort as any,
        skip,
        limit,
        filterByLocation: shouldFilterByLocation
      }
    );

    const pagination = createPaginationResponse(result.total, page, limit);

    return sendSuccess(res, result.products, 'Products retrieved', 200, pagination);
  } catch (error: any) {
    logger.error('Get nearby products error:', error);
    return sendError(res, 'GEO_ERROR', error.message, 400);
  }
};

/**
 * Get nearby sellers
 * GET /api/v1/geo/nearby-sellers?lat=&lng=&radius=&category=
 */
export const getNearbySellers = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius = 5, category } = req.query;
    const { page, limit, skip } = getPaginationParams(req);

    if (!lat || !lng) {
      return sendError(res, 'INVALID_LOCATION', 'Latitude and longitude required', 400);
    }

    const result = await GeoService.getNearbySellers(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(radius as string) || 5,
      {
        category: category as string,
        skip,
        limit
      }
    );

    const pagination = createPaginationResponse(result.total, page, limit);

    return sendSuccess(res, result.sellers, 'Nearby sellers retrieved', 200, pagination);
  } catch (error: any) {
    logger.error('Get nearby sellers error:', error);
    return sendError(res, 'GEO_ERROR', error.message, 400);
  }
};

/**
 * Get trending products nearby
 * GET /api/v1/geo/trending?lat=&lng=&radius=5
 */
export const getTrendingNearby = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return sendError(res, 'INVALID_LOCATION', 'Latitude and longitude required', 400);
    }

    const products = await GeoService.getTrendingNearby(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(radius as string) || 5
    );

    return sendSuccess(res, products, 'Trending products retrieved');
  } catch (error: any) {
    logger.error('Get trending nearby error:', error);
    return sendError(res, 'GEO_ERROR', error.message, 400);
  }
};

/**
 * Get personalized recommendations
 * GET /api/v1/geo/recommendations?lat=&lng=&limit=10
 */
export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, limit = 10 } = req.query;

    if (!lat || !lng) {
      return sendError(res, 'INVALID_LOCATION', 'Latitude and longitude required', 400);
    }

    if (!req.user) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const products = await GeoService.getPersonalizedRecommendations(
      req.user._id,
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseInt(limit as string) || 10
    );

    return sendSuccess(res, products, 'Recommendations retrieved');
  } catch (error: any) {
    logger.error('Get recommendations error:', error);
    return sendError(res, 'GEO_ERROR', error.message, 400);
  }
};

/**
 * Get products by category
 * GET /api/v1/products/category/:slug?lat=&lng=&radius=5&sort=distance
 */
export const getProductsByCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const { lat, lng, radius = 5, sort = 'distance' } = req.query;
    const { page, limit, skip } = getPaginationParams(req);

    const result = await GeoService.getNearbyProducts(
      parseFloat(lat as string) || 0,
      parseFloat(lng as string) || 0,
      parseInt(radius as string) || 5,
      {
        category: slug,
        sortBy: sort as any,
        skip,
        limit
      }
    );

    const pagination = createPaginationResponse(result.total, page, limit);

    return sendSuccess(res, result.products, `Products in ${slug}`, 200, pagination);
  } catch (error: any) {
    logger.error('Get products by category error:', error);
    return sendError(res, 'GEO_ERROR', error.message, 400);
  }
};

/**
 * Search products
 * GET /api/v1/search?q=&lat=&lng=&radius=5
 */
export const searchProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { q, lat, lng, radius = 5 } = req.query;
    const { page, limit, skip } = getPaginationParams(req);

    if (!q) {
      return sendError(res, 'QUERY_REQUIRED', 'Search query required', 400);
    }

    const result = await GeoService.getNearbyProducts(
      parseFloat(lat as string) || 0,
      parseFloat(lng as string) || 0,
      parseInt(radius as string) || 5,
      {
        searchQuery: q as string,
        skip,
        limit
      }
    );

    const pagination = createPaginationResponse(result.total, page, limit);

    return sendSuccess(res, result.products, 'Search results', 200, pagination);
  } catch (error: any) {
    logger.error('Search products error:', error);
    return sendError(res, 'SEARCH_ERROR', error.message, 400);
  }
};

/**
 * Get single product
 * GET /api/v1/products/:id
 */
export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true }).populate('sellerId');

    if (!product) {
      return sendError(res, 'NOT_FOUND', 'Product not found', 404);
    }

    return sendSuccess(res, product, 'Product retrieved');
  } catch (error: any) {
    logger.error('Get product error:', error);
    return sendError(res, 'ERROR', error.message, 400);
  }
};

export default {
  getNearbyProducts,
  getNearbySellers,
  getTrendingNearby,
  getRecommendations,
  getProductsByCategory,
  searchProducts,
  getProduct
};
