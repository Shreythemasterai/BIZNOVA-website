'use client';

import React from 'react';
import { X, Plus, Minus, ShieldCheck, Star, Heart, Calendar, Truck, Barcode, Store } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { cart, addToCart, updateCartQuantity, toggleWishlist, isInWishlist } = useApp();

  if (!product) return null;

  const cartItem = cart.find((i) => i.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stockQuantity <= 0;
  const isSaved = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                {product.discountPercent}% OFF
              </span>
            ) : null}
            {product.isVerifiedShopStock ? (
              <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Store className="w-3 h-3" />
                New Balaji Verified
              </span>
            ) : null}
          </div>

          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-64 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
            }}
          />
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-emerald-700">{product.brand || 'New Balaji Selection'}</span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer ${
                  isSaved ? 'text-rose-600' : 'text-slate-600'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="text-[11px] font-medium">{isSaved ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-700">
                Quantity: {product.unit}
              </span>
              {product.rating && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  {product.rating} ({product.ratingCount || 100}+ reviews)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quality & Shop guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Genuine Quality guaranteed by New Balaji Trading Co., Moshi</span>
            </div>

            <div className="text-xs space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex justify-between text-slate-500">
                <span>Availability:</span>
                <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stockQuantity} units available in shop`}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Category:</span>
                <span className="font-semibold text-slate-800">{product.categoryName}</span>
              </div>
              {product.supplierName && (
                <div className="flex justify-between text-slate-500">
                  <span>Source / Supplier:</span>
                  <span className="font-medium text-slate-700">{product.supplierName}</span>
                </div>
              )}
              {product.expiryDate && (
                <div className="flex justify-between text-slate-500 items-center">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Best Before:
                  </span>
                  <span className="font-medium text-slate-700">{product.expiryDate}</span>
                </div>
              )}
              {product.barcode && (
                <div className="flex justify-between text-slate-500 items-center">
                  <span className="flex items-center gap-1">
                    <Barcode className="w-3 h-3 text-slate-400" />
                    Barcode:
                  </span>
                  <span className="font-mono text-[11px] text-slate-600">{product.barcode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Add Stepper */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Hyperlocal 15–25 Mins in Moshi
              </p>
            </div>

            {isOutOfStock ? (
              <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold">
                Out of Stock
              </span>
            ) : inCartQty > 0 ? (
              <div className="flex items-center rounded-xl bg-emerald-600 text-white shadow-md">
                <button
                  onClick={() => updateCartQuantity(product.id, inCartQty - 1)}
                  className="px-3 py-2 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-black">{inCartQty}</span>
                <button
                  onClick={() => updateCartQuantity(product.id, inCartQty + 1)}
                  className="px-3 py-2 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
