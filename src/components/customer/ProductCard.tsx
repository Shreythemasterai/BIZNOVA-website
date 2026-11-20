'use client';

import React from 'react';
import { Plus, Minus, AlertTriangle, Eye, Heart, Star, CheckCircle } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const { cart, addToCart, updateCartQuantity, toggleWishlist, isInWishlist } = useApp();

  const cartItem = cart.find((item) => item.productId === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;
  const isSaved = isInWishlist(product.id);

  return (
    <div className="group relative rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 pointer-events-none">
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              {product.discountPercent}% OFF
            </span>
          ) : null}

          {isOutOfStock ? (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Only {product.stockQuantity} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer ${
            isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div
        onClick={() => onOpenModal(product)}
        className="relative w-full h-44 bg-slate-50 cursor-pointer overflow-hidden p-3 flex items-center justify-center"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
          }}
        />

        {/* Quick view hover button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            Quick View
          </span>
        </div>
      </div>

      {/* Details & Price */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="truncate max-w-[110px]">{product.brand || product.categoryName}</span>
            <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 font-semibold shrink-0">
              {product.unit}
            </span>
          </div>

          <h3
            onClick={() => onOpenModal(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-1 hover:text-emerald-700 cursor-pointer leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating and Verification */}
          <div className="flex items-center gap-2 mt-1.5">
            {product.rating && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                {product.rating}
              </span>
            )}
            {product.isVerifiedShopStock ? (
              <span className="text-[10px] text-teal-700 font-medium flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" />
                Shop Stock
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Demo Catalog</span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold">15-25 min delivery</p>
          </div>

          {/* Add to Cart Stepper */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              Unavailable
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center rounded-xl bg-emerald-600 text-white overflow-hidden shadow-xs">
              <button
                onClick={() => updateCartQuantity(product.id, quantityInCart - 1)}
                className="px-2.5 py-1.5 hover:bg-emerald-700 active:scale-95 transition-colors cursor-pointer"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-black min-w-[20px] text-center">
                {quantityInCart}
              </span>
              <button
                onClick={() => updateCartQuantity(product.id, quantityInCart + 1)}
                className="px-2.5 py-1.5 hover:bg-emerald-700 active:scale-95 transition-colors cursor-pointer"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-transparent text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
