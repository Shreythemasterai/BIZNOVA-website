'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  Store,
  Truck,
  ClipboardList,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Heart,
  Mic,
  Barcode,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { BizNovaDatabase } from '@/lib/db';

export function Navbar({ onSearch }: { onSearch?: (q: string) => void }) {
  const pathname = usePathname();
  const {
    currentUser,
    switchRole,
    cartItemCount,
    cartSubtotal,
    setIsCartDrawerOpen,
    wishlist,
    setIsWishlistOpen,
    setIsVoiceSearchOpen,
    setIsBarcodeLookupOpen,
    resetDemoData,
    activeAddress,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const settings = BizNovaDatabase.getShopSettings();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      BizNovaDatabase.logSearch(searchQuery.trim(), 1, currentUser.id);
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">New Balaji Trading Company</span>
            <span className="text-emerald-400 text-[11px] hidden sm:inline">• Tupe Vasti, Moshi, Pune</span>
            <span className="hidden md:inline text-emerald-300">•</span>
            <span className="hidden md:inline text-emerald-300">{settings.operatingHours}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden md:flex items-center gap-1 text-emerald-200">
              <Clock className="w-3.5 h-3.5" />
              <span>15–25 Mins Hyperlocal Delivery</span>
            </span>
            <button
              onClick={() => {
                if (confirm('Reset New Balaji Trading Company demonstration database to pristine seed state?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium cursor-pointer transition-colors"
              title="Reset all orders, stock, and demo data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 md:gap-5">
          {/* Brand Logo & Shop Name */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Biz<span className="text-emerald-600">Nova</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                  Instamart
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold -mt-0.5 hidden sm:block">
                New Balaji Trading Co. • Moshi
              </p>
            </div>
          </Link>

          {/* Location Chip */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-700 max-w-[230px] truncate transition-colors">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate text-left">
              <span className="font-bold block truncate text-slate-900">Moshi, Pune 412105</span>
              <span className="text-[11px] text-slate-500 truncate block">
                {activeAddress ? `${activeAddress.label}: ${activeAddress.area}` : 'Tupe Vasti, Dehu-Moshi Rd'}
              </span>
            </div>
          </div>

          {/* Search Bar with Voice and Barcode */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search atta, dal, ghee, spices, milk, snacks..."
                className="w-full pl-10 pr-20 py-2.5 text-sm rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all text-slate-900 placeholder-slate-400"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      if (onSearch) onSearch('');
                    }}
                    className="p-1 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsVoiceSearchOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Voice Search"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsBarcodeLookupOpen(true)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Barcode Lookup / Scanner"
                >
                  <Barcode className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Customer Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Persona / Role Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                title="Switch persona to test Owner, Staff, Delivery or Customer view"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentUser.role === 'owner'
                      ? 'bg-purple-600'
                      : currentUser.role === 'staff'
                      ? 'bg-amber-500'
                      : currentUser.role === 'delivery'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="capitalize font-semibold hidden sm:inline">
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-scale-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Role Persona
                  </div>
                  {(['customer', 'owner', 'staff', 'delivery'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        currentUser.role === r ? 'font-bold text-emerald-700 bg-emerald-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span className="capitalize">
                        {r === 'owner'
                          ? 'Store Owner (Admin)'
                          : r === 'staff'
                          ? 'Store Staff (Prep)'
                          : r === 'delivery'
                          ? 'Delivery Partner'
                          : 'Customer (Shopper)'}
                      </span>
                      {currentUser.role === r && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                  <div className="mt-1 pt-1 border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400 truncate">
                    Active: {currentUser.name}
                  </div>
                </div>
              )}
            </div>

            {/* Role Link Shortcuts */}
            <div className="hidden md:flex items-center gap-1 text-xs">
              <Link
                href="/orders"
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  pathname === '/orders'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Orders
              </Link>

              {currentUser.role === 'owner' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                    pathname?.startsWith('/admin')
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Admin Hub</span>
                </Link>
              )}

              {currentUser.role === 'staff' && (
                <Link
                  href="/staff"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-amber-700 hover:bg-amber-50"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Staff Prep</span>
                </Link>
              )}

              {currentUser.role === 'delivery' && (
                <Link
                  href="/delivery"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-blue-700 hover:bg-blue-50"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Rider View</span>
                </Link>
              )}
            </div>

            {/* Shopping Cart Pill Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Open Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-tight">
                  {cartItemCount === 0 ? 'Cart' : `₹${cartSubtotal}`}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
