'use client';

import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BizNovaDatabase } from '@/lib/db';

export function WishlistDrawer({ onOpenProduct }: { onOpenProduct: (product: any) => void }) {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist, addToCart } = useApp();

  if (!isWishlistOpen) return null;

  const allProducts = BizNovaDatabase.getProducts();
  const savedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Saved Wishlist</h2>
                <p className="text-xs text-slate-500">{savedProducts.length} items saved for later</p>
              </div>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {savedProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Your wishlist is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Click the heart icon on any product in New Balaji Trading Company to save it here for fast reordering.
                  </p>
                </div>
              </div>
            ) : (
              savedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-white shadow-xs transition-all"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 object-contain rounded-lg bg-slate-50 p-1 cursor-pointer"
                    onClick={() => {
                      onOpenProduct(p);
                      setIsWishlistOpen(false);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => {
                        onOpenProduct(p);
                        setIsWishlistOpen(false);
                      }}
                      className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                    >
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{p.unit}</p>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-sm font-black text-slate-900">₹{p.price}</span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-xs text-slate-400 line-through">₹{p.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={p.stockQuantity <= 0}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                        p.stockQuantity <= 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{p.stockQuantity <= 0 ? 'Out of stock' : 'Add'}</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 text-xs transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {savedProducts.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/70">
              <button
                onClick={() => {
                  savedProducts.forEach((p) => {
                    if (p.stockQuantity > 0) addToCart(p, 1);
                  });
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add All In-Stock to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
