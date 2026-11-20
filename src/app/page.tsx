'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroBanner } from '@/components/customer/HeroBanner';
import { CategoryNav } from '@/components/customer/CategoryNav';
import { ProductCard } from '@/components/customer/ProductCard';
import { ProductModal } from '@/components/customer/ProductModal';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { WishlistDrawer } from '@/components/customer/WishlistDrawer';
import { VoiceSearchModal } from '@/components/customer/VoiceSearchModal';
import { BarcodeLookupModal } from '@/components/customer/BarcodeLookupModal';
import { BizNovaDatabase } from '@/lib/db';
import { Product, Category } from '@/types';
import {
  TrendingUp,
  Percent,
  SlidersHorizontal,
  PackageX,
  Store,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(BizNovaDatabase.getProducts());
    setCategories(BizNovaDatabase.getCategories());
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategoryId) {
      list = list.filter((p) => p.categoryId === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => p.stockQuantity > 0);
    }

    if (verifiedOnly) {
      list = list.filter((p) => p.isVerifiedShopStock);
    }

    switch (sortBy) {
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

    return list;
  }, [products, selectedCategoryId, searchQuery, inStockOnly, verifiedOnly, sortBy]);

  // Featured and deal sections
  const featuredBestsellers = useMemo(
    () => products.filter((p) => p.isFeatured && p.isActive).slice(0, 4),
    [products]
  );

  const specialDeals = useMemo(
    () =>
      products
        .filter((p) => (p.discountPercent || 0) >= 12 && p.isActive)
        .slice(0, 4),
    [products]
  );

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);
  const settings = BizNovaDatabase.getShopSettings();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onSearch={(q) => setSearchQuery(q)} />

      <CategoryNav
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 flex-1 w-full pb-16">
        {/* Hero banner shown on main view */}
        {!selectedCategoryId && !searchQuery && <HeroBanner />}

        {/* Featured Bestsellers Row (When on home view) */}
        {!selectedCategoryId && !searchQuery && featuredBestsellers.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Bestsellers in Moshi &amp; Dehu Road
                  </h2>
                  <p className="text-xs text-slate-500">Fastest-moving daily grocery &amp; kitchen essentials</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredBestsellers.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenModal={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Super Saver Offers Row */}
        {!selectedCategoryId && !searchQuery && specialDeals.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Super Saver Deals (Up to 20% OFF)
                  </h2>
                  <p className="text-xs text-slate-500">Fresh stock at wholesale neighborhood rates</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {specialDeals.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenModal={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Catalog Header & Filters */}
        <section className="mt-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {selectedCategoryObj
                  ? selectedCategoryObj.name
                  : searchQuery
                  ? `Search results for "${searchQuery}"`
                  : 'Store Grocery Catalog'}
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredProducts.length} items from New Balaji Trading Company (15–25 min delivery)
              </p>
            </div>

            {/* Controls: In-Stock Toggle, Verified Only, Sort */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span>In-Stock Only</span>
              </label>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Verified Shop Stock
                </span>
              </label>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold outline-hidden cursor-pointer"
                >
                  <option value="popular">Popular</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenModal={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or clearing your category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
                setInStockOnly(false);
                setVerifiedOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Wishlist Drawer */}
      <WishlistDrawer onOpenProduct={(p) => setActiveModalProduct(p)} />

      {/* Voice Search Modal */}
      <VoiceSearchModal onApplySearch={(q) => setSearchQuery(q)} />

      {/* Barcode Scanner Modal */}
      <BarcodeLookupModal onSelectProduct={(p) => setActiveModalProduct(p)} />

      {/* Product Quick View Modal */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-black text-white block">BizNova</span>
                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">
                  New Balaji Trading Co.
                </span>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Hyperlocal fast-commerce grocery platform powering New Balaji Trading Company with live inventory tracking, wholesale pricing, and an AI-driven Business Advisor.
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold">
              Tagline: &quot;{settings.tagline}&quot;
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">
              Actual Shop Location
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings.operatingHours}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="text-[10px] text-slate-400 pt-1 font-mono">
                GSTIN: {settings.gstin}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">
              Store Assurances
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>✓ 15–25 Minute Moshi &amp; Dehu Road Delivery</li>
              <li>✓ Pure Shudh Chakki Atta &amp; Indrayani Rice</li>
              <li>✓ Unpolished Healthy Dals &amp; Spices</li>
              <li>✓ Secure UPI (PhonePe / GPay) &amp; Cash on Delivery</li>
              <li>✓ Digital GST Tax Invoices</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider">
              BizNova Platform Status
            </h4>
            <p className="text-[11px] text-slate-400 mb-2">
              Production ready hyperlocal e-commerce architecture with atomic inventory deductions, owner control center, and AI retail intelligence.
            </p>
            <div className="inline-block px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              ● Store Online • Accepting Moshi Orders
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 BizNova E-Commerce. Licensed for New Balaji Trading Company, Moshi, Pune.</span>
          <span>Crafted with Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 &amp; Supabase PostgreSQL.</span>
        </div>
      </footer>
    </div>
  );
}
