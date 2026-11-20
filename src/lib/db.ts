import type {
  Product,
  Category,
  Order,
  InventoryLog,
  SearchLog,
  AIRecommendation,
  ShopSettings,
  User,
  OrderStatus,
  OrderItem,
  Address,
  PaymentMethod,
  Coupon,
  CustomerReview,
} from '../types/index.ts';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_SEARCH_LOGS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_SHOP_SETTINGS,
  INITIAL_COUPONS,
} from './data/seededData.ts';

const STORAGE_KEYS = {
  PRODUCTS: 'biznova_products_v2',
  CATEGORIES: 'biznova_categories_v2',
  ORDERS: 'biznova_orders_v2',
  USERS: 'biznova_users_v2',
  INVENTORY_LOGS: 'biznova_inventory_logs_v2',
  SEARCH_LOGS: 'biznova_search_logs_v2',
  AI_RECOMMENDATIONS: 'biznova_ai_recs_v2',
  SHOP_SETTINGS: 'biznova_settings_v2',
  CART: 'biznova_cart_v2',
  CURRENT_USER_ID: 'biznova_current_user_v2',
  WISHLIST: 'biznova_wishlist_v2',
  COUPONS: 'biznova_coupons_v2',
  REVIEWS: 'biznova_reviews_v2',
};

// In-memory fallback for server-side execution and node tests
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memoryUsers: User[] = [...INITIAL_USERS];
let memoryInventoryLogs: InventoryLog[] = [...INITIAL_INVENTORY_LOGS];
let memorySearchLogs: SearchLog[] = [...INITIAL_SEARCH_LOGS];
let memoryAIRecommendations: AIRecommendation[] = [...INITIAL_AI_RECOMMENDATIONS];
let memoryShopSettings: ShopSettings = { ...INITIAL_SHOP_SETTINGS };
let memoryWishlist: Record<string, string[]> = {};
let memoryCoupons: Coupon[] = [...INITIAL_COUPONS];
let memoryReviews: CustomerReview[] = [];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStored<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) {
    return defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export class BizNovaDatabase {
  // PRODUCTS
  static getProducts(options?: {
    categoryId?: string;
    search?: string;
    inStockOnly?: boolean;
    featuredOnly?: boolean;
    verifiedOnly?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'popular' | 'discount';
  }): Product[] {
    let list = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);

    if (options?.categoryId) {
      list = list.filter((p) => p.categoryId === options.categoryId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (options?.inStockOnly) {
      list = list.filter((p) => p.stockQuantity > 0);
    }

    if (options?.featuredOnly) {
      list = list.filter((p) => p.isFeatured);
    }

    if (options?.verifiedOnly) {
      list = list.filter((p) => p.isVerifiedShopStock);
    }

    if (options?.sort) {
      switch (options.sort) {
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'discount':
          list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
          break;
        case 'popular':
        default:
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    return list;
  }

  static getProductById(id: string): Product | undefined {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    return products.find((p) => p.id === id);
  }

  static getProductBySlug(slug: string): Product | undefined {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    return products.find((p) => p.slug === slug);
  }

  static addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerifiedShopStock: product.isVerifiedShopStock ?? true,
    };
    products.unshift(newProduct);
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;

    // Log initial stock creation
    if (newProduct.stockQuantity > 0) {
      this.addInventoryLog({
        productId: newProduct.id,
        productName: newProduct.name,
        previousStock: 0,
        newStock: newProduct.stockQuantity,
        change: newProduct.stockQuantity,
        reason: 'restock',
        note: `Initial inventory added: ${newProduct.stockQuantity} ${newProduct.unit}`,
        performedBy: 'Store Owner',
      });
    }

    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const oldProduct = products[index];
    const updatedProduct = { ...oldProduct, ...updates };

    // Stock difference logging
    if (updates.stockQuantity !== undefined && updates.stockQuantity !== oldProduct.stockQuantity) {
      const diff = updates.stockQuantity - oldProduct.stockQuantity;
      this.addInventoryLog({
        productId: id,
        productName: updatedProduct.name,
        previousStock: oldProduct.stockQuantity,
        newStock: updates.stockQuantity,
        change: diff,
        reason: 'manual_adjustment',
        note: `Inventory manual update from ${oldProduct.stockQuantity} to ${updates.stockQuantity}`,
        performedBy: 'Store Owner',
      });
    }

    products[index] = updatedProduct;
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;
    return updatedProduct;
  }

  static deleteProduct(id: string): { success: boolean; error?: string } {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, error: 'Product not found' };

    products.splice(index, 1);
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;
    return { success: true };
  }

  static archiveProduct(id: string): boolean {
    const result = this.updateProduct(id, { isActive: false });
    return !!result;
  }

  static toggleVerifiedStock(id: string): { success: boolean; isVerified?: boolean } {
    const prod = this.getProductById(id);
    if (!prod) return { success: false };
    const updated = this.updateProduct(id, { isVerifiedShopStock: !prod.isVerifiedShopStock });
    return { success: true, isVerified: updated?.isVerifiedShopStock };
  }

  static importProductsFromCSV(csvContent: string): { success: boolean; importedCount: number; errors: string[] } {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, importedCount: 0, errors: ['CSV contains no data rows'] };
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    let imported = 0;
    const errors: string[] = [];

    const categories = this.getCategories();
    const defaultCat = categories[0]?.id || 'cat_grains';

    for (let i = 1; i < lines.length; i++) {
      try {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 3) continue;

        const name = parts[0] || 'Imported Grocery Item';
        const brand = parts[1] || 'Store Brand';
        const price = parseFloat(parts[2]) || 50;
        const costPrice = parseFloat(parts[3]) || Math.round(price * 0.8);
        const unit = parts[4] || '1 Pack';
        const stockQuantity = parseInt(parts[5], 10) || 20;
        const categorySlug = parts[6]?.toLowerCase() || '';

        const matchedCat = categories.find((c) => c.slug.includes(categorySlug) || c.name.toLowerCase().includes(categorySlug));
        const categoryId = matchedCat ? matchedCat.id : defaultCat;
        const categoryName = matchedCat ? matchedCat.name : categories[0]?.name;

        this.addProduct({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          brand,
          categoryId,
          categoryName,
          description: `${brand} ${name} (${unit}). Freshly sourced quality grocery available at New Balaji Trading Company.`,
          price,
          costPrice,
          originalPrice: Math.round(price * 1.15),
          discountPercent: 12,
          unit,
          stockQuantity,
          lowStockThreshold: 10,
          isActive: true,
          isFeatured: false,
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
          sku: `IMP-${Date.now().toString().slice(-4)}-${i}`,
          isVerifiedShopStock: true,
          supplierName: 'New Balaji Direct Import',
        });
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    return { success: imported > 0, importedCount: imported, errors };
  }

  // CATEGORIES
  static getCategories(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, memoryCategories);
  }

  static addCategory(category: Omit<Category, 'id'>): { success: boolean; category?: Category; error?: string } {
    const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, memoryCategories);
    const id = `cat_${Date.now()}`;
    const slug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory: Category = {
      ...category,
      id,
      slug,
      itemCount: 0,
    };

    categories.push(newCategory);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    memoryCategories = categories;
    return { success: true, category: newCategory };
  }

  static updateCategory(id: string, updates: Partial<Category>): { success: boolean; category?: Category; error?: string } {
    const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, memoryCategories);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: 'Category not found' };

    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    memoryCategories = categories;

    // Update category name in products if changed
    if (updates.name) {
      const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
      products.forEach((p) => {
        if (p.categoryId === id) {
          p.categoryName = updates.name;
        }
      });
      setStored(STORAGE_KEYS.PRODUCTS, products);
      memoryProducts = products;
    }

    return { success: true, category: updated };
  }

  static deleteCategory(id: string): { success: boolean; error?: string } {
    const categories = getStored<Category[]>(STORAGE_KEYS.CATEGORIES, memoryCategories);
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: 'Category not found' };

    categories.splice(index, 1);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    memoryCategories = categories;
    return { success: true };
  }

  // WISHLIST
  static getWishlist(customerId: string): string[] {
    const all = getStored<Record<string, string[]>>(STORAGE_KEYS.WISHLIST, memoryWishlist);
    return all[customerId] || [];
  }

  static toggleWishlist(customerId: string, productId: string): { inWishlist: boolean; wishlist: string[] } {
    const all = getStored<Record<string, string[]>>(STORAGE_KEYS.WISHLIST, memoryWishlist);
    let list = all[customerId] || [];
    let inWishlist = false;

    if (list.includes(productId)) {
      list = list.filter((id) => id !== productId);
      inWishlist = false;
    } else {
      list.push(productId);
      inWishlist = true;
    }

    all[customerId] = list;
    setStored(STORAGE_KEYS.WISHLIST, all);
    memoryWishlist = all;

    return { inWishlist, wishlist: list };
  }

  static isInWishlist(customerId: string, productId: string): boolean {
    const list = this.getWishlist(customerId);
    return list.includes(productId);
  }

  // COUPONS
  static getCoupons(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, memoryCoupons);
  }

  static validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const cleanCode = code.toUpperCase().trim();
    const coupon = coupons.find((c) => c.code === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code' };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order of ₹${coupon.minOrderAmount}`,
      };
    }

    let discount = 0;
    if (coupon.code === 'FREEDEL') {
      const settings = this.getShopSettings();
      discount = settings.deliveryFee;
    } else {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: ₹${discount} savings!`,
      coupon,
    };
  }

  // USERS & ROLES
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, memoryUsers);
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const id = getStored<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr_customer_1');
    return users.find((u) => u.id === id) || users[0];
  }

  static setCurrentUser(userId: string): void {
    setStored(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  // ORDERS & ATOMIC TRANSACTIONS
  static getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
  }

  static getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id);
  }

  static checkoutOrder(input: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: Address;
    deliveryInstructions?: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
  }): { success: boolean; order?: Order; error?: string } {
    const settings = this.getShopSettings();
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);

    // 1. Validate Stock Availability Concurrency Guard
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;
    let totalCost = 0;

    for (const item of input.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${item.productId}` };
      }
      if (!prod.isActive) {
        return { success: false, error: `Product '${prod.name}' is currently unavailable.` };
      }
      if (prod.stockQuantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for '${prod.name}'. Requested ${item.quantity}, only ${prod.stockQuantity} left.`,
        };
      }

      const itemTotal = prod.price * item.quantity;
      const itemCost = (prod.costPrice || Math.round(prod.price * 0.8)) * item.quantity;
      subtotal += itemTotal;
      totalCost += itemCost;

      validatedItems.push({
        id: `ord_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: prod.id,
        productName: prod.name,
        productUnit: prod.unit,
        price: prod.price,
        originalPrice: prod.originalPrice,
        quantity: item.quantity,
        total: itemTotal,
        imageUrl: prod.imageUrl,
        costPrice: prod.costPrice,
      });
    }

    // Minimum order check
    if (subtotal < settings.minOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount is ${settings.currencySymbol}${settings.minOrderAmount}. Your subtotal is ${settings.currencySymbol}${subtotal}.`,
      };
    }

    // Discounts
    let discount = 0;
    if (input.couponCode) {
      const check = this.validateCoupon(input.couponCode, subtotal);
      if (check.valid) {
        discount = check.discount;
      }
    }

    // Delivery Fee calculation
    const deliveryFee = subtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * settings.taxPercent) / 100);
    const total = taxableAmount + deliveryFee + tax;

    // 2. Decrement Inventory & Create Inventory Logs
    for (const item of input.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex !== -1) {
        const prev = products[pIndex].stockQuantity;
        products[pIndex].stockQuantity = Math.max(0, prev - item.quantity);

        this.addInventoryLog({
          productId: products[pIndex].id,
          productName: products[pIndex].name,
          previousStock: prev,
          newStock: products[pIndex].stockQuantity,
          change: -item.quantity,
          reason: 'order',
          note: `Purchase in checkout`,
          performedBy: 'System (Checkout)',
        });
      }
    }

    // Save updated product stock
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;

    // 3. Create Order
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `BN-${randomSuffix}`;
    const orderId = `ord_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      deliveryInstructions: input.deliveryInstructions,
      items: validatedItems,
      subtotal,
      discount,
      couponCode: input.couponCode,
      deliveryFee,
      tax,
      total,
      status: 'placed',
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === 'online_upi' ? 'completed' : 'pending',
      paymentId: input.paymentMethod === 'online_upi' ? `upi_${Date.now()}` : undefined,
      estimatedDeliveryMinutes: settings.estimatedDeliveryMinutes,
      statusHistory: [
        {
          status: 'placed',
          timestamp,
          note: `Order placed via ${input.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online UPI'} at New Balaji Trading Co.`,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
    orders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, orders);
    memoryOrders = orders;

    return { success: true, order: newOrder };
  }

  static cancelOrder(
    orderId: string,
    reason: string,
    performedBy: string = 'Customer'
  ): { success: boolean; error?: string } {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
    const order = orders.find((o) => o.id === orderId);

    if (!order) return { success: false, error: 'Order not found' };

    if (order.status === 'delivered') {
      return { success: false, error: 'Cannot cancel an order that has already been delivered.' };
    }
    if (order.status === 'cancelled') {
      return { success: false, error: 'Order is already cancelled.' };
    }
    if (order.status === 'rejected') {
      return { success: false, error: 'Order was already rejected.' };
    }

    // Restore inventory exactly once
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    for (const item of order.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex !== -1) {
        const prev = products[pIndex].stockQuantity;
        products[pIndex].stockQuantity = prev + item.quantity;

        this.addInventoryLog({
          productId: products[pIndex].id,
          productName: products[pIndex].name,
          previousStock: prev,
          newStock: products[pIndex].stockQuantity,
          change: item.quantity,
          reason: 'cancellation_return',
          orderId: order.id,
          note: `Restored stock due to cancellation (${reason})`,
          performedBy,
        });
      }
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;

    // Update order status
    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: `Cancelled by ${performedBy}: ${reason}`,
      updatedBy: performedBy,
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    memoryOrders = orders;

    return { success: true };
  }

  static rejectOrder(
    orderId: string,
    reason: string,
    rejectedBy: string = 'Store Owner'
  ): { success: boolean; error?: string } {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
    const order = orders.find((o) => o.id === orderId);

    if (!order) return { success: false, error: 'Order not found' };
    if (order.status !== 'placed') {
      return { success: false, error: 'Only freshly placed orders can be rejected.' };
    }

    // Restore inventory
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    for (const item of order.items) {
      const pIndex = products.findIndex((p) => p.id === item.productId);
      if (pIndex !== -1) {
        const prev = products[pIndex].stockQuantity;
        products[pIndex].stockQuantity = prev + item.quantity;

        this.addInventoryLog({
          productId: products[pIndex].id,
          productName: products[pIndex].name,
          previousStock: prev,
          newStock: products[pIndex].stockQuantity,
          change: item.quantity,
          reason: 'cancellation_return',
          orderId: order.id,
          note: `Restored stock due to store rejection: ${reason}`,
          performedBy: rejectedBy,
        });
      }
    }
    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;

    order.status = 'rejected';
    order.rejectionReason = reason;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: 'rejected',
      timestamp: new Date().toISOString(),
      note: `Rejected by store: ${reason}`,
      updatedBy: rejectedBy,
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    memoryOrders = orders;
    return { success: true };
  }

  static acceptOrder(orderId: string, acceptedBy: string = 'Store Owner'): { success: boolean; error?: string } {
    return this.updateOrderStatus(orderId, 'confirmed', acceptedBy, 'Order verified and accepted for packing');
  }

  static updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    updatedBy: string,
    note?: string
  ): { success: boolean; error?: string } {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
    const order = orders.find((o) => o.id === orderId);

    if (!order) return { success: false, error: 'Order not found' };

    // Prevent invalid transitions
    const validFlow: Record<OrderStatus, OrderStatus[]> = {
      placed: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready_for_pickup', 'cancelled'],
      ready_for_pickup: ['out_for_delivery'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      rejected: [],
    };

    if (!validFlow[order.status]?.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition order status from '${order.status}' to '${newStatus}'.`,
      };
    }

    order.status = newStatus;
    if (newStatus === 'delivered') {
      order.paymentStatus = 'completed';
    }
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${newStatus.replace(/_/g, ' ')}`,
      updatedBy,
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    memoryOrders = orders;

    return { success: true };
  }

  static assignStaff(
    orderId: string,
    staffId: string,
    staffName: string,
    role: 'staff' | 'delivery'
  ): boolean {
    const orders = getStored<Order[]>(STORAGE_KEYS.ORDERS, memoryOrders);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (role === 'staff') {
      order.assignedStaffId = staffId;
      order.assignedStaffName = staffName;
    } else {
      order.assignedDeliveryId = staffId;
      order.assignedDeliveryName = staffName;
    }
    order.updatedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.ORDERS, orders);
    memoryOrders = orders;
    return true;
  }

  // INVENTORY & RESTOCK
  static restockProduct(
    productId: string,
    additionalQuantity: number,
    performedBy: string = 'Store Owner',
    note?: string
  ): boolean {
    const products = getStored<Product[]>(STORAGE_KEYS.PRODUCTS, memoryProducts);
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const prev = prod.stockQuantity;
    prod.stockQuantity = prev + additionalQuantity;

    this.addInventoryLog({
      productId: prod.id,
      productName: prod.name,
      previousStock: prev,
      newStock: prod.stockQuantity,
      change: additionalQuantity,
      reason: 'restock',
      note: note || `Manual restock of ${additionalQuantity} ${prod.unit}`,
      performedBy,
    });

    setStored(STORAGE_KEYS.PRODUCTS, products);
    memoryProducts = products;
    return true;
  }

  static getInventoryLogs(): InventoryLog[] {
    return getStored<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, memoryInventoryLogs);
  }

  static addInventoryLog(log: Omit<InventoryLog, 'id' | 'createdAt'>): void {
    const logs = getStored<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, memoryInventoryLogs);
    logs.unshift({
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.INVENTORY_LOGS, logs);
    memoryInventoryLogs = logs;
  }

  // SEARCH LOGS
  static logSearch(query: string, resultsCount: number, customerId?: string): void {
    const logs = getStored<SearchLog[]>(STORAGE_KEYS.SEARCH_LOGS, memorySearchLogs);
    logs.unshift({
      id: `srch_${Date.now()}`,
      query,
      resultsCount,
      customerId,
      timestamp: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.SEARCH_LOGS, logs);
    memorySearchLogs = logs;
  }

  static getSearchLogs(): SearchLog[] {
    return getStored<SearchLog[]>(STORAGE_KEYS.SEARCH_LOGS, memorySearchLogs);
  }

  // AI RECOMMENDATIONS
  static getAIRecommendations(): AIRecommendation[] {
    return getStored<AIRecommendation[]>(
      STORAGE_KEYS.AI_RECOMMENDATIONS,
      memoryAIRecommendations
    );
  }

  static approveAIAction(recommendationId: string): { success: boolean; message?: string } {
    const recs = this.getAIRecommendations();
    const rec = recs.find((r) => r.id === recommendationId);
    if (!rec || !rec.suggestedAction) return { success: false, message: 'Recommendation or action payload missing' };

    const action = rec.suggestedAction;

    if (action.actionType === 'restock' && action.productId && action.newQuantity) {
      this.restockProduct(
        action.productId,
        action.newQuantity,
        'BIZNOVA AI (Owner Approved)',
        `AI restock executed: +${action.newQuantity} units`
      );
    } else if (action.actionType === 'apply_discount' && action.productId && action.discountPercent !== undefined) {
      const prod = this.getProductById(action.productId);
      if (prod) {
        const origPrice = prod.originalPrice || prod.price;
        const newPrice = Math.round(origPrice * (1 - action.discountPercent / 100));
        this.updateProduct(action.productId, {
          discountPercent: action.discountPercent,
          price: newPrice,
          originalPrice: origPrice,
        });
      }
    } else if (action.actionType === 'add_product' && action.productData) {
      this.addProduct({
        name: action.productData.name || 'New Item',
        slug: (action.productData.name || 'new-item').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: action.productData.brand || 'Balaji Direct',
        categoryId: action.productData.categoryId || 'cat_dairy',
        categoryName: action.productData.categoryName || 'Dairy Products',
        description: action.productData.description || 'Added via BizNova AI Recommendation.',
        price: action.productData.price || 100,
        originalPrice: action.productData.originalPrice || 120,
        discountPercent: action.productData.discountPercent || 15,
        unit: action.productData.unit || '1 pc',
        stockQuantity: action.productData.stockQuantity || 10,
        lowStockThreshold: action.productData.lowStockThreshold || 3,
        isActive: true,
        isFeatured: true,
        imageUrl:
          action.productData.imageUrl ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        sku: action.productData.sku || `AI-${Date.now().toString().slice(-4)}`,
        costPrice: action.productData.costPrice || 80,
        isVerifiedShopStock: false,
      });
    } else if (action.actionType === 'feature_product' && action.productId) {
      this.updateProduct(action.productId, { isFeatured: true });
    }

    rec.status = 'approved';
    setStored(STORAGE_KEYS.AI_RECOMMENDATIONS, recs);
    memoryAIRecommendations = recs;

    return { success: true, message: `Approved action: ${action.label}` };
  }

  static dismissAIRecommendation(recommendationId: string): void {
    const recs = this.getAIRecommendations();
    const rec = recs.find((r) => r.id === recommendationId);
    if (rec) {
      rec.status = 'dismissed';
      setStored(STORAGE_KEYS.AI_RECOMMENDATIONS, recs);
      memoryAIRecommendations = recs;
    }
  }

  // SHOP SETTINGS
  static getShopSettings(): ShopSettings {
    return getStored<ShopSettings>(STORAGE_KEYS.SHOP_SETTINGS, memoryShopSettings);
  }

  static updateShopSettings(settings: Partial<ShopSettings>): ShopSettings {
    const current = this.getShopSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SHOP_SETTINGS, updated);
    memoryShopSettings = updated;
    return updated;
  }

  // DASHBOARD ANALYTICS & PROFIT ANALYSIS
  static getDashboardMetrics() {
    const orders = this.getOrders();
    const products = this.getProducts();

    const completedOrders = orders.filter((o) => o.status === 'delivered');
    const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');

    // Total Revenue (actual money received from delivered orders)
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    // Total COGS (Cost of goods sold)
    let totalCOGS = 0;
    for (const ord of completedOrders) {
      for (const item of ord.items) {
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod?.costPrice || item.costPrice || Math.round(item.price * 0.8);
        totalCOGS += unitCost * item.quantity;
      }
    }

    // Gross Profit = Revenue - COGS
    const grossProfit = Math.max(0, totalRevenue - totalCOGS);
    const grossProfitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

    // Today's metrics
    const todayDate = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayDate));
    const todayValidOrders = todayOrders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');
    const todayRevenue = todayValidOrders.reduce((sum, o) => sum + o.total, 0);

    let todayCOGS = 0;
    for (const ord of todayValidOrders) {
      for (const item of ord.items) {
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod?.costPrice || item.costPrice || Math.round(item.price * 0.8);
        todayCOGS += unitCost * item.quantity;
      }
    }
    const todayGrossProfit = Math.max(0, todayRevenue - todayCOGS);

    const pendingOrders = orders.filter(
      (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready_for_pickup' || o.status === 'out_for_delivery'
    );

    const lowStockProducts = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    );
    const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);

    const aov = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

    // Inventory Valuation
    const inventoryValuationCost = products.reduce((sum, p) => sum + p.stockQuantity * (p.costPrice || p.price * 0.8), 0);
    const inventoryValuationRetail = products.reduce((sum, p) => sum + p.stockQuantity * p.price, 0);

    // Sales and Profit by Product
    const productSalesMap: Record<
      string,
      {
        name: string;
        categoryName: string;
        units: number;
        revenue: number;
        cogs: number;
        grossProfit: number;
        marginPercent: number;
      }
    > = {};

    for (const ord of completedOrders) {
      for (const item of ord.items) {
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod?.costPrice || item.costPrice || Math.round(item.price * 0.8);
        const itemCost = unitCost * item.quantity;
        const itemGrossProfit = item.total - itemCost;

        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            categoryName: prod?.categoryName || 'General',
            units: 0,
            revenue: 0,
            cogs: 0,
            grossProfit: 0,
            marginPercent: 0,
          };
        }
        productSalesMap[item.productId].units += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
        productSalesMap[item.productId].cogs += itemCost;
        productSalesMap[item.productId].grossProfit += itemGrossProfit;
      }
    }

    Object.values(productSalesMap).forEach((p) => {
      p.marginPercent = p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) : 0;
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 6);

    const mostProfitableProducts = Object.values(productSalesMap)
      .sort((a, b) => b.grossProfit - a.grossProfit)
      .slice(0, 6);

    // Slow moving items (items with 0 sales or lowest velocity)
    const soldProductIds = new Set(Object.keys(productSalesMap));
    const slowMovingProducts = products
      .filter((p) => !soldProductIds.has(p.id) && p.isActive && p.stockQuantity > 0)
      .slice(0, 6);

    // Sales by Category
    const categoryRevenueMap: Record<string, { revenue: number; cogs: number; grossProfit: number }> = {};
    for (const ord of completedOrders) {
      for (const item of ord.items) {
        const prod = products.find((p) => p.id === item.productId);
        const catName = prod?.categoryName || 'Other Products';
        const unitCost = prod?.costPrice || item.costPrice || Math.round(item.price * 0.8);
        const itemCost = unitCost * item.quantity;

        if (!categoryRevenueMap[catName]) {
          categoryRevenueMap[catName] = { revenue: 0, cogs: 0, grossProfit: 0 };
        }
        categoryRevenueMap[catName].revenue += item.total;
        categoryRevenueMap[catName].cogs += itemCost;
        categoryRevenueMap[catName].grossProfit += item.total - itemCost;
      }
    }

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([name, data]) => ({
      name,
      value: data.revenue,
      grossProfit: data.grossProfit,
      margin: data.revenue > 0 ? Math.round((data.grossProfit / data.revenue) * 100) : 0,
    }));

    // Weekly performance trend (mock 7 day breakdown)
    const weeklyTrends = [
      { day: 'Mon', revenue: Math.round(totalRevenue * 0.12), profit: Math.round(grossProfit * 0.12), orders: 4 },
      { day: 'Tue', revenue: Math.round(totalRevenue * 0.14), profit: Math.round(grossProfit * 0.14), orders: 5 },
      { day: 'Wed', revenue: Math.round(totalRevenue * 0.11), profit: Math.round(grossProfit * 0.11), orders: 3 },
      { day: 'Thu', revenue: Math.round(totalRevenue * 0.16), profit: Math.round(grossProfit * 0.16), orders: 6 },
      { day: 'Fri', revenue: Math.round(totalRevenue * 0.18), profit: Math.round(grossProfit * 0.18), orders: 7 },
      { day: 'Sat', revenue: Math.round(totalRevenue * 0.22), profit: Math.round(grossProfit * 0.22), orders: 9 },
      { day: 'Sun', revenue: Math.max(todayRevenue, Math.round(totalRevenue * 0.07)), profit: Math.max(todayGrossProfit, Math.round(grossProfit * 0.07)), orders: todayOrders.length || 3 },
    ];

    return {
      totalRevenue,
      todayRevenue,
      totalCOGS,
      todayCOGS,
      grossProfit,
      todayGrossProfit,
      grossProfitMargin,
      totalOrdersCount: orders.length,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders.length,
      completedOrdersCount: completedOrders.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      averageOrderValue: aov,
      inventoryValuationCost: Math.round(inventoryValuationCost),
      inventoryValuationRetail: Math.round(inventoryValuationRetail),
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      mostProfitableProducts,
      slowMovingProducts,
      categoryBreakdown,
      weeklyTrends,
      recentOrders: orders.slice(0, 8),
    };
  }

  // RESTORE DEMO STATE
  static resetDatabaseToDemo(): void {
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(INITIAL_INVENTORY_LOGS));
      localStorage.setItem(STORAGE_KEYS.SEARCH_LOGS, JSON.stringify(INITIAL_SEARCH_LOGS));
      localStorage.setItem(STORAGE_KEYS.AI_RECOMMENDATIONS, JSON.stringify(INITIAL_AI_RECOMMENDATIONS));
      localStorage.setItem(STORAGE_KEYS.SHOP_SETTINGS, JSON.stringify(INITIAL_SHOP_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    }
    memoryProducts = [...INITIAL_PRODUCTS];
    memoryCategories = [...INITIAL_CATEGORIES];
    memoryOrders = [...INITIAL_ORDERS];
    memoryUsers = [...INITIAL_USERS];
    memoryInventoryLogs = [...INITIAL_INVENTORY_LOGS];
    memorySearchLogs = [...INITIAL_SEARCH_LOGS];
    memoryAIRecommendations = [...INITIAL_AI_RECOMMENDATIONS];
    memoryShopSettings = { ...INITIAL_SHOP_SETTINGS };
    memoryCoupons = [...INITIAL_COUPONS];
    memoryWishlist = {};
  }
}
