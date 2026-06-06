import { Response } from 'express';
import { Seller, User, Order, Product, Review } from '../models/Schemas';
import { AuthRequest, IAuthRequest } from '../middleware/auth';

export const getAdminDashboard = async (req: IAuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await Seller.countDocuments({ approvalStatus: 'approved' });
    const pendingSellers = await Seller.countDocuments({ approvalStatus: 'pending' });
    const orders = await Order.find();

    const revenueToday = orders.reduce((sum, order) => sum + order.total, 0);
    const commissionsEarned = orders.reduce((sum, order) => sum + (order.commissionAmount || 0), 0);
    
    // Group categories
    const products = await Product.find();
    const categoriesMap = products.reduce((acc: any, prod) => {
      acc[prod.category] = (acc[prod.category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.keys(categoriesMap).map(cat => ({
      name: cat,
      value: categoriesMap[cat]
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          users: totalUsers,
          sellers: totalSellers,
          pendingApprovals: pendingSellers,
          revenueToday,
          commissions: commissionsEarned,
          activeOrders: orders.filter(o => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length
        },
        topCategories
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getPendingSellers = async (req: IAuthRequest, res: Response) => {
  try {
    const pending = await Seller.find({ approvalStatus: 'pending' }).populate('userId');
    res.status(200).json({ success: true, data: pending });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const approveOrRejectSeller = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller application sheet not found' } });
    }

    if (action === 'approve') {
      seller.isApproved = true;
      seller.approvalStatus = 'approved';
      seller.badges.push('verified');

      // Bind the seller role to the user!
      const user = await User.findById(seller.userId);
      if (user && !user.role.includes('seller')) {
        user.role.push('seller');
        await user.save();
      }
    } else if (action === 'reject') {
      seller.isApproved = false;
      seller.approvalStatus = 'rejected';
      seller.rejectionReason = reason || 'Documents do not match our standard safety checks';
    }

    await seller.save();

    res.status(200).json({
      success: true,
      data: seller,
      message: `Seller status updated: ${action.toUpperCase()}D successfully!`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listAllUsers = async (req: IAuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listAllOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const orders = await Order.find().populate('buyerId').populate('sellerId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listAllSellers = async (req: IAuthRequest, res: Response) => {
  try {
    const sellers = await Seller.find().populate('userId');
    res.status(200).json({ success: true, data: sellers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateSellerStatus = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body; // 'approved', 'suspended', 'rejected'
    
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller not found' } });
    }
    
    seller.approvalStatus = approvalStatus;
    seller.isApproved = approvalStatus === 'approved';
    if (rejectionReason) seller.rejectionReason = rejectionReason;
    
    // Handle user role based on approval status
    const user = await User.findById(seller.userId);
    if (user) {
      if (approvalStatus !== 'approved') {
        user.role = user.role.filter(r => r !== 'seller');
      } else if (!user.role.includes('seller')) {
        user.role.push('seller');
      }
      await user.save();
    }
    
    await seller.save();
    res.status(200).json({ success: true, data: seller, message: `Seller status updated to ${approvalStatus}` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listAllProducts = async (req: IAuthRequest, res: Response) => {
  try {
    const products = await Product.find().populate('sellerId');
    res.status(200).json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateProductStatus = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, isFeatured, isPromoted } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }
    
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isPromoted !== undefined) product.isPromoted = isPromoted;
    
    await product.save();
    res.status(200).json({ success: true, data: product, message: 'Product status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const deleteProduct = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const listAllReviews = async (req: IAuthRequest, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate('buyerId', 'name email')
      .populate('sellerId', 'businessName')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const toggleReviewVisibility = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVisible, isFlagged } = req.body;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    }
    
    if (isVisible !== undefined) review.isVisible = isVisible;
    if (isFlagged !== undefined) review.isFlagged = isFlagged;
    
    await review.save();
    res.status(200).json({ success: true, data: review, message: 'Review status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const deleteReview = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Review.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
