# Location-Based Features Guide

## Overview

Your NearNest platform now fully supports location-based indie business discovery! Here's what's been implemented:

---

## 🏪 For Sellers: Managing Your Location

### During Registration
When registering as a seller, you'll be asked to provide:
- **Business Location**: Enter your coordinates (latitude/longitude) or use GPS detection
- **Address**: Full address details (street, city, state, pincode)

**Important**: Your location determines where your products will appear in buyer searches!

### Updating Your Location Anytime

1. **Navigate to Settings**
   - Click the ⚙️ Settings icon in the top-right of your Seller Hub
   - Or go directly to `/seller-settings`

2. **Location Tab**
   - **Auto-detect**: Click "📍 Detect My Current Location" button
   - **Manual Entry**: Enter coordinates directly
   - **Address**: Update your full address
   - Click "Save Location" button

**Important**: When you update your location, ALL your products automatically sync to the new location for accurate distance calculations!

### Delivery Configuration

In the **Delivery Tab**, you can set:
- **Delivery Radius**: How far you can deliver (in km)
- **Base Fee**: Fixed delivery charge
- **Per KM Rate**: Additional charge per kilometer
- **Max Fee Cap**: Maximum delivery charge regardless of distance

---

## 🛍️ For Buyers: Finding Nearby Products

### Automatic Location Discovery

When you open NearNest:
1. **Enable Location Services** on your device
2. **"Use Current GPS Location"** button will detect your exact position
3. Products automatically filter based on your location

### Product Discovery Flow

```
Your Location → Nearby Sellers (5km default) → Their Products → Sorted by Distance
```

### Features Available

✅ **Auto-sort by Distance** - Closest products appear first  
✅ **Category Filtering** - Food, Bakery, Snacks, Beverages, Crafts  
✅ **Search Products** - Find what you want nearby  
✅ **Adjust Radius** - Increase search area up to 20km  
✅ **View Distance** - Each product shows distance from your location  
✅ **See Seller Info** - Business name, rating, preparation time  

### Manual Location Selection

If GPS isn't available:
1. Click on any seeded hub (pre-defined locations in Calicut)
2. Or enter any location manually
3. Products will filter around that location

---

## 🗺️ Technical Implementation

### What Happens Behind the Scenes

**For Sellers:**
- Location stored as GeoJSON Point in database
- Products inherit seller's location
- When location updates → all products get new coordinates
- Delivery radius defines service area

**For Buyers:**
- Geolocation.getCurrentPosition() gets device GPS
- MongoDB 2dsphere index enables fast geo-queries
- Haversine formula calculates real distances
- Products sorted by $distanceFromUser in results

### API Endpoints

**Seller APIs:**
```
GET  /api/v1/sellers/settings        - Fetch current store settings
PUT  /api/v1/sellers/settings        - Update store settings (delivery)
PUT  /api/v1/sellers/location        - Update location specifically
```

**Buyer APIs:**
```
GET  /api/v1/geo/nearby-products?lat=X&lng=Y&radius=5
     - Returns products sorted by distance
```

---

## 🎯 Key Features Explained

### Feature 1: Automatic Product Filtering
- When buyer's location changes → products automatically re-fetch
- No manual refresh needed
- Real-time location tracking

### Feature 2: Distance-Based Sorting
- **Default**: Sorted by distance (closest first)
- **Alternative sorts**: By rating or price
- Distance always displayed in meters

### Feature 3: Location Update Syncing
- Sellers update location → Products sync automatically
- Ensures search accuracy
- No orphaned products

### Feature 4: Flexible Radius Control
- Start with 5km default
- Slider to adjust up to 20km
- Find more products as radius increases

---

## 📊 User Flows

### Seller Onboarding Flow
```
Sign Up as Seller
    ↓
Provide Business Location (lat/lng)
    ↓
Set Address Details
    ↓
Application Pending Admin Approval
    ↓
[APPROVED]
    ↓
Can List Products
    ↓
Can Update Location Anytime in Settings
```

### Buyer Discovery Flow
```
Open App
    ↓
Enable GPS / Select Location
    ↓
Nearby Sellers Detected (within radius)
    ↓
Their Products Listed (sorted by distance)
    ↓
Filter by Category / Search / Adjust Radius
    ↓
View Products with Distance Info
    ↓
Add to Cart / Wishlist
```

---

## 💡 Best Practices

### For Sellers:
1. **Accurate Location**: Ensure your registered location is where you operate from
2. **Update When Moving**: If you relocate, update location immediately
3. **Delivery Radius**: Set realistic radius based on your capabilities
4. **Fee Structure**: Balance affordability with profitability

### For Buyers:
1. **Enable GPS**: Most accurate product discovery
2. **Check Distance**: Know how far products are
3. **Expand Radius**: If no results, increase search radius
4. **Verify Seller**: Check ratings and reviews before ordering

---

## 🐛 Troubleshooting

### "No Products Found"
- ✅ Enable GPS and share location
- ✅ Try a seeded Calicut hub location
- ✅ Increase search radius (5 → 10 → 15 km)
- ✅ Check if sellers exist in your area

### Location Not Updating
- ✅ Clear browser cache
- ✅ Disable ad blockers (may interfere with geolocation)
- ✅ Use HTTPS (required for geolocation API)
- ✅ Check device location services are enabled

### Seller Location Not Changing Products
- ✅ Wait a few seconds for sync
- ✅ Refresh page
- ✅ Check if new location is within buyer's radius

---

## 🔐 Privacy & Security

- Location data is only used for product discovery
- Seller precise location hidden from competitors
- Buyer location never stored permanently
- Geolocation requires explicit user permission
- Can disable location anytime

---

## 📈 Future Enhancements

Planned features:
- Real-time seller availability status
- Estimated delivery time calculation
- Route optimization for multiple deliveries
- Seller analytics by location hotspots
- Distance-based dynamic pricing
- Bulk location import for sellers

---

## ✅ Quick Checklist

### Sellers:
- [ ] Registered with accurate location
- [ ] Address details completed
- [ ] Delivery settings configured
- [ ] Products listed
- [ ] Location update tested in settings

### Buyers:
- [ ] GPS detection working
- [ ] Nearby products displaying
- [ ] Distance sorting visible
- [ ] Can filter by category
- [ ] Can adjust search radius

---

Need help? Check your store settings or contact support!
