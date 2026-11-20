'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BizNovaDatabase } from '@/lib/db';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function DeliveryDashboardPage() {
  const { currentUser, addToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [failedReasonModalOpen, setFailedReasonModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [failedReason, setFailedReason] = useState('Customer unreachable on phone');

  const loadDeliveryOrders = () => {
    const all = BizNovaDatabase.getOrders();
    // Delivery rider sees orders assigned or ready for dispatch
    const riderList = all.filter(
      (o) =>
        ['ready_for_pickup', 'out_for_delivery', 'delivered'].includes(o.status)
    );
    setOrders(riderList);
  };

  useEffect(() => {
    loadDeliveryOrders();
  }, []);

  const handlePickUp = (orderId: string) => {
    const res = BizNovaDatabase.updateOrderStatus(
      orderId,
      'out_for_delivery',
      'Akash Shinde (Hyperlocal Rider)',
      'Rider collected bag from New Balaji store and departed on Moshi route'
    );
    if (res.success) {
      addToast('Order marked Out for Delivery', 'success');
      loadDeliveryOrders();
    }
  };

  const handleMarkDelivered = (orderId: string) => {
    const res = BizNovaDatabase.updateOrderStatus(
      orderId,
      'delivered',
      'Akash Shinde (Hyperlocal Rider)',
      'Successfully delivered to customer doorstep in Moshi'
    );
    if (res.success) {
      addToast('Order delivered successfully!', 'success');
      loadDeliveryOrders();
    }
  };

  const handleReportFailed = () => {
    if (!activeOrderId) return;
    const res = BizNovaDatabase.cancelOrder(
      activeOrderId,
      `Delivery failed: ${failedReason}`,
      'Akash Shinde (Hyperlocal Rider)'
    );
    if (res.success) {
      addToast(`Delivery issue reported. Order cancelled & stock restored.`, 'info');
      setFailedReasonModalOpen(false);
      loadDeliveryOrders();
    }
  };

  const activeDeliveries = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastDeliveries = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-950 text-white p-5 rounded-3xl shadow-md border border-blue-800/40">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase mb-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Rider Dispatch & Route Console</span>
            </div>
            <h1 className="text-xl font-black">Express Delivery Partner Hub</h1>
            <p className="text-xs text-blue-200">
              Active persona: Akash Shinde • Assigned zone: Tupe Vasti, Dehu–Moshi Road, Moshi, Pune
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-300">Deliveries in Flight:</span>
            <span className="text-xl font-black text-amber-400 block">
              {activeDeliveries.length} Assigned
            </span>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Active Deliveries ({activeDeliveries.length})
          </h2>

          {activeDeliveries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No active drops pending</h3>
              <p className="text-xs text-slate-500 mt-1">
                You're ready for new dispatches. As orders are prepared in the store, they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeDeliveries.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          ETA: ~{ord.estimatedDeliveryMinutes} mins
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'out_for_delivery'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer Destination Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{ord.customerName}</span>
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs hover:bg-emerald-700"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-800">{ord.deliveryAddress.street}</p>
                          <p className="text-slate-500">
                            {ord.deliveryAddress.area}, {ord.deliveryAddress.city} - {ord.deliveryAddress.pincode}
                          </p>
                        </div>
                      </div>

                      {ord.deliveryInstructions && (
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200">
                          ⚡ Note: "{ord.deliveryInstructions}"
                        </div>
                      )}
                    </div>

                    {/* Items & Payment Info */}
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Items in Bag:</span>
                        <span className="font-semibold text-slate-800">{ord.items.length} grocery items</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Payment Type:</span>
                        <span className="font-bold text-slate-900 uppercase">
                          {ord.paymentMethod === 'cod' ? `Collect Cash: ₹${ord.total}` : 'Paid via Online UPI'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {ord.status === 'ready_for_pickup' ? (
                      <button
                        onClick={() => handlePickUp(ord.id)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Pick Up Bag & Start Route</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setActiveOrderId(ord.id);
                            setFailedReasonModalOpen(true);
                          }}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Report Issue
                        </button>
                        <button
                          onClick={() => handleMarkDelivered(ord.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Delivered to Doorstep</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Completed Deliveries */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Completed Drops Today ({pastDeliveries.length})
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {pastDeliveries.slice(0, 5).map((ord) => (
              <div key={ord.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    #{ord.orderNumber} • {ord.customerName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {ord.deliveryAddress.area} • Delivered at {new Date(ord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  Delivered ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Report Issue Modal */}
      {failedReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Report Delivery Issue
            </h3>
            <p className="text-xs text-slate-500">
              Select reason why this order could not be handed over. The bag will be returned to store stock.
            </p>

            <select
              value={failedReason}
              onChange={(e) => setFailedReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
            >
              <option value="Customer unreachable on phone">Customer unreachable on phone</option>
              <option value="Customer refused package / cancelled">Customer refused package / cancelled</option>
              <option value="Wrong address / apartment inaccessible">Wrong address / apartment inaccessible</option>
              <option value="Heavy rain / traffic road blockage">Heavy rain / traffic road blockage</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setFailedReasonModalOpen(false)}
                className="px-4 py-2 text-slate-600 text-xs font-bold rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleReportFailed}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
