# 🚀 NearNest Quick Start Guide

## Getting Started (5 minutes)

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- A text editor (VS Code recommended)

---

## 1️⃣ Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

**Edit .env with your values:**
```env
# Generate strong JWT secrets (32+ characters)
JWT_ACCESS_SECRET=your-access-secret-here-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-here-minimum-32-characters

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nearnest

# Cache
REDIS_URL=redis://default:password@host:port

# Optional (for later features)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Start backend:**
```bash
npm run dev
```
✅ Backend running at `http://localhost:5000`

---

## 2️⃣ Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

**Edit .env:**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

**Start frontend:**
```bash
npm run dev
```
✅ Frontend running at `http://localhost:3000`

---

## 🧪 Test the App

### 1. Open browser to `http://localhost:3000`

### 2. Click "Use Current Location"
- Browser will ask for permission
- Or manually select from seeded locations

### 3. Adjust radius slider (1-20 km)

### 4. See nearby products populate

---

## 📱 Key Features to Try

| Feature | How to Test |
|---------|-----------|
| GPS Discovery | Adjust radius slider, see products update in real-time |
| Search | Type in search box, results filter by distance |
| Categories | Click category buttons to filter products |
| Sorting | Use Filter menu to sort by distance/rating/price |
| Add to Cart | Click product card → "Add to Cart" |
| Load More | Scroll to bottom, click "Load More Products" |

---

## 🔧 Architecture Overview

```
NearNest/
├── Backend (Express + MongoDB + Redis)
│   ├── GPS Geospatial Queries
│   ├── JWT Authentication
│   ├── Rate Limiting (100 req/15min)
│   └── 11 Database Models
│
└── Frontend (React + Tailwind + TypeScript)
    ├── Location Discovery
    ├── Product Browsing
    ├── Shopping Cart
    └── Mobile-First UI
```

---

## 📊 API Quick Reference

### Nearby Products
```bash
GET http://localhost:5000/api/v1/geo/nearby-products?lat=11.2588&lng=75.7804&radius=5
```

### Login
```bash
POST http://localhost:5000/api/v1/auth/login
Body: { "email": "test@example.com", "password": "Password123!" }
```

### Register
```bash
POST http://localhost:5000/api/v1/auth/register
Body: { "name": "John", "email": "john@example.com", "password": "Password123!" }
```

---

## 🛠️ Troubleshooting

### "Cannot connect to MongoDB"
- Check MongoDB is running
- Verify connection string in .env
- For Atlas, whitelist your IP

### "Redis connection error"
- Check Redis is running (or Upstash is accessible)
- Verify REDIS_URL format

### "CORS error"
- Backend CORS is set to localhost:3000
- This is expected for local development

### "Location not working"
- Allow browser permission when prompted
- Try refreshing the page
- Use manual location selector

---

## 📚 Documentation Files

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [API_REFERENCE.md](./API_REFERENCE.md) - All API endpoints documented
- [DEVELOPMENT_HANDOFF.md](./DEVELOPMENT_HANDOFF.md) - Architecture & next steps
- [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md) - Feature status

---

## 🎯 Next Steps

### Phase 1: Core Features ✅
- ✅ GPS Discovery
- ✅ Product Browsing
- ✅ Authentication

### Phase 2: Shopping (In Progress)
- 🔄 Shopping Cart
- ⏳ Checkout Flow
- ⏳ Payment Integration

### Phase 3: Seller Dashboard
- ⏳ Product Management
- ⏳ Order Queue
- ⏳ Earnings Dashboard

---

## 🆘 Need Help?

1. Check console for error messages
2. Review logs: `server/logs/` (if enabled)
3. See [Troubleshooting section](#-troubleshooting)
4. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed steps

---

## ✨ Features Ready to Use

### Backend
- ✅ Nearby products within X km radius
- ✅ Geospatial queries with caching
- ✅ Full-text search
- ✅ User authentication
- ✅ Rate limiting
- ✅ Error handling

### Frontend
- ✅ Location picker with GPS
- ✅ Radius adjustment (1-20 km)
- ✅ Product cards with images
- ✅ Real-time filtering
- ✅ Mobile responsive design
- ✅ Loading/error states

---

## 🚀 Deploy to Production

### Frontend → Vercel
```bash
vercel
```

### Backend → Railway
1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables
4. Deploy

---

**That's it! You're ready to explore NearNest! 🎉**

Have questions? Check the docs or see [SETUP_GUIDE.md](./SETUP_GUIDE.md)
