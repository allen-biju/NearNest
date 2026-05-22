# NearNest API Reference

**Base URL:** `http://localhost:5000/api/v1`

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "SecurePass123!",
  "referralCode": "NearNest123"  // optional
}

Response 201:
{
  "success": true,
  "data": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
  "message": "User registered successfully"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "John Doe", "role": ["buyer"] },
    "accessToken": "eyJhbGc..."
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response 200:
{
  "success": true,
  "data": { "accessToken": "eyJhbGc..." }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer eyJhbGc...

Response 200:
{
  "success": true,
  "data": { "_id": "...", "name": "John Doe", "email": "john@example.com", ... }
}
```

### Send OTP
```http
POST /auth/otp/send
Content-Type: application/json

{
  "phone": "9876543210"
}

Response 200:
{
  "success": true,
  "data": { "otp": "123456" },  // dev only, not in production
  "message": "OTP sent successfully"
}
```

### Verify OTP
```http
POST /auth/otp/verify
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456"
}

Response 200:
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "...", "phone": "9876543210" },
    "accessToken": "eyJhbGc..."
  }
}
```

### Logout
```http
POST /auth/logout

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🗺️ Geolocation & Discovery Endpoints

### Get Nearby Products
```http
GET /geo/nearby-products?lat=11.2588&lng=75.7804&radius=5&page=1&limit=20

Query Parameters:
- lat: number (required) - User latitude
- lng: number (required) - User longitude
- radius: number (optional, default: 5) - Search radius in km
- category: string (optional) - Filter by category
- sort: string (optional) - distance|rating|price|new (default: distance)
- searchQuery: string (optional) - Search term
- minPrice: number (optional)
- maxPrice: number (optional)
- dietaryTags: string (optional) - comma-separated: vegan,gluten-free
- page: number (optional, default: 1)
- limit: number (optional, default: 20)

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Chocolate Cake",
      "price": 280,
      "distanceFromUser": "2.3 km",
      "rating": { "average": 4.8, "count": 24 },
      "seller": { "_id": "...", "businessName": "Sweet Bakery" },
      ...
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3,
    "hasNext": true
  }
}
```

### Get Nearby Sellers
```http
GET /geo/nearby-sellers?lat=11.2588&lng=75.7804&radius=5

Query Parameters:
- lat: number (required)
- lng: number (required)
- radius: number (optional, default: 5)
- category: string (optional)
- page: number (optional, default: 1)
- limit: number (optional, default: 20)

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "businessName": "Sweet Bakery",
      "category": "bakery",
      "rating": { "average": 4.9, "count": 120 },
      "distanceFromUser": "1.2 km",
      "badges": ["verified", "top-seller"]
    }
  ],
  "pagination": { ... }
}
```

### Get Trending Products
```http
GET /geo/trending?lat=11.2588&lng=75.7804&radius=5

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Mango Lassi",
      "totalOrders": 150,
      "rating": { "average": 4.9 },
      ...
    }
  ]
}
```

### Get Personalized Recommendations
```http
GET /geo/recommendations?lat=11.2588&lng=75.7804&limit=10
Authorization: Bearer eyJhbGc...

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Biryani",
      "score": 0.87,  // recommendation score
      ...
    }
  ]
}
```

---

## 🏪 Product Endpoints

### Get Product by ID
```http
GET /products/507f1f77bcf86cd799439011

Response 200:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Chocolate Fudge Cake",
    "description": "Rich chocolate cake with fudge frosting",
    "price": 280,
    "discountedPrice": 200,
    "images": ["url1", "url2", "url3"],
    "rating": { "average": 4.8, "count": 24 },
    "seller": { "_id": "...", "businessName": "Sweet Bakery" },
    "ingredients": "Chocolate, eggs, flour...",
    "dietaryTags": ["vegetarian"],
    "preparationTimeMinutes": 45,
    ...
  }
}
```

### Get Products by Category
```http
GET /products/category/bakery?lat=11.2588&lng=75.7804&radius=5&sort=distance

Response 200:
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Search Products
```http
GET /search?q=chocolate&lat=11.2588&lng=75.7804&radius=5

Query Parameters:
- q: string (required) - Search term
- lat: number (required)
- lng: number (required)
- radius: number (optional, default: 5)
- page: number (optional, default: 1)
- limit: number (optional, default: 20)

Response 200:
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## 📝 Address Management

### Add Address
```http
POST /auth/address
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "action": "add",
  "addressData": {
    "label": "Home",
    "addressLine": "123 Main St, Apt 4B",
    "city": "Kozhikode",
    "state": "Kerala",
    "pincode": "673001",
    "location": {
      "type": "Point",
      "coordinates": [75.7804, 11.2588]  // [lng, lat]
    },
    "isDefault": false
  }
}

Response 200:
{
  "success": true,
  "data": { "addresses": [ ... ] }
}
```

### Update Address
```http
POST /auth/address
Authorization: Bearer eyJhbGc...

{
  "action": "update",
  "addressIndex": 0,
  "addressData": {
    "label": "Office",
    "addressLine": "456 Business Park..."
  }
}
```

### Delete Address
```http
POST /auth/address
Authorization: Bearer eyJhbGc...

{
  "action": "delete",
  "addressIndex": 0
}
```

---

## 🚀 Example Usage in Frontend

### Fetch Nearby Products
```typescript
const fetchNearby = async (lat: number, lng: number) => {
  const response = await fetch(
    `${API_URL}/geo/nearby-products?lat=${lat}&lng=${lng}&radius=5&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.json();
};
```

### Authenticate User
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'  // For cookies
  });
  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  return data;
};
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No token provided"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Seller access required"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests from this IP, please try again later."
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

---

## 🔑 Authentication

All protected endpoints require the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Or refresh token via cookie (set by server):
```http
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Pagination

All list endpoints support pagination:

```
?page=1&limit=20
```

Response includes:
```json
{
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8,
    "hasNext": true
  }
}
```

---

## 🎯 Rate Limits

- **Global:** 100 requests per 15 minutes
- **Auth:** 5 requests per 15 minutes
- **API:** 30 requests per minute

Headers included in response:
```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1626000000
```

---

## 📱 Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Pass123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123"}'

# Get nearby products
curl "http://localhost:5000/api/v1/geo/nearby-products?lat=11.2588&lng=75.7804&radius=5"

# Get specific product with auth
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/products/PRODUCT_ID
```

---

**Last Updated:** May 21, 2026  
**API Version:** v1
