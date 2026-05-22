import { Response } from 'express';
import { Seller, Product, Order, User } from '../models/Schemas';
import { IAuthRequest } from '../middleware/auth';
import { RecommendationService } from '../services/recommendationService';

// Default Hub: Kozhikode
const DEFAULT_LAT = 11.2588;
const DEFAULT_LNG = 75.7804;

export const applyAsSeller = async (req: IAuthRequest, res: Response) => {
  try {
    const {
      businessName, description, category, address, lat, lng,
      bankAccountHolder, bankAccountNumber, bankIfscCode, bankName, gstNumber
    } = req.body;

    if (!businessName || !category || !address || !lat || !lng || !bankAccountNumber || !bankIfscCode) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Incomplete seller onboarding details' } });
    }

    if (!req.user) return res.status(401);

    const existingSeller = await Seller.findOne({ userId: req.user._id });
    if (existingSeller) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'You have already applied or registered as a seller' } });
    }

    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const seller = new Seller({
      userId: req.user._id,
      businessName,
      slug,
      description,
      category,
      subCategories: [],
      location: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)] as [number, number]
      },
      address,
      deliveryRadiusKm: 5,
      deliveryOptions: ['self-delivery', 'pickup'],
      baseDeliveryFee: 20,
      perKmRate: 5,
      maxDeliveryFee: 80,
      deliverySlots: [
        {
          day: 'Everyday',
          slots: [
            { from: '09:00', to: '12:00', capacity: 10 },
            { from: '12:00', to: '15:00', capacity: 10 },
            { from: '15:00', to: '18:00', capacity: 10 },
            { from: '18:00', to: '21:00', capacity: 10 }
          ]
        }
      ],
      operatingHours: [
        { day: 'Monday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Tuesday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Wednesday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Thursday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Friday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Saturday', open: '09:00', close: '21:00', isClosed: false },
        { day: 'Sunday', open: '09:00', close: '21:00', isClosed: false }
      ],
      isOpen: true,
      isApproved: false,
      approvalStatus: 'pending',
      documents: {
        idProof: 'https://images.unsplash.com/photo-1554774853-719586f82d77?w=300', // Mock doc link
        foodLicense: category === 'food' || category === 'bakery' || category === 'beverages' || category === 'snacks' 
          ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300' 
          : undefined,
        gstNumber
      },
      bankDetails: {
        accountHolder: bankAccountHolder || req.user.name,
        accountNumber: bankAccountNumber,
        ifscCode: bankIfscCode,
        bankName: bankName || 'State Bank of India'
      },
      subscription: { plan: 'free' }
    });

    await seller.save();

    // Automatically make user a seller (for developer testing convenience, or wait for admin approval)
    // In production we wait, but we can also let admins approve them via `/admin` panel!
    
    res.status(201).json({
      success: true,
      data: seller,
      message: 'Your seller application has been submitted successfully and is pending admin approval!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listSellers = async (req: IAuthRequest, res: Response) => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lng = Number(req.query.lng) || DEFAULT_LNG;
    const radius = Number(req.query.radius) || 5;
    const category = req.query.category as string;

    const sellers = await RecommendationService.getNearbySellers(lat, lng, radius, category);

    res.status(200).json({
      success: true,
      data: sellers
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getSellerStorefront = async (req: IAuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const seller = await Seller.findOne({ slug });
    if (!seller) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller not found' } });
    }

    const products = await Product.find({ sellerId: seller._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        seller,
        products
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateStoreSettings = async (req: IAuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Seller profile not found' } });
    }

    Object.assign(seller, req.body);
    await seller.save();

    // If locations are updated, sync all product coordinates to enable accurate geospatial searches!
    if (req.body.location) {
      await Product.updateMany({ sellerId: seller._id }, { location: seller.location });
    }

    res.status(200).json({
      success: true,
      data: seller,
      message: 'Storefront configurations updated!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getSellerAnalytics = async (req: IAuthRequest, res: Response) => {
  try {
    const seller = await Seller.findOne({ userId: req.user?._id });
    if (!seller) {
      return res.status(403).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Seller profile not found' } });
    }

    const orders = await Order.find({ sellerId: seller._id });
    const products = await Product.find({ sellerId: seller._id });

    // Sum earnings and calculate chart milestones
    const totalOrdersCount = orders.length;
    const activeOrdersCount = orders.filter(o => ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
    const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;

    // Daily revenue distribution
    const revenueByDay = orders.reduce((acc: any, order) => {
      const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + (order.sellerEarnings || 0);
      return acc;
    }, { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 });

    const chartData = Object.keys(revenueByDay).map(day => ({
      day,
      earnings: revenueByDay[day]
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          revenue: seller.totalRevenue,
          orders: totalOrdersCount,
          activeOrders: activeOrdersCount,
          completedOrders: completedOrdersCount,
          rating: seller.rating.average,
          productsCount: products.length
        },
        chartData
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
