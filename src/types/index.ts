export type UserRole = 'customer' | 'owner' | 'staff' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  addresses?: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  color: string;
  itemCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  price: number; // in INR (Rupees)
  originalPrice?: number; // in INR (MRP)
  discountPercent?: number;
  unit: string; // e.g., '1 kg', '500 ml', '1 pack'
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
  sku: string;
  createdAt: string;
  costPrice?: number; // wholesale purchase cost for profit analysis
  isVerifiedShopStock?: boolean; // Separates actual owner-verified inventory from demo catalog
  supplierName?: string;
  expiryDate?: string;
  barcode?: string;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentMethod = 'cod' | 'online_upi' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  total: number;
  imageUrl?: string;
  costPrice?: number;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedDeliveryId?: string;
  assignedDeliveryName?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  statusHistory: OrderStatusHistoryItem[];
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: 'order' | 'restock' | 'cancellation_return' | 'manual_adjustment' | 'damage';
  orderId?: string;
  note?: string;
  createdAt: string;
  performedBy: string;
}

export interface SearchLog {
  id: string;
  query: string;
  resultsCount: number;
  customerId?: string;
  timestamp: string;
}

export type AIRecommendationType =
  | 'restock'
  | 'discount'
  | 'new_product'
  | 'dead_stock'
  | 'market_trend';

export interface ExternalSource {
  title: string;
  source: string;
  url?: string;
  date: string;
  relevance: string;
}

export interface AIActionPayload {
  actionType: 'restock' | 'apply_discount' | 'add_product' | 'feature_product';
  productId?: string;
  newQuantity?: number;
  discountPercent?: number;
  productData?: Partial<Product>;
  label: string;
}

export interface AIRecommendation {
  id: string;
  type: AIRecommendationType;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'opportunity';
  supportingMetric: string;
  confidence: number; // percentage 0-100
  suggestedAction?: AIActionPayload;
  status: 'pending' | 'approved' | 'dismissed';
  createdAt: string;
  externalSource?: ExternalSource;
  // Enhanced fields for BizNova Intelligence
  riskLevel?: 'Low' | 'Medium' | 'High';
  verifiedData?: boolean;
  expectedDemand?: string;
  estimatedCost?: number;
  suggestedPrice?: number;
  estimatedProfitMargin?: number;
  recommendedInitialStock?: number;
  categoryName?: string;
  reason?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderAmount: number;
  description: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  landmark?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  operatingHours: string;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryAbove: number;
  estimatedDeliveryMinutes: number;
  taxPercent: number;
  isStoreOpen: boolean;
  currencySymbol: string;
  upiId: string;
}
