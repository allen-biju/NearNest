# NearNest - Complete Setup Guide

## 📋 Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- MongoDB (local or Atlas cluster)
- Redis instance (local or Upstash)
- Cloudinary account (for file uploads)
- Razorpay account (for payments)
- Gmail/SendGrid account (for emails)

## 🚀 Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nearnest

# Redis (get from Upstash Redis)
REDIS_URL=redis://default:password@host:port

# JWT (generate secure random strings, min 32 chars)
JWT_ACCESS_SECRET=your-super-secret-access-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters

# Razorpay (get from Razorpay dashboard)
RAZORPAY_KEY_ID=key_...
RAZORPAY_KEY_SECRET=secret_...

# Cloudinary (get from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SendGrid (for emails)
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@nearnest.in
```

### 3. Start Backend
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

## 🗄️ Database Initialization

### MongoDB Setup
1. Create MongoDB Atlas cluster or use local MongoDB
2. Create database: `nearnest`
3. Collections are auto-created by Mongoose on first insert

### MongoDB Local Development
```bash
# Start MongoDB locally
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Redis Setup
- Use Upstash Redis (https://upstash.com) - free tier available
- Or run locally:
```bash
# Local Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

## 🧪 API Testing

### Test Nearby Products Discovery
```bash
curl "http://localhost:5000/api/v1/geo/nearby-products?lat=11.2588&lng=75.7804&radius=5"
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

## 📱 Frontend Usage

1. Open `http://localhost:3000`
2. Click on "Use Current Location" to get your GPS coordinates
3. Nearby products will load based on your location and search radius
4. Use the radius slider to expand/contract search area
5. Click on products to view details
6. Add to cart (saved locally for now)

## 🔍 Project Structure

### Backend
```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend
```
client/
├── src/
│   ├── components/      # React components
│   ├── context/         # Context API
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── styles/          # Tailwind CSS
│   ├── App.tsx          # Main app
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect to Vercel
vercel link

# Deploy
vercel
```

### Backend (Railway)
1. Push code to GitHub
2. Connect repo to Railway
3. Set environment variables in Railway dashboard
4. Railway auto-deploys on push

### Database (MongoDB Atlas)
1. Create free M0 cluster on MongoDB Atlas
2. Get connection string
3. Whitelist IP addresses

### Cache (Upstash Redis)
1. Create free Redis instance on Upstash
2. Get connection string
3. Use in REDIS_URL

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB connection error
- Check MongoDB URI in .env
- Ensure IP is whitelisted on MongoDB Atlas
- Verify database name in URI

### Redis connection error
- Check Redis is running
- Verify REDIS_URL format
- Check firewall/network settings

### CORS errors
- Backend CORS is configured for localhost:3000
- For production, update CORS origin in `app.ts`

### Location permission denied
- Browser may need explicit permission
- Check browser privacy settings
- Use manual location input as fallback

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh token

### Discovery Endpoints
- `GET /api/v1/geo/nearby-products` - Get nearby products
- `GET /api/v1/geo/nearby-sellers` - Get nearby sellers
- `GET /api/v1/geo/trending` - Get trending products
- `GET /api/v1/geo/recommendations` - Get personalized recommendations

### Product Endpoints
- `GET /api/v1/products/:id` - Get product details
- `GET /api/v1/products/category/:slug` - Get products by category
- `GET /api/v1/search` - Search products

## 🎯 Next Steps

1. ✅ Run backend: `npm run dev` in server/
2. ✅ Run frontend: `npm run dev` in client/
3. ⏳ Build checkout flow
4. ⏳ Integrate payment (Razorpay)
5. ⏳ Build seller dashboard
6. ⏳ Build admin panel

## 📞 Support

For issues or questions:
1. Check the logs (Winston logs in server/)
2. Verify .env configuration
3. Check database connections
4. Ensure all dependencies are installed

---

**Happy coding! 🚀**
