'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BizNovaDatabase } from '@/lib/db';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import {
  ClipboardList,
  CheckSquare,
  Square,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Truck,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { currentUser, addToast } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const loadPrepOrders = () => {
    const all = BizNovaDatabase.getOrders();
    // Staff focuses on placed, confirmed, preparing, ready_for_pickup
    const prepList = all.filter((o) =>
      ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(o.status)
    );
    setOrders(prepList);
  };

  useEffect(() => {
    loadPrepOrders();
  }, []);

  const toggleItemCheck = (orderId: string, itemId: string) => {
    const key = `${orderId}_${itemId}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartPrep = (orderId: string) => {
    const res = BizNovaDatabase.updateOrderStatus(
      orderId,
      'preparing',
      `${currentUser.name} (Staff)`,
      'Staff began picking and packaging'
    );
    if (res.success) {
      addToast('Order moved to packing', 'info');
      loadPrepOrders();
    }
  };

  const handleMarkReady = (orderId: string) => {
    const res = BizNovaDatabase.updateOrderStatus(
      orderId,
      'ready_for_pickup',
      `${currentUser.name} (Staff)`,
      'Packed, sealed, and staged at delivery pickup bay'
    );
    if (res.success) {
      addToast('Order marked Ready for Pickup!', 'success');
      loadPrepOrders();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950 text-white p-5 rounded-3xl shadow-md border border-amber-800/40">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase mb-1">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Staff Order Fulfillment Queue</span>
            </div>
            <h1 className="text-xl font-black">New Balaji Store Prep Hub</h1>
            <p className="text-xs text-amber-200">
              Active persona: Suresh Patil (Store Associate) • Pick, check, and bag grocery items at Moshi store
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-300">Orders to Pack:</span>
            <span className="text-xl font-black text-amber-400 block">
              {orders.filter((o) => o.status !== 'ready_for_pickup').length} Orders
            </span>
          </div>
        </div>

        {/* Orders in queue */}
        {orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md mx-auto my-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-1">
              No orders are currently awaiting picking or packing. New customer checkouts will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders.map((ord) => {
              const allChecked = ord.items.every(
                (item) => checkedItems[`${ord.id}_${item.id}`]
              );

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Placed at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.status === 'ready_for_pickup'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer & Delivery address snippet */}
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span>Customer: <strong>{ord.customerName}</strong></span>
                      <span className="text-slate-400 font-mono text-[11px]">{ord.deliveryAddress.area}</span>
                    </div>

                    {/* Item Pick List */}
                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Pick & Check Items ({ord.items.length})
                      </span>

                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                        {ord.items.map((item) => {
                          const isChecked = !!checkedItems[`${ord.id}_${item.id}`];
                          return (
                            <div
                              key={item.id}
                              onClick={() => toggleItemCheck(ord.id, item.id)}
                              className={`p-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                                isChecked ? 'bg-emerald-50/60 text-emerald-900' : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className={isChecked ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}>
                                  {item.productName}
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                                Qty: {item.quantity} ({item.productUnit})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {ord.status === 'placed' || ord.status === 'confirmed' ? (
                      <button
                        onClick={() => handleStartPrep(ord.id)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Start Packing Order
                      </button>
                    ) : ord.status === 'preparing' ? (
                      <button
                        onClick={() => handleMarkReady(ord.id)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    ) : (
                      <div className="w-full text-center py-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-xl">
                        ✓ Ready in Delivery Bay for Rider
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
