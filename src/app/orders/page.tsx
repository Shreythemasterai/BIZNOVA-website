'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { BizNovaDatabase } from '@/lib/db';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import {
  Package,
  CheckCircle2,
  Truck,
  RotateCcw,
  Ban,
  Printer,
  Phone,
  MapPin,
  AlertCircle,
  FileText,
  Share2,
  Store,
} from 'lucide-react';

function OrdersContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const { currentUser, addToCart, addToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');

  const settings = BizNovaDatabase.getShopSettings();

  const refreshOrders = () => {
    const list = BizNovaDatabase.getOrders();
    setOrders(list);

    if (highlightId) {
      const found = list.find((o) => o.id === highlightId || o.orderNumber === highlightId);
      if (found) setSelectedOrder(found);
      else if (list.length > 0) setSelectedOrder(list[0]);
    } else if (list.length > 0 && !selectedOrder) {
      setSelectedOrder(list[0]);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [highlightId]);

  const handleCancelOrder = () => {
    if (!selectedOrder) return;

    const res = BizNovaDatabase.cancelOrder(
      selectedOrder.id,
      cancelReason,
      `${currentUser.name} (${currentUser.role})`
    );

    if (res.success) {
      addToast(`Order #${selectedOrder.orderNumber} successfully cancelled. Stock restored.`, 'info');
      setCancelModalOpen(false);
      refreshOrders();
      const updated = BizNovaDatabase.getOrderById(selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    } else {
      addToast(res.error || 'Failed to cancel order', 'error');
    }
  };

  const handleReorder = (order: Order) => {
    const products = BizNovaDatabase.getProducts();
    let addedCount = 0;

    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.stockQuantity > 0) {
        addToCart(prod, item.quantity);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      addToast(`Added ${addedCount} items to your basket`, 'success');
    } else {
      addToast('Sorry, items from this order are currently out of stock', 'error');
    }
  };

  const handleShareWhatsApp = (order: Order) => {
    const text = encodeURIComponent(
      `*New Balaji Trading Company - Order Confirmation*\n` +
      `Order: #${order.orderNumber}\n` +
      `Items: ${order.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}\n` +
      `Total: ₹${order.total}\n` +
      `Delivery To: ${order.deliveryAddress.street}, Moshi, Pune\n` +
      `Status: ${order.status.replace(/_/g, ' ').toUpperCase()}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">Delivered</span>;
      case 'out_for_delivery':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">Out for Delivery</span>;
      case 'ready_for_pickup':
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-bold">Ready for Dispatch</span>;
      case 'preparing':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">Being Prepared</span>;
      case 'confirmed':
        return <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-xs font-bold">Accepted</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-bold">Cancelled</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">Rejected</span>;
      case 'placed':
      default:
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full text-xs font-bold">Order Placed</span>;
    }
  };

  const statusSteps: OrderStatus[] = [
    'placed',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
  ];

  const getStepProgressIndex = (status: OrderStatus) => {
    if (status === 'cancelled' || status === 'rejected') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Order History &amp; Live Tracking
            </h1>
            <p className="text-xs text-slate-500">
              Hyperlocal order fulfillment directly from New Balaji Trading Company, Moshi, Pune
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>New Balaji Trading Co. • Tupe Vasti</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-md mx-auto my-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add products from New Balaji store to your basket and complete checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Order List */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Your Orders ({orders.length})
              </h2>

              <div className="space-y-2.5">
                {orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-white shadow-md ring-2 ring-emerald-500/10'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                        <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {ord.items.length} items</span>
                        <span className="font-bold text-slate-900 text-sm">₹{ord.total}</span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 truncate">
                        {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Order Details & Live Tracker */}
            {selectedOrder && (
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">
                        Order #{selectedOrder.orderNumber}
                      </h2>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                      {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleShareWhatsApp(selectedOrder)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Share Order on WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print GST Invoice</span>
                    </button>
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>

                {/* Progress Tracker (If not cancelled) */}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'rejected' ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Order Fulfillment Progress</span>
                      <span className="text-emerald-700 font-extrabold">
                        {selectedOrder.status === 'delivered' ? '✓ Delivered to Doorstep' : '⚡ Est. 15-25 Mins'}
                      </span>
                    </div>

                    {/* Stepper Bar */}
                    <div className="relative flex items-center justify-between pt-2">
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
                        style={{
                          width: `${(Math.max(0, getStepProgressIndex(selectedOrder.status)) / (statusSteps.length - 1)) * 100}%`,
                        }}
                      />

                      {statusSteps.map((s, idx) => {
                        const currentIdx = getStepProgressIndex(selectedOrder.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={s} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'scale-110 shadow-md ring-emerald-200' : ''}`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span
                              className={`text-[9px] mt-1.5 font-bold capitalize hidden sm:block ${
                                isDone ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {s === 'confirmed' ? 'Accepted' : s.replace(/_/g, ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        {selectedOrder.status === 'rejected' ? 'Order Rejected by Store' : 'Order Cancelled'}
                      </span>
                      <p className="mt-0.5 text-rose-700">
                        Reason: {selectedOrder.rejectionReason || selectedOrder.cancellationReason || 'Cancelled upon request'}
                      </p>
                      <p className="text-[10px] text-rose-500 mt-1">
                        All reserved items have been restored safely to New Balaji inventory.
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery Rider Card */}
                {selectedOrder.assignedDeliveryName && selectedOrder.status !== 'delivered' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-blue-600 font-bold block uppercase tracking-wider">
                          Delivery Partner in Moshi
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {selectedOrder.assignedDeliveryName}
                        </span>
                        <span className="text-slate-500 block text-[11px]">
                          ⚡ EV Two-Wheeler • Delivering in Moshi
                        </span>
                      </div>
                    </div>

                    <a
                      href="tel:+919822098765"
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-blue-700 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider</span>
                    </a>
                  </div>
                )}

                {/* Purchased Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Purchased Grocery Items ({selectedOrder.items.length})
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-10 h-10 object-contain rounded-md bg-slate-50 p-1 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">
                              {item.productName}
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              {item.productUnit} • Qty: {item.quantity} × ₹{item.price}
                            </span>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-900 shrink-0">
                          ₹{item.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Destination & Tax Invoice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Delivery Destination
                    </span>
                    <p className="text-slate-800 font-bold">{selectedOrder.customerName}</p>
                    <p className="text-slate-600">{selectedOrder.deliveryAddress.street}</p>
                    <p className="text-slate-500">{selectedOrder.deliveryAddress.landmark ? `${selectedOrder.deliveryAddress.landmark}, ` : ''}{selectedOrder.deliveryAddress.area}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}</p>
                    <p className="text-slate-600 font-semibold pt-1">Phone: {selectedOrder.deliveryAddress.phone || selectedOrder.customerPhone}</p>
                    {selectedOrder.deliveryInstructions && (
                      <p className="text-emerald-700 italic pt-1">
                        Note: &quot;{selectedOrder.deliveryInstructions}&quot;
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <span className="font-bold text-slate-900 block flex items-center justify-between">
                      <span>GST Tax Invoice Summary</span>
                      <span className="text-[10px] font-mono text-slate-400">GSTIN: {settings.gstin}</span>
                    </span>
                    <div className="flex justify-between text-slate-500">
                      <span>Store:</span>
                      <span className="font-semibold text-slate-800">New Balaji Trading Co.</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Payment Method:</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online UPI'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Payment Status:</span>
                      <span className="font-bold text-emerald-700 capitalize">
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Items Subtotal:</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Coupon Discount ({selectedOrder.couponCode}):</span>
                        <span>-₹{selectedOrder.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Hyperlocal Delivery:</span>
                      <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST (2.5%) + SGST (2.5%):</span>
                      <span>₹{selectedOrder.tax}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                      <span>Total Paid / Payable:</span>
                      <span className="text-emerald-700">₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Cancel Order Action */}
                {['placed', 'confirmed', 'preparing'].includes(selectedOrder.status) && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel This Order</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Confirm Order Cancellation
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel Order #{selectedOrder.orderNumber}? Reserved grocery items will be returned to store inventory immediately.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              >
                <option value="Placed order by mistake">Placed order by mistake</option>
                <option value="Need to change delivery address in Moshi">Need to change delivery address in Moshi</option>
                <option value="Forgot to add more grocery items">Forgot to add more grocery items</option>
                <option value="Delivery time delay">Delivery time delay</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Loading order details...
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
