import mongoose, { Schema, Document } from 'mongoose';

// ----------------------------------------------------
// GEOJSON POINT SCHEMA
// ----------------------------------------------------
export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export const PointSchema = new Schema<IGeoPoint>({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], required: true } // [lng, lat]
}, { _id: false });

// ----------------------------------------------------
// USER SCHEMA
// ----------------------------------------------------
export interface IUserAddress {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  location: IGeoPoint;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatar?: string;
  role: string[]; // ['buyer', 'seller', 'admin']
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  googleId?: string;
  addresses: IUserAddress[];
  defaultAddressIndex?: number;
  walletBalance: number;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  fcmToken?: string;
  preferences: {
    searchRadius: number;
    categories: string[];
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IUserAddress>({
  label: { type: String, required: true },
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  location: { type: PointSchema, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  role: { type: [String], default: ['buyer'] },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  googleId: { type: String },
  addresses: [AddressSchema],
  defaultAddressIndex: { type: Number },
  walletBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  fcmToken: { type: String },
  preferences: {
    searchRadius: { type: Number, default: 5 },
    categories: { type: [String], default: [] },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

// ----------------------------------------------------
// SELLER SCHEMA
// ----------------------------------------------------
export interface ISellerSlot {
  from: string;
  to: string;
  capacity: number;
}

export interface ISellerDeliverySlots {
  day: string; // e.g. "Monday", "Everyday"
  slots: ISellerSlot[];
}

export interface ISellerOperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ISeller extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  slug: string;
  description?: string;
  category: 'food' | 'snacks' | 'crafts' | 'bakery' | 'beverages' | 'other';
  subCategories: string[];
  logo?: string;
  banner?: string;
  location: IGeoPoint;
  address: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryRadiusKm: number;
  deliveryOptions: string[]; // ['self-delivery', 'pickup', 'platform']
  baseDeliveryFee: number;
  perKmRate: number;
  maxDeliveryFee: number;
  freeDeliveryAbove?: number;
  deliverySlots: ISellerDeliverySlots[];
  operatingHours: ISellerOperatingHours[];
  isOpen: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectionReason?: string;
  documents: {
    idProof?: string;
    foodLicense?: string;
    gstNumber?: string;
  };
  bankDetails: {
    accountHolder: string;
    accountNumber: string; // encrypted or hashed
    ifscCode: string;
    bankName: string;
    stripeConnectId?: string;
    razorpayAccountId?: string;
  };
  subscription: {
    plan: 'free' | 'pro' | 'business';
    startDate?: Date;
    endDate?: Date;
    stripeSubscriptionId?: string;
  };
  rating: { average: number; count: number };
  totalOrders: number;
  totalRevenue: number;
  commissionRate: number;
  tags: string[];
  badges: string[]; // ['verified', 'top-seller', 'featured', 'new']
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new Schema<ISeller>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String },
  category: { type: String, enum: ['food', 'snacks', 'crafts', 'bakery', 'beverages', 'other'], required: true },
  subCategories: { type: [String], default: [] },
  logo: { type: String },
  banner: { type: String },
  location: { type: PointSchema, required: true },
  address: {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  deliveryRadiusKm: { type: Number, default: 5 },
  deliveryOptions: { type: [String], default: ['pickup'] },
  baseDeliveryFee: { type: Number, default: 20 },
  perKmRate: { type: Number, default: 5 },
  maxDeliveryFee: { type: Number, default: 80 },
  freeDeliveryAbove: { type: Number },
  deliverySlots: [{
    day: { type: String },
    slots: [{
      from: { type: String },
      to: { type: String },
      capacity: { type: Number, default: 10 }
    }]
  }],
  operatingHours: [{
    day: { type: String },
    open: { type: String, default: "09:00" },
    close: { type: String, default: "21:00" },
    isClosed: { type: Boolean, default: false }
  }],
  isOpen: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  rejectionReason: { type: String },
  documents: {
    idProof: { type: String },
    foodLicense: { type: String },
    gstNumber: { type: String }
  },
  bankDetails: {
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    stripeConnectId: { type: String },
    razorpayAccountId: { type: String }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    stripeSubscriptionId: { type: String }
  },
  rating: {
    average: { type: Number, default: 5 },
    count: { type: Number, default: 0 }
  },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  commissionRate: { type: Number, default: 0.10 },
  tags: { type: [String], default: [] },
  badges: { type: [String], default: [] }
}, { timestamps: true });

// Geospatial index on Seller location
SellerSchema.index({ location: '2dsphere' });

// ----------------------------------------------------
// PRODUCT SCHEMA
// ----------------------------------------------------
export interface ICustomizationChoice {
  label: string;
  extraCost: number;
}

export interface ICustomizationOption {
  name: string;
  choices: ICustomizationChoice[];
}

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  ingredients?: string;
  allergens: string[];
  images: string[];
  thumbnailImage?: string;
  category: string;
  subCategory?: string;
  tags: string[];
  dietaryTags: string[]; // ['vegan', 'vegetarian', 'gluten-free', 'nut-free', 'halal', 'jain']
  price: number;
  discountedPrice?: number;
  unit: string; // e.g. "500g", "1 dozen"
  minOrderQty: number;
  maxOrderQty?: number;
  stock: number;
  isUnlimitedStock: boolean;
  preparationTimeMinutes: number;
  availableDays: string[];
  isCustomizable: boolean;
  customizationOptions: ICustomizationOption[];
  isActive: boolean;
  isFeatured: boolean;
  isPromoted: boolean;
  promotionEndDate?: Date;
  rating: { average: number; count: number };
  totalOrders: number;
  location: IGeoPoint; // Denormalized from seller
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String },
  ingredients: { type: String },
  allergens: { type: [String], default: [] },
  images: { type: [String], required: true },
  thumbnailImage: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String },
  tags: { type: [String], default: [] },
  dietaryTags: { type: [String], enum: ['vegan', 'vegetarian', 'gluten-free', 'nut-free', 'halal', 'jain'], default: [] },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  unit: { type: String, required: true },
  minOrderQty: { type: Number, default: 1 },
  maxOrderQty: { type: Number },
  stock: { type: Number, required: true, default: 10 },
  isUnlimitedStock: { type: Boolean, default: false },
  preparationTimeMinutes: { type: Number, default: 30 },
  availableDays: { type: [String], default: ["Everyday"] },
  isCustomizable: { type: Boolean, default: false },
  customizationOptions: [{
    name: { type: String },
    choices: [{
      label: { type: String },
      extraCost: { type: Number, default: 0 }
    }]
  }],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPromoted: { type: Boolean, default: false },
  promotionEndDate: { type: Date },
  rating: {
    average: { type: Number, default: 5 },
    count: { type: Number, default: 0 }
  },
  totalOrders: { type: Number, default: 0 },
  location: { type: PointSchema, required: true },
  viewCount: { type: Number, default: 0 }
}, { timestamps: true });

// Geospatial index, single indexes, and text index
ProductSchema.index({ location: '2dsphere' });
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ title: 'text', description: 'text', tags: 'text' });

// ----------------------------------------------------
// ORDER SCHEMA
// ----------------------------------------------------
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  image: string;
  price: number;
  quantity: number;
  customization?: Record<string, string>;
  subtotal: number;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  itemsTotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  commissionAmount: number;
  sellerEarnings: number;
  deliveryAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    location: IGeoPoint;
  };
  deliveryMode: 'delivery' | 'pickup';
  deliverySlot?: {
    date: Date;
    from: string;
    to: string;
  };
  status: 'placed' | 'accepted' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected' | 'refunded';
  statusHistory: IOrderStatusHistory[];
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentId?: string;
  razorpayOrderId?: string;
  buyerNote?: string;
  sellerNote?: string;
  trackingInfo?: {
    deliveryPersonName?: string;
    phone?: string;
    liveLocation?: IGeoPoint;
  };
  isReviewed: boolean;
  cancelReason?: string;
  refundAmount?: number;
  refundStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, unique: true, required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    customization: { type: Schema.Types.Mixed },
    subtotal: { type: Number, required: true }
  }],
  itemsTotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  platformFee: { type: Number, default: 5 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  total: { type: Number, required: true },
  commissionAmount: { type: Number, required: true },
  sellerEarnings: { type: Number, required: true },
  deliveryAddress: {
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: { type: PointSchema, required: true }
  },
  deliveryMode: { type: String, enum: ['delivery', 'pickup'], required: true },
  deliverySlot: {
    date: { type: Date },
    from: { type: String },
    to: { type: String }
  },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'rejected', 'refunded'],
    default: 'placed'
  },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  buyerNote: { type: String },
  sellerNote: { type: String },
  trackingInfo: {
    deliveryPersonName: { type: String },
    phone: { type: String },
    liveLocation: { type: PointSchema }
  },
  isReviewed: { type: Boolean, default: false },
  cancelReason: { type: String },
  refundAmount: { type: Number },
  refundStatus: { type: String }
}, { timestamps: true });

// ----------------------------------------------------
// REVIEW SCHEMA
// ----------------------------------------------------
export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  productRating: number;
  sellerRating: number;
  comment?: string;
  images: string[];
  isFlagged: boolean;
  isVisible: boolean;
  adminNote?: string;
  helpfulCount: number;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productRating: { type: Number, min: 1, max: 5, required: true },
  sellerRating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  images: { type: [String], default: [] },
  isFlagged: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  adminNote: { type: String },
  helpfulCount: { type: Number, default: 0 }
}, { timestamps: true });

// ----------------------------------------------------
// NOTIFICATION SCHEMA
// ----------------------------------------------------
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string; // 'order_placed', 'order_status', 'new_seller', 'message', 'announcement'
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// ----------------------------------------------------
// COUPON SCHEMA
// ----------------------------------------------------
export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validTill: Date;
  applicableCategories: string[];
  applicableSellerIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId; // Admin or Seller
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, unique: true, required: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  maxDiscount: { type: Number },
  minOrderAmount: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validTill: { type: Date, required: true },
  applicableCategories: { type: [String], default: [] },
  applicableSellerIds: { type: [Schema.Types.ObjectId], default: [] },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// ----------------------------------------------------
// CATEGORY SCHEMA
// ----------------------------------------------------
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  parentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String },
  icon: { type: String },
  image: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// ----------------------------------------------------
// PAYOUT SCHEMA
// ----------------------------------------------------
export interface IPayout extends Document {
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  periodStart: Date;
  periodEnd: Date;
  ordersCount: number;
  commissionsDeducted: number;
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  ordersCount: { type: Number, default: 0 },
  commissionsDeducted: { type: Number, default: 0 },
  processedAt: { type: Date },
  failureReason: { type: String }
}, { timestamps: true });

// ----------------------------------------------------
// AUDIT LOG SCHEMA
// ----------------------------------------------------
export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string; // 'seller_approved', 'product_flagged', 'user_banned', etc.
  targetType: string; // 'Seller', 'Product', 'User', 'Order'
  targetId: mongoose.Types.ObjectId;
  details: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  details: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Index for audit queries
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });

// ----------------------------------------------------
// SELLER ANALYTICS SCHEMA
// ----------------------------------------------------
export interface ISellerAnalytics extends Document {
  sellerId: mongoose.Types.ObjectId;
  date: Date;
  views: number;
  orders: number;
  revenue: number;
  newCustomers: number;
  repeatCustomers: number;
  avgRating: number;
  totalReviews: number;
  cancelledOrders: number;
}

const SellerAnalyticsSchema = new Schema<ISellerAnalytics>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  date: { type: Date, required: true },
  views: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  newCustomers: { type: Number, default: 0 },
  repeatCustomers: { type: Number, default: 0 },
  avgRating: { type: Number, default: 5 },
  totalReviews: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index for efficient queries
SellerAnalyticsSchema.index({ sellerId: 1, date: -1 });

// Export models
export const User = mongoose.model<IUser>('User', UserSchema);
export const Seller = mongoose.model<ISeller>('Seller', SellerSchema);
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export const Review = mongoose.model<IReview>('Review', ReviewSchema);
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
export const Category = mongoose.model<ICategory>('Category', CategorySchema);
export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export const SellerAnalytics = mongoose.model<ISellerAnalytics>('SellerAnalytics', SellerAnalyticsSchema);
