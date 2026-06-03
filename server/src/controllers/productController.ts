import { Response } from 'express';
import { Product, Seller } from '../models/Schemas';
import { AuthRequest, IAuthRequest } from '../middleware/auth';
import { RecommendationService } from '../services/recommendationService';
import { uploadToCloudinary } from '../config/cloudinary';

// Default Hub: Kozhikode, Kerala
const DEFAULT_LAT = 11.2588;
const DEFAULT_LNG = 75.7804;

export const createProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller || !seller.isApproved) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED_SELLER', message: 'Only approved sellers can add products' } });
    }

    const {
      title, description, ingredients, allergens, images, category, subCategory,
      tags, dietaryTags, price, discountedPrice, unit, stock, isUnlimitedStock,
      preparationTimeMinutes, availableDays, isCustomizable, customizationOptions
    } = req.body;

    if (!title || !price || !unit || stock === undefined) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Title, price, unit, and stock are required' } });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const resolvedImages: string[] = [];
    if (Array.isArray(images) && images.length) {
      for (const image of images) {
        if (typeof image === 'string' && image.startsWith('data:')) {
          try {
            const upload = await uploadToCloudinary(image, 'nearnest/products');
            resolvedImages.push(upload.url);
          } catch (uploadError) {
            console.warn('Cloudinary upload failed, using raw image data as fallback');
            resolvedImages.push(image);
          }
        } else if (typeof image === 'string') {
          resolvedImages.push(image);
        }
      }
    }

    const product = new Product({
      sellerId: seller._id,
      title,
      slug,
      description,
      ingredients,
      allergens: allergens || [],
      images: resolvedImages.length ? resolvedImages : ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
      category,
      subCategory,
      tags: tags || [],
      dietaryTags: dietaryTags || [],
      price,
      discountedPrice,
      unit,
      stock,
      isUnlimitedStock: !!isUnlimitedStock,
      preparationTimeMinutes: preparationTimeMinutes || 30,
      availableDays: availableDays || ['Everyday'],
      isCustomizable: !!isCustomizable,
      customizationOptions: customizationOptions || [],
      location: seller.location // Denormalized coordinates from seller for geoNear queries
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product listing added successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listProducts = async (req: IAuthRequest, res: Response) => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lng = Number(req.query.lng) || DEFAULT_LNG;
    const radius = Number(req.query.radius) || 5; // Default radius: 5km
    const category = req.query.category as string;
    const searchQuery = req.query.q as string;
    const sort = req.query.sort as any; // 'distance', 'rating', 'price_asc', 'price_desc', 'recommended'
    
    const dietaryTags: string[] = [];
    if (req.query.dietary) {
      dietaryTags.push(...(req.query.dietary as string).split(','));
    }

    const products = await RecommendationService.getNearbyProducts({
      lat,
      lng,
      radiusKm: radius,
      category,
      searchQuery,
      dietaryTags,
      sort
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        radiusKm: radius,
        count: products.length,
        center: [lng, lat]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getProductById = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('sellerId');
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Increment view count asynchronously
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Verify ownership
    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller || product.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized modification' } });
    }

    Object.assign(product, req.body);
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const deleteProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller || product.sellerId.toString() !== seller._id.toString()) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized action' } });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product listing removed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
