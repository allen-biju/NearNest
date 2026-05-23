import { Router } from 'express';
import { requireAuth, requireSeller, requireAdmin } from '../middleware/auth';
import { globalLimiter, authLimiter, apiLimiter } from '../middleware/rateLimiter';
import { handleValidationErrors } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';
import * as geoController from '../controllers/geoController';
import * as orderController from '../controllers/orderController';

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
router.get('/products/:id', geoController.getProduct);
router.get('/products/category/:slug', geoController.getProductsByCategory);
router.get('/search', geoController.searchProducts);

// ============================================================
// SELLER ROUTES (To be implemented)
// ============================================================
// router.post('/sellers/apply', requireAuth, sellerController.applySeller);
// router.get('/sellers/:slug', sellerController.getSellerStorefront);

// ============================================================
// ORDER ROUTES
// ============================================================
router.post('/orders', requireAuth, orderController.placeOrder);
router.get('/orders', requireAuth, orderController.getBuyerOrders);
router.put('/orders/:id/status', requireAuth, requireSeller, orderController.updateOrderStatus);

// ============================================================
// ADMIN ROUTES (To be implemented)
// ============================================================
// router.get('/admin/dashboard', requireAuth, requireAdmin, adminController.getDashboard);

export default router;
