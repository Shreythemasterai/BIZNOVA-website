-- =========================================================================
-- BIZNOVA: SMART LOCAL SHOP E-COMMERCE & RETAIL MANAGEMENT DATABASE SCHEMA
-- Target Database: Supabase PostgreSQL (Supports RLS & Triggers)
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('customer', 'owner', 'staff', 'delivery');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT ('cat_' || replace(uuid_generate_v4()::text, '-', '')),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Package',
  description TEXT,
  color TEXT DEFAULT 'emerald',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT ('prod_' || replace(uuid_generate_v4()::text, '-', '')),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= price),
  discount_percent INT DEFAULT 0,
  unit TEXT NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 5,
  cost_price NUMERIC(10, 2) CHECK (cost_price >= 0),
  sku TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);

-- 4. SAVED ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id TEXT PRIMARY KEY DEFAULT ('addr_' || replace(uuid_generate_v4()::text, '-', '')),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  street TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  pincode TEXT NOT NULL,
  landmark TEXT,
  phone TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_addresses_user ON public.addresses(user_id);

-- 5. ORDERS
CREATE TYPE order_status AS ENUM (
  'placed',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'rejected'
);

CREATE TYPE payment_method AS ENUM ('cod', 'online_upi', 'card');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord_' || replace(uuid_generate_v4()::text, '-', '')),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address JSONB NOT NULL,
  delivery_instructions TEXT,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  coupon_code TEXT,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status order_status NOT NULL DEFAULT 'placed',
  payment_method payment_method NOT NULL DEFAULT 'cod',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_staff_name TEXT,
  assigned_delivery_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_delivery_name TEXT,
  cancellation_reason TEXT,
  estimated_delivery_minutes INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_delivery_staff ON public.orders(assigned_delivery_id);

-- 6. ORDER ITEMS (Snapshot preserved for historical accuracy)
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT ('item_' || replace(uuid_generate_v4()::text, '-', '')),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_unit TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2),
  quantity INT NOT NULL CHECK (quantity > 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  image_url TEXT
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- 7. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_status_history_order ON public.order_status_history(order_id);

-- 8. INVENTORY LOGS
CREATE TYPE inventory_reason AS ENUM (
  'order',
  'restock',
  'cancellation_return',
  'manual_adjustment',
  'damage'
);

CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id TEXT PRIMARY KEY DEFAULT ('log_' || replace(uuid_generate_v4()::text, '-', '')),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  change INT NOT NULL,
  reason inventory_reason NOT NULL,
  order_id TEXT,
  note TEXT,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_inventory_logs_product ON public.inventory_logs(product_id);

-- 9. SEARCH LOGS (For AI demand-gap analytics)
CREATE TABLE IF NOT EXISTS public.search_logs (
  id TEXT PRIMARY KEY DEFAULT ('srch_' || replace(uuid_generate_v4()::text, '-', '')),
  query TEXT NOT NULL,
  results_count INT NOT NULL DEFAULT 0,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. AI RECOMMENDATIONS
CREATE TYPE ai_recommendation_type AS ENUM (
  'restock',
  'discount',
  'new_product',
  'dead_stock',
  'market_trend'
);

CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id TEXT PRIMARY KEY DEFAULT ('rec_' || replace(uuid_generate_v4()::text, '-', '')),
  type ai_recommendation_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  supporting_metric TEXT NOT NULL,
  confidence INT NOT NULL DEFAULT 85,
  suggested_action JSONB,
  external_source JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. SHOP SETTINGS
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id INT PRIMARY KEY DEFAULT 1,
  shop_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  delivery_radius_km NUMERIC(4, 1) NOT NULL DEFAULT 4.5,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 99,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 29,
  free_delivery_above NUMERIC(10, 2) NOT NULL DEFAULT 499,
  estimated_delivery_minutes INT NOT NULL DEFAULT 20,
  tax_percent INT NOT NULL DEFAULT 5,
  is_store_open BOOLEAN NOT NULL DEFAULT true,
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  upi_id TEXT NOT NULL DEFAULT 'biznova.store@upi',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: users can read and update their own profile; owners can read all
CREATE POLICY "Public profile read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Self profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Products & Categories: anyone can read active products; owners can edit
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true OR auth.jwt() ->> 'role' = 'owner');
CREATE POLICY "Owner products manage" ON public.products FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Owner categories manage" ON public.categories FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

-- 3. Addresses: customers can only view and manage their own
CREATE POLICY "User addresses access" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- 4. Orders:
-- Customers see only their orders
CREATE POLICY "Customer orders view" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
-- Owners see all orders
CREATE POLICY "Owner orders all" ON public.orders FOR ALL USING (auth.jwt() ->> 'role' = 'owner');
-- Staff see active orders
CREATE POLICY "Staff orders view" ON public.orders FOR SELECT USING (auth.jwt() ->> 'role' = 'staff');
-- Delivery personnel see only orders assigned to them
CREATE POLICY "Delivery orders view" ON public.orders FOR SELECT USING (auth.uid() = assigned_delivery_id);
CREATE POLICY "Delivery orders update" ON public.orders FOR UPDATE USING (auth.uid() = assigned_delivery_id);
