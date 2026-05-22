// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
  };
}

// User Types
export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string[];
  walletBalance: number;
  referralCode: string;
  addresses: UserAddress[];
  preferences: UserPreferences;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  location: GeoPoint;
  isDefault: boolean;
}

export interface UserPreferences {
  searchRadius: number;
  categories: string[];
  language: string;
}

// Product Types
export interface Product {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: string[];
  thumbnailImage?: string;
  category: string;
  tags: string[];
  dietaryTags: string[];
  price: number;
  discountedPrice?: number;
  unit: string;
  stock: number;
  isUnlimitedStock: boolean;
  preparationTimeMinutes: number;
  availableDays: string[];
  isCustomizable: boolean;
  customizationOptions: CustomizationOption[];
  rating: Rating;
  totalOrders: number;
  viewCount: number;
  distanceFromUser?: string;
  seller?: Seller;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationOption {
  name: string;
  choices: CustomizationChoice[];
}

export interface CustomizationChoice {
  label: string;
  extraCost: number;
}

// Seller Types
export interface Seller {
  _id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  category: 'food' | 'snacks' | 'crafts' | 'bakery' | 'beverages' | 'other';
  logo?: string;
  banner?: string;
  location: GeoPoint;
  address: Address;
  deliveryRadiusKm: number;
  deliveryOptions: string[];
  baseDeliveryFee: number;
  perKmRate: number;
  maxDeliveryFee: number;
  rating: Rating;
  totalOrders: number;
  badges: string[];
  isApproved: boolean;
  isOpen: boolean;
  distanceFromUser?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  status:
    | 'placed'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'rejected'
    | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryMode: 'delivery' | 'pickup';
  deliverySlot?: {
    date: string;
    from: string;
    to: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  customization?: Record<string, string>;
  subtotal: number;
}

// Review Types
export interface Review {
  _id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  productRating: number;
  sellerRating: number;
  comment?: string;
  images: string[];
  isVisible: boolean;
  createdAt: string;
}

// Common Types
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Rating {
  average: number;
  count: number;
}

// Cart Types
export interface CartItem {
  productId: string;
  sellerId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  customization?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  isActive: boolean;
}

// Auth Types
export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Notification Types
export interface Notification {
  _id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

// Analytics Types
export interface SellerAnalytics {
  _id: string;
  sellerId: string;
  date: string;
  views: number;
  orders: number;
  revenue: number;
  newCustomers: number;
  avgRating: number;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  dietaryTags?: string[];
  sortBy?: 'distance' | 'rating' | 'price' | 'new';
  page?: number;
  limit?: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  label?: string;
}
