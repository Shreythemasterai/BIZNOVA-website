'use client';

import React from 'react';
import { Zap, Clock, ShieldCheck, Tag, Sparkles, MapPin, Store } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function HeroBanner() {
  const { addToast } = useApp();

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl my-4 sm:my-6 border border-emerald-800/40">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 px-5 sm:px-8 py-7 sm:py-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3.5">
            {/* Speed & Shop badge */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Hyperlocal 15–25 Mins Delivery</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>New Balaji Trading Co.</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Moshi’s Trusted Kirana, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                Delivered Instantly to Your Door.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Order fresh whole wheat chakki atta, unpolished pulses, pure cow ghee, daily spices, Amul dairy, and munchies directly from <strong className="text-white">New Balaji Trading Company</strong> at Tupe Vasti, Dehu–Moshi Road.
            </p>

            {/* Benefit perks */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Tupe Vasti, Moshi, Pune</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Open till 10:30 PM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Shop Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Free Delivery on ₹499+</span>
              </div>
            </div>
          </div>

          {/* Promotional Coupon Card */}
          <div className="lg:col-span-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 text-center sm:text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Moshi Special Offer
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>

              <div>
                <p className="text-xl font-black text-white">Flat 10% OFF</p>
                <p className="text-xs text-slate-300">On grocery staples from New Balaji Trading Co.</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 bg-black/40 border border-white/20 rounded-lg px-3 py-2 font-mono text-sm font-bold text-amber-300 tracking-wider text-center">
                  BALAJI10
                </div>
                <button
                  onClick={() => copyCoupon('BALAJI10')}
                  className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                <span>Also try: <span className="font-mono text-emerald-300">BIZFIRST</span> (15% OFF)</span>
                <span className="text-amber-300">Free delivery on ₹499+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
