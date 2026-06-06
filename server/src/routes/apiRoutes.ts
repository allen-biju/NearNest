import { Router } from 'express';
import { requireAuth, requireSeller, requireAdmin } from '../middleware/auth';
import { globalLimiter, authLimiter, apiLimiter } from '../middleware/rateLimiter';
import { handleValidationErrors } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';
import * as geoController from '../controllers/geoController';
import * as productController from '../controllers/productController';
import * as sellerController from '../controllers/sellerController';
import * as orderController from '../controllers/orderController';
import * as adminController from '../controllers/adminController';

const router = Router();

// Apply rate limiting
router.use(globalLimiter);

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', requireAuth, authController.getCurrentUser);
router.post('/auth/otp/send', authLimiter, authController.sendOTP);
router.post('/auth/otp/verify', authLimiter, authController.verifyOTP);
router.post('/auth/address', requireAuth, authController.updateAddress);

// ============================================================
// GEO / DISCOVERY ROUTES (Core feature of NearNest)
// ============================================================
router.get('/geo/nearby-products', geoController.getNearbyProducts);
router.get('/geo/nearby-sellers', geoController.getNearbySellers);
router.get('/geo/trending', geoController.getTrendingNearby);
router.get('/geo/recommendations', requireAuth, geoController.getRecommendations);

// ============================================================
// PRODUCT ROUTES
// ============================================================
router.post('/products', requireAuth, requireSeller, productController.createProduct);
router.get('/products/:id', geoController.getProduct);
router.put('/products/:id', requireAuth, requireSeller, productController.updateProduct);
router.delete('/products/:id', requireAuth, requireSeller, productController.deleteProduct);
router.get('/products/category/:slug', geoController.getProductsByCategory);
router.get('/search', geoController.searchProducts);

// ============================================================
// SELLER ROUTES
// ============================================================
router.get('/sellers/settings', requireAuth, sellerController.getSellerSettings);
router.put('/sellers/settings', requireAuth, requireSeller, sellerController.updateStoreSettings);
router.put('/sellers/location', requireAuth, requireSeller, sellerController.updateSellerLocation);
router.get('/sellers/metrics', requireAuth, sellerController.getSellerMetrics);
router.get('/sellers/analytics', requireAuth, requireSeller, sellerController.getSellerAnalytics);
router.get('/sellers/products', requireAuth, requireSeller, sellerController.getSellerProducts);
router.post('/sellers/apply', requireAuth, sellerController.applyAsSeller);
router.get('/sellers/:slug', sellerController.getSellerStorefront);

// ============================================================
// ORDER ROUTES
// ============================================================
router.post('/orders', requireAuth, orderController.placeOrder);
router.get('/orders/seller', requireAuth, requireSeller, orderController.getSellerOrders);
router.get('/orders', requireAuth, orderController.getBuyerOrders);
router.put('/orders/:id/status', requireAuth, requireSeller, orderController.updateOrderStatus);

// ============================================================
// ADMIN ROUTES  (specific paths before parameterized ones)
// ============================================================
router.get('/admin/metrics',              requireAuth, requireAdmin, adminController.getAdminDashboard);
router.get('/admin/users',                requireAuth, requireAdmin, adminController.listAllUsers);
router.get('/admin/orders',               requireAuth, requireAdmin, adminController.listAllOrders);

// Sellers
router.get('/admin/sellers',              requireAuth, requireAdmin, adminController.listAllSellers);
router.get('/admin/sellers/pending',      requireAuth, requireAdmin, adminController.getPendingSellers);
router.put('/admin/sellers/:id',          requireAuth, requireAdmin, adminController.approveOrRejectSeller);
router.put('/admin/sellers/:id/status',   requireAuth, requireAdmin, adminController.updateSellerStatus);

// Products
router.get('/admin/products',             requireAuth, requireAdmin, adminController.listAllProducts);
router.put('/admin/products/:id/status',  requireAuth, requireAdmin, adminController.updateProductStatus);
router.delete('/admin/products/:id',      requireAuth, requireAdmin, adminController.deleteProduct);

// Reviews
router.get('/admin/reviews',              requireAuth, requireAdmin, adminController.listAllReviews);
router.put('/admin/reviews/:id/visibility', requireAuth, requireAdmin, adminController.toggleReviewVisibility);
router.delete('/admin/reviews/:id',       requireAuth, requireAdmin, adminController.deleteReview);

export default router;
