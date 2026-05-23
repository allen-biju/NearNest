# Two-Interface Architecture Implementation

## Overview
NearNest now has two distinct user interfaces:
1. **Buyer Interface** - For purchasing products from nearby sellers
2. **Seller Interface** - For managing and selling products
3. **Admin Interface** - For platform management (bonus)

## File Structure

### New Dashboard Pages
- **`BuyerDashboard.tsx`** - Buyer's personal dashboard with:
  - Profile information
  - Wallet balance
  - Saved delivery addresses
  - Recent orders
  - Quick access to shopping

- **`SellerDashboard.tsx`** - Seller's store management dashboard with:
  - Store status (open/closed toggle)
  - Business metrics (sales, customers, ratings)
  - Add new products form
  - Recent orders from customers
  - Store configuration

- **`AdminDashboard.tsx`** - Platform administrator dashboard with:
  - Platform metrics
  - Pending seller approvals
  - User management
  - Order monitoring

## Smart Routing System

### DashboardRouter Component
A smart router in `App.tsx` that automatically routes users to the appropriate dashboard based on their `activeRole`:

```
/dashboard → DashboardRouter → 
  ├─ Buyer role → BuyerDashboard
  ├─ Seller role → SellerDashboard
  └─ Admin role → AdminDashboard
```

Direct routes also available:
- `/buyer-dashboard` → BuyerDashboard
- `/seller-dashboard` → SellerDashboard
- `/admin-dashboard` → AdminDashboard

## Navigation Changes

### Context-Aware Mobile Navigation
The bottom navigation bar now shows different tabs based on the active role:

**Buyer Mode:**
- 👤 Discover - Product discovery
- 🛒 Cart - Shopping cart
- 📦 Orders - Order tracking
- 👤 Profile - User dashboard
- Mode Selector (buyer/seller/admin)

**Seller Mode:**
- 🛍️ Products - Manage products
- 📦 Orders - Customer orders
- 👤 Profile - Store dashboard
- Mode Selector (buyer/seller/admin)

**Admin Mode:**
- 🛡️ Admin - Admin dashboard
- 👤 Profile - Admin controls
- Mode Selector (buyer/seller/admin)

## Role System

The system uses the existing `activeRole` state in `AuthContext` to determine which interface to show. Users can switch roles using the Mode Selector dropdown if they have multiple roles.

### User Roles
- **buyer** - Can purchase products (all users)
- **seller** - Can sell products (role-based)
- **admin/superadmin** - Can manage platform (role-based)

## Updated Routes

```
GET /api/v1/orders/buyer - Fetch buyer's orders
GET /api/v1/orders/seller - Fetch seller's orders
GET /api/v1/sellers/settings - Fetch seller settings
GET /api/v1/sellers/metrics - Fetch seller metrics
POST /api/v1/products - Create new product
PUT /api/v1/sellers/status - Toggle store open/closed
GET /api/v1/admin/metrics - Admin metrics
GET /api/v1/admin/sellers/pending - Pending sellers
GET /api/v1/admin/users - All users
GET /api/v1/admin/orders - All orders
```

## Key Features

### Buyer Dashboard
- View profile information
- Manage wallet balance
- Save multiple delivery addresses
- View order history
- Direct access to product discovery

### Seller Dashboard
- Toggle store open/closed status
- View key metrics (sales, customers, rating)
- Add new products with details
- Monitor customer orders
- Store configuration

### Admin Dashboard
- Platform-wide metrics
- Approve/reject pending sellers
- Manage users
- Monitor all orders

## User Experience Flow

1. **Unauthenticated User** → Buyer interface (product discovery)
2. **Buyer User** → Clicks Dashboard → BuyerDashboard
3. **Seller User** → Clicks Dashboard → SellerDashboard (if activeRole='seller')
4. **Multi-role User** → Can switch between roles using Mode Selector
5. **Admin User** → Clicks Dashboard → AdminDashboard (if activeRole='admin')

## Customization & Extension

Each dashboard can be further customized with:
- Analytics and charts
- Product recommendations
- Advanced filters and search
- Inventory management
- Commission tracking
- Customer reviews and ratings
- Performance analytics

The modular structure makes it easy to add role-specific features without affecting other interfaces.
