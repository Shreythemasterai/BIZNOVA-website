'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Banknote,
  Store,
  QrCode,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { BizNovaDatabase } from '@/lib/db';
import { PaymentMethod, Address, Order } from '@/types';

export function CartDrawer() {
  const router = useRouter();
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartItemCount,
    cartSavings,
    activeAddress,
    setActiveAddress,
    currentUser,
    addToast,
  } = useApp();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_upi');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('Tupe Vasti, Moshi');
  const [newPincode, setNewPincode] = useState('412105');
  const [newLandmark, setNewLandmark] = useState('Near Tupe Vasti Bus Stop');

  const settings = BizNovaDatabase.getShopSettings();

  if (!isCartDrawerOpen) return null;

  // Coupon calculations using dynamic validator
  let couponDiscount = 0;
  if (appliedCoupon) {
    const val = BizNovaDatabase.validateCoupon(appliedCoupon, cartSubtotal);
    if (val.valid) {
      couponDiscount = val.discount;
    }
  }

  const deliveryFee = cartSubtotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryFee;
  const taxableAmount = Math.max(0, cartSubtotal - couponDiscount);
  const tax = Math.round((taxableAmount * settings.taxPercent) / 100);
  const finalTotal = taxableAmount + deliveryFee + tax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.toUpperCase().trim();
    if (!code) return;

    const check = BizNovaDatabase.validateCoupon(code, cartSubtotal);
    if (check.valid) {
      setAppliedCoupon(code);
      addToast(check.message, 'success');
    } else {
      addToast(check.message, 'error');
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet) {
      addToast('Please enter street or flat details', 'error');
      return;
    }
    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      label: 'Home',
      street: newStreet,
      area: newArea,
      city: 'Pune',
      pincode: newPincode,
      landmark: newLandmark,
      phone: currentUser.phone || '+91 98220 54321',
      isDefault: true,
    };
    setActiveAddress(newAddr);
    setIsAddingAddress(false);
    addToast('Delivery address updated in Moshi, Pune!', 'success');
  };

  const handlePlaceOrder = async () => {
    if (!activeAddress) {
      addToast('Please specify a delivery address', 'error');
      return;
    }

    if (cartSubtotal < settings.minOrderAmount) {
      addToast(`Minimum order amount is ₹${settings.minOrderAmount}`, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate real verified transaction processing
      await new Promise((res) => setTimeout(res, 750));

      const result = BizNovaDatabase.checkoutOrder({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: activeAddress.phone || currentUser.phone,
        deliveryAddress: activeAddress,
        deliveryInstructions,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        couponCode: appliedCoupon || undefined,
      });

      if (!result.success || !result.order) {
        addToast(result.error || 'Checkout failed', 'error');
        setIsSubmitting(false);
        return;
      }

      setCreatedOrder(result.order);
      clearCart();
      setStep('success');

      try {
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
        });
      } catch (err) {
        // Confetti fallback
      }
    } catch (err: any) {
      addToast(err?.message || 'Error creating order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-extrabold text-base text-slate-900 block leading-tight">
                {step === 'cart'
                  ? `My Basket (${cartItemCount})`
                  : step === 'checkout'
                  ? 'Delivery & Payment'
                  : 'Order Confirmed!'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">New Balaji Trading Co. • Moshi</span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCartDrawerOpen(false);
              if (step === 'success') {
                setStep('cart');
              }
            }}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS */}
        {step === 'cart' && (
          <>
            {cart.length === 0 ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Your basket is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Browse fresh staples, pulses, desi ghee, spices, and snacks from New Balaji Trading Co. in Moshi!
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Savings Banner */}
                {cartSavings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>You are saving ₹{cartSavings} on this grocery order!</span>
                  </div>
                )}

                {/* Free Delivery Bar */}
                {cartSubtotal < settings.freeDeliveryAbove ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <div className="flex justify-between font-semibold">
                      <span>Add ₹{settings.freeDeliveryAbove - cartSubtotal} more for FREE delivery</span>
                      <span>₹{cartSubtotal} / ₹{settings.freeDeliveryAbove}</span>
                    </div>
                    <div className="w-full bg-amber-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (cartSubtotal / settings.freeDeliveryAbove) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You unlocked FREE Delivery in Moshi &amp; Dehu Road!</span>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 shadow-xs flex items-center gap-3"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 object-contain rounded-lg bg-slate-50 p-1 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2310b981"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{item.product.unit}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xs font-black text-slate-900">
                            ₹{item.product.price * item.quantity}
                          </span>
                          {item.product.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{item.product.originalPrice * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center rounded-lg bg-emerald-600 text-white shadow-xs">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-emerald-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-emerald-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon (BALAJI10, BIZFIRST)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono uppercase focus:outline-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
                    <span>Coupon &quot;{appliedCoupon}&quot; applied</span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="font-bold text-slate-900 pb-1 border-b border-slate-200">
                    Bill Summary
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Item Total</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({appliedCoupon})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge (Moshi Hyperlocal)</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%) &amp; Safe Packing</span>
                    <span>₹{tax}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                    <span>To Pay</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Proceed Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-between px-5 transition-all cursor-pointer"
                >
                  <div className="text-left">
                    <span className="text-[11px] font-normal block opacity-90">
                      {cartItemCount} items • ₹{finalTotal}
                    </span>
                    <span>Proceed to Delivery</span>
                  </div>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: CHECKOUT & ADDRESS & PAYMENT */}
        {step === 'checkout' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <button
              onClick={() => setStep('cart')}
              className="text-xs text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              ← Back to Basket
            </button>

            {/* Delivery Address Box */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Delivery Address in Moshi
                </span>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {isAddingAddress ? 'Cancel' : '+ Change Address'}
                </button>
              </div>

              {isAddingAddress ? (
                <form onSubmit={handleAddNewAddress} className="space-y-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="Flat / Society / House Details"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                    required
                  />
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="Landmark (e.g. Near Tupe Vasti Bus Stop)"
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      placeholder="Area / Locality"
                      className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
                      required
                    />
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="Pincode"
                      className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Save &amp; Deliver Here
                  </button>
                </form>
              ) : activeAddress ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-xs text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{activeAddress.label}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                      Moshi Service Area
                    </span>
                  </div>
                  <p className="text-slate-700 leading-snug">{activeAddress.street}</p>
                  <p className="text-slate-500">{activeAddress.landmark ? `${activeAddress.landmark}, ` : ''}{activeAddress.area}, {activeAddress.city} - {activeAddress.pincode}</p>
                  <p className="text-slate-600 font-semibold pt-0.5">Phone: {activeAddress.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No address selected. Please add an address.</p>
              )}
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Delivery Instructions (Optional)</label>
              <input
                type="text"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Ring doorbell, Call on arrival"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Payment Option</label>

              <div
                onClick={() => setPaymentMethod('online_upi')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'online_upi'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Instant Online UPI / QR (Secure)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      GPay, PhonePe, Paytm ({settings.upiId})
                    </span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'online_upi' ? 'border-emerald-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'online_upi' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pay cash or UPI to rider upon doorstep delivery
                    </span>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-emerald-600' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'cod' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Total Payable & Security badge */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Final Payable Amount:</span>
                <span className="text-emerald-700 text-sm font-black">₹{finalTotal}</span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Atomic checkout with live New Balaji inventory decrement
              </p>
            </div>

            {/* Place Order CTA Button */}
            <button
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order with Store...</span>
                </>
              ) : (
                <>
                  <span>Place Order • ₹{finalTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && createdOrder && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1">
                New Balaji Trading Company, Moshi has received your grocery order.
              </p>
            </div>

            {/* Order summary card */}
            <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{createdOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Payable:</span>
                <span className="font-bold text-emerald-700">₹{createdOrder.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Hyperlocal Delivery:</span>
                <span className="font-bold text-slate-800">~{createdOrder.estimatedDeliveryMinutes} Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[190px]">
                  {createdOrder.deliveryAddress.street}, Moshi
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  router.push(`/orders?highlight=${createdOrder.id}`);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Track Live Order Status
              </button>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  setStep('cart');
                }}
                className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
