'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { BizNovaDatabase } from '@/lib/db';
import { useApp } from '@/context/AppContext';
import { Product, Order, OrderStatus, Category, AIRecommendation, InventoryLog } from '@/types';
import {
  Store,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  ArrowUpRight,
  ClipboardList,
  Search,
  Filter,
  DollarSign,
  Clock,
  ShieldCheck,
  Send,
  Lightbulb,
  ExternalLink,
  Layers,
  Upload,
  Download,
  Printer,
  FileSpreadsheet,
  Check,
  X,
  MapPin,
  Calendar,
  Phone,
  Barcode,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const { currentUser, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'inventory' | 'orders' | 'ai_advisor' | 'staff' | 'settings'
  >('overview');

  // Database state
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [shopSettings, setShopSettings] = useState(BizNovaDatabase.getShopSettings());

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState(99);
  const [prodOrigPrice, setProdOrigPrice] = useState(120);
  const [prodCostPrice, setProdCostPrice] = useState(80);
  const [prodUnit, setProdUnit] = useState('1 kg');
  const [prodStock, setProdStock] = useState(25);
  const [prodThreshold, setProdThreshold] = useState(8);
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodExpiry, setProdExpiry] = useState('');
  const [prodSupplier, setProdSupplier] = useState('Local Pune FMCG Distributor');
  const [prodVerifiedStock, setProdVerifiedStock] = useState(true);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Restock modal state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [restockNote, setRestockNote] = useState('Weekly supplier delivery');

  // Order Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('Item out of stock at physical store');

  // Printable Tax Invoice modal state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // CSV hidden input ref
  const csvInputRef = useRef<HTMLInputElement>(null);

  // AI Chat state
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<
    { sender: 'user' | 'assistant'; text: string; data?: any; action?: any }[]
  >([
    {
      sender: 'assistant',
      text: 'Namaste! I am the BizNova AI Business Advisor for New Balaji Trading Company (Moshi, Pune). I continuously audit your live transactions, purchase costs, gross margins, and customer demand. Ask me anything about profit, wholesale orders for tomorrow, or dead stock discounts!',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const refreshAllData = () => {
    setMetrics(BizNovaDatabase.getDashboardMetrics());
    setProducts(BizNovaDatabase.getProducts());
    setCategories(BizNovaDatabase.getCategories());
    setOrders(BizNovaDatabase.getOrders());
    setAiRecs(BizNovaDatabase.getAIRecommendations());
    setInventoryLogs(BizNovaDatabase.getInventoryLogs());
    setShopSettings(BizNovaDatabase.getShopSettings());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // PRODUCT CRUD
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('');
    setProdCategory(categories[0]?.id || 'cat_staples');
    setProdPrice(99);
    setProdOrigPrice(120);
    setProdCostPrice(78);
    setProdUnit('1 kg');
    setProdStock(30);
    setProdThreshold(8);
    setProdImage('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setProdDesc('Fresh authentic local kirana grocery item stocked at New Balaji Trading Co.');
    setProdSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setProdBarcode(`890${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setProdExpiry('2026-12-31');
    setProdSupplier('Pune Wholesale Mandi / Moshi Depot');
    setProdVerifiedStock(true);
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdBrand(p.brand || '');
    setProdCategory(p.categoryId);
    setProdPrice(p.price);
    setProdOrigPrice(p.originalPrice || p.price);
    setProdCostPrice(p.costPrice || Math.round(p.price * 0.8));
    setProdUnit(p.unit);
    setProdStock(p.stockQuantity);
    setProdThreshold(p.lowStockThreshold);
    setProdImage(p.imageUrl);
    setProdDesc(p.description);
    setProdSku(p.sku);
    setProdBarcode(p.barcode || '');
    setProdExpiry(p.expiryDate || '');
    setProdSupplier(p.supplierName || 'New Balaji Wholesalers');
    setProdVerifiedStock(p.isVerifiedShopStock ?? true);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === prodCategory);
    const catName = cat ? cat.name : 'General';
    const discount = prodOrigPrice > prodPrice ? Math.round(((prodOrigPrice - prodPrice) / prodOrigPrice) * 100) : 0;

    if (editingProduct) {
      BizNovaDatabase.updateProduct(editingProduct.id, {
        name: prodName,
        brand: prodBrand,
        categoryId: prodCategory,
        categoryName: catName,
        price: Number(prodPrice),
        originalPrice: Number(prodOrigPrice),
        costPrice: Number(prodCostPrice),
        discountPercent: discount,
        unit: prodUnit,
        stockQuantity: Number(prodStock),
        lowStockThreshold: Number(prodThreshold),
        imageUrl: prodImage,
        description: prodDesc,
        sku: prodSku,
        barcode: prodBarcode,
        expiryDate: prodExpiry,
        supplierName: prodSupplier,
        isVerifiedShopStock: prodVerifiedStock,
      });
      addToast(`Updated product "${prodName}"`, 'success');
    } else {
      BizNovaDatabase.addProduct({
        name: prodName,
        slug: prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brand: prodBrand,
        categoryId: prodCategory,
        categoryName: catName,
        price: Number(prodPrice),
        originalPrice: Number(prodOrigPrice),
        costPrice: Number(prodCostPrice),
        discountPercent: discount,
        unit: prodUnit,
        stockQuantity: Number(prodStock),
        lowStockThreshold: Number(prodThreshold),
        isActive: true,
        isFeatured: false,
        imageUrl: prodImage,
        description: prodDesc,
        sku: prodSku,
        barcode: prodBarcode,
        expiryDate: prodExpiry,
        supplierName: prodSupplier,
        isVerifiedShopStock: prodVerifiedStock,
      });
      addToast(`Added new product "${prodName}" to catalog`, 'success');
    }

    setProductModalOpen(false);
    refreshAllData();
  };

  const handleArchiveProduct = (p: Product) => {
    if (confirm(`Archive "${p.name}"? It will no longer appear on the customer storefront.`)) {
      BizNovaDatabase.archiveProduct(p.id);
      addToast(`Archived "${p.name}"`, 'info');
      refreshAllData();
    }
  };

  const handleToggleVerifiedStock = (productId: string) => {
    const res = BizNovaDatabase.toggleVerifiedStock(productId);
    if (res.success) {
      addToast(
        res.isVerified
          ? 'Marked as Verified Shop Stock'
          : 'Removed from Verified Shop Stock',
        'success'
      );
      refreshAllData();
    }
  };

  // CSV IMPORT & EXPORT
  const handleExportCSV = () => {
    const headers = [
      'id',
      'sku',
      'barcode',
      'name',
      'brand',
      'categoryId',
      'categoryName',
      'price',
      'originalPrice',
      'costPrice',
      'unit',
      'stockQuantity',
      'lowStockThreshold',
      'supplierName',
      'expiryDate',
      'isVerifiedShopStock',
    ];
    const rows = products.map((p) => [
      p.id,
      p.sku,
      p.barcode || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.brand || '').replace(/"/g, '""')}"`,
      p.categoryId,
      `"${(p.categoryName || '').replace(/"/g, '""')}"`,
      p.price,
      p.originalPrice || p.price,
      p.costPrice || Math.round(p.price * 0.8),
      `"${(p.unit || '').replace(/"/g, '""')}"`,
      p.stockQuantity,
      p.lowStockThreshold,
      `"${(p.supplierName || '').replace(/"/g, '""')}"`,
      p.expiryDate || '',
      p.isVerifiedShopStock ? 'true' : 'false',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `new_balaji_catalog_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Exported product catalog to CSV', 'success');
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = BizNovaDatabase.importProductsFromCSV(text);
        if (result.success) {
          addToast(`Imported ${result.importedCount} products from CSV successfully!`, 'success');
          refreshAllData();
        } else {
          addToast(result.errors?.[0] || 'Failed to parse CSV', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // CATEGORY CRUD
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDescription(cat.description || '');
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      const res = BizNovaDatabase.updateCategory(editingCategory.id, {
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDescription,
      });
      if (res.success) {
        addToast(`Category "${catName}" updated`, 'success');
        setCategoryModalOpen(false);
        refreshAllData();
      } else {
        addToast(res.error || 'Failed to update category', 'error');
      }
    } else {
      const res = BizNovaDatabase.addCategory({
        name: catName,
        slug: catSlug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: catDescription,
        iconName: 'ShoppingBag',
        color: 'from-emerald-500 to-teal-600',
      });
      if (res.success) {
        addToast(`Category "${catName}" created`, 'success');
        setCategoryModalOpen(false);
        refreshAllData();
      } else {
        addToast(res.error || 'Failed to create category', 'error');
      }
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    if (confirm(`Delete category "${cat.name}"? Only categories with 0 assigned products can be deleted.`)) {
      const res = BizNovaDatabase.deleteCategory(cat.id);
      if (res.success) {
        addToast(`Category "${cat.name}" removed`, 'info');
        refreshAllData();
      } else {
        addToast(res.error || 'Cannot delete category that contains active products', 'error');
      }
    }
  };

  // RESTOCK ACTION
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;

    BizNovaDatabase.restockProduct(
      restockProduct.id,
      Number(restockQty),
      restockNote,
      `${currentUser.name} (Store Owner)`
    );

    addToast(`Restocked +${restockQty} units of ${restockProduct.name}`, 'success');
    setRestockModalOpen(false);
    refreshAllData();
  };

  // ORDER MANAGEMENT
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const res = BizNovaDatabase.updateOrderStatus(
      orderId,
      newStatus,
      `${currentUser.name} (Owner)`,
      `Status updated by store management`
    );

    if (res.success) {
      addToast(`Order updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
      refreshAllData();
    } else {
      addToast(res.error || 'Failed to update order status', 'error');
    }
  };

  const handleConfirmRejectOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectOrderId) return;

    const res = BizNovaDatabase.rejectOrder(rejectOrderId, rejectReason);
    if (res.success) {
      addToast('Order rejected. Stock was automatically restored to store inventory.', 'info');
      setRejectModalOpen(false);
      setRejectOrderId('');
      refreshAllData();
    } else {
      addToast(res.error || 'Failed to reject order', 'error');
    }
  };

  const handleAssignDelivery = (orderId: string, deliveryId: string, deliveryName: string) => {
    BizNovaDatabase.assignStaff(orderId, deliveryId, deliveryName, 'delivery');
    addToast(`Assigned delivery to ${deliveryName}`, 'info');
    refreshAllData();
  };

  // AI ADVISOR ACTIONS
  const handleSendAiQuery = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q.trim()) return;

    const userMessage = { sender: 'user' as const, text: q };
    setAiChatHistory((prev) => [...prev, userMessage]);
    setAiQuery('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAiChatHistory((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: json.data.content,
            data: json.data.supportingData,
            action: json.data.suggestedAction,
          },
        ]);
      } else {
        throw new Error(json.error || 'Failed response');
      }
    } catch (err: any) {
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ Error consulting AI advisor: ${err.message}`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApproveAiAction = (recId: string) => {
    const result = BizNovaDatabase.approveAIAction(recId);
    if (result.success) {
      addToast(result.message || 'Action executed successfully in database', 'success');
      refreshAllData();
    } else {
      addToast(result.message || 'Failed to execute action', 'error');
    }
  };

  const handleDismissAiAction = (recId: string) => {
    BizNovaDatabase.dismissAIRecommendation(recId);
    addToast('Recommendation dismissed', 'info');
    refreshAllData();
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  const filteredCatalog = products.filter((p) => {
    if (verifiedFilter === 'verified' && !p.isVerifiedShopStock) return false;
    if (verifiedFilter === 'unverified' && p.isVerifiedShopStock) return false;
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      p.categoryName?.toLowerCase().includes(q)
    );
  });

  // Chart data
  const revenueChartData = [
    { day: 'Mon', revenue: 4200, profit: 890 },
    { day: 'Tue', revenue: 6100, profit: 1320 },
    { day: 'Wed', revenue: 5300, profit: 1140 },
    { day: 'Thu', revenue: 7800, profit: 1710 },
    { day: 'Fri', revenue: 9400, profit: 2120 },
    { day: 'Sat', revenue: 14200, profit: 3260 },
    {
      day: 'Sun (Today)',
      revenue: metrics?.todayRevenue || 8900,
      profit: metrics?.todayGrossProfit || 1950,
    },
  ];

  const categoryPieData = metrics?.categoryBreakdown || [];
  const PIE_COLORS = [
    '#059669',
    '#10b981',
    '#34d399',
    '#6ee7b7',
    '#0d9488',
    '#14b8a6',
    '#2dd4bf',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Admin Subheader */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">
                  New Balaji Trading Company — Control Center
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  Moshi, Pune Store #01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tupe Vasti, Dehu–Moshi Road • Logged in as Balaji Management (Owner Role)
              </p>
            </div>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Today's Sales</span>
              <span className="text-emerald-400 font-bold text-sm">
                ₹{metrics?.todayRevenue || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Today's Profit</span>
              <span className="text-purple-300 font-bold text-sm">
                ₹{metrics?.todayGrossProfit || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Pending Orders</span>
              <span className="text-amber-400 font-bold text-sm">
                {metrics?.pendingOrdersCount || 0}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Stock Risk</span>
              <span className="text-rose-400 font-bold text-sm">
                {(metrics?.lowStockCount || 0) + (metrics?.outOfStockCount || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'overview', label: 'Dashboard & Profit', icon: TrendingUp },
            { id: 'products', label: 'Products & Pricing', icon: Package },
            { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
            { id: 'inventory', label: 'Inventory & Stock Logs', icon: AlertTriangle },
            { id: 'orders', label: 'Order Processing', icon: ShoppingBag },
            { id: 'ai_advisor', label: 'BizNova Intelligence', icon: Sparkles, badge: 'AI Engine' },
            { id: 'staff', label: 'Staff & Delivery', icon: Users },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 text-[9px] uppercase font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                   */}
        {/* ============================================================== */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* KPI Cards — Distinguishing Revenue vs Gross Profit Clearly */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Delivered Revenue</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +18.4% vs last week
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-xs">
                <span className="text-[11px] text-purple-700 font-bold uppercase tracking-wider block">Estimated Gross Profit</span>
                <p className="text-xl font-black text-purple-900 mt-1">
                  ₹{metrics.estimatedGrossProfit.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-purple-600 font-bold block mt-1">
                  Margin: <strong>{metrics.grossProfitMargin}%</strong> (Revenue – COGS)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Today's Sales</span>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  ₹{metrics.todayRevenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Profit: ₹{metrics.todayGrossProfit}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Avg Order Value</span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  ₹{metrics.averageOrderValue}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Across {metrics.completedOrdersCount} orders
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Orders In Flight</span>
                <p className="text-xl font-black text-amber-600 mt-1">
                  {metrics.pendingOrdersCount}
                </p>
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  Action required
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Inventory Asset Value</span>
                <p className="text-xl font-black text-blue-600 mt-1">
                  ₹{metrics.inventoryValuation.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {metrics.totalProducts} unique SKUs
                </span>
              </div>
            </div>

            {/* Financial Transparency Alert Box */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-900">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <strong className="font-bold">Strict Accounting Distinction:</strong> Revenue (₹{metrics.totalRevenue.toLocaleString('en-IN')}) is total cash receipt. Cost of Goods Sold (COGS) is ₹{metrics.totalCOGS.toLocaleString('en-IN')}. True Gross Profit is <strong>₹{metrics.estimatedGrossProfit.toLocaleString('en-IN')}</strong> ({metrics.grossProfitMargin}% net margin).
                </div>
              </div>
              <button
                onClick={() => setActiveTab('ai_advisor')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold whitespace-nowrap cursor-pointer"
              >
                Open Profit Advisor →
              </button>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Weekly Sales & Profit Trend */}
              <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Weekly Revenue & Profit (INR)</h3>
                    <p className="text-xs text-slate-400">Green = Gross Revenue, Purple = Gross Profit</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Live Database
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#059669" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill="#8b5cf6" name="Gross Profit" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Sales Share */}
              <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">Sales Share by Category</h3>
                <p className="text-xs text-slate-400 mb-4">Top contributors to store basket size</p>

                <div className="h-64 w-full flex items-center justify-center">
                  {categoryPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryPieData.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400">Loading category sales...</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categoryPieData.slice(0, 4).map((cat: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="truncate">{cat.name}:</span>
                      <strong className="text-slate-900">₹{cat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS & CATALOG MANAGEMENT                           */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  New Balaji Product Catalog ({products.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Manage prices, purchase costs, profit margins, stock levels, and verified store status
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search name, SKU, barcode..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Verified Filter */}
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
                >
                  <option value="all">All Products</option>
                  <option value="verified">Verified Shop Stock Only</option>
                  <option value="unverified">Unverified Only</option>
                </select>

                {/* CSV Import Hidden Input */}
                <input
                  type="file"
                  ref={csvInputRef}
                  onChange={handleCSVUpload}
                  accept=".csv"
                  className="hidden"
                />

                <button
                  onClick={() => csvInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                  title="Import products from a CSV spreadsheet"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                  title="Export product catalog as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={openAddProductModal}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table with Purchase Cost & Profit Margin */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">Cost & Margin</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Verified Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map((prod) => {
                    const cost = prod.costPrice || Math.round(prod.price * 0.8);
                    const margin = prod.price > 0 ? Math.round(((prod.price - cost) / prod.price) * 100) : 0;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {prod.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {prod.unit} • SKU: {prod.sku} {prod.barcode ? `• Barcode: ${prod.barcode}` : ''}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-600">
                          {prod.categoryName}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900">₹{prod.price}</span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              ₹{prod.originalPrice}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-semibold block">₹{cost} cost</span>
                          <span className={`text-[10px] font-bold ${margin >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {margin}% margin (₹{prod.price - cost})
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              prod.stockQuantity <= 0
                                ? 'bg-rose-100 text-rose-800'
                                : prod.stockQuantity <= prod.lowStockThreshold
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prod.stockQuantity} units
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleVerifiedStock(prod.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                              prod.isVerifiedShopStock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                            title="Click to toggle verified stock status"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{prod.isVerifiedShopStock ? 'Verified' : 'Unverified'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prod.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {prod.isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setRestockProduct(prod);
                                setRestockModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] cursor-pointer"
                              title="Quick Restock"
                            >
                              + Stock
                            </button>
                            {prod.isActive && (
                              <button
                                onClick={() => handleArchiveProduct(prod)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Archive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: CATEGORY CATALOG MANAGEMENT (14 Official Categories)     */}
        {/* ============================================================== */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Product Categories ({categories.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Full control over grocery departments. Create, rename, or remove categories.
                </p>
              </div>

              <button
                onClick={openAddCategoryModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, idx) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {count} products
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {cat.description || 'Essential grocery department'}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block mt-2">
                        ID: {cat.id}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: INVENTORY MANAGEMENT & AUDIT LOGS                       */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Inventory Alerts Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs">
                <span className="text-xs font-bold text-rose-600 block uppercase">
                  Out of Stock Alert (Lost Sales)
                </span>
                <p className="text-2xl font-black text-rose-700 mt-1">
                  {metrics?.outOfStockCount || 0} items
                </p>
                <p className="text-xs text-slate-500 mt-1">Zero units currently on shelf</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
                <span className="text-xs font-bold text-amber-600 block uppercase">
                  Low Stock Warning (Buffer Risk)
                </span>
                <p className="text-2xl font-black text-amber-700 mt-1">
                  {metrics?.lowStockCount || 0} items
                </p>
                <p className="text-xs text-slate-500 mt-1">Quantity is below safety reorder threshold</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                <span className="text-xs font-bold text-emerald-600 block uppercase">
                  Total Working Capital in Inventory
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-1">
                  ₹{metrics?.inventoryValuation.toLocaleString('en-IN') || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Valued at wholesale cost price</p>
              </div>
            </div>

            {/* Inventory Audit Logs Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Live Stock Audit Trail ({inventoryLogs.length} Records)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable history of stock-in, customer orders, returns, and manual adjustments
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Change Type</th>
                      <th className="py-3 px-4">Delta Qty</th>
                      <th className="py-3 px-4">Final Stock</th>
                      <th className="py-3 px-4">Authorized By</th>
                      <th className="py-3 px-4">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.productName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.reason === 'restock'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.reason === 'order'
                                ? 'bg-blue-100 text-blue-800'
                                : log.reason === 'cancellation_return'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {log.reason.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 font-bold font-mono ${
                            log.change > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {log.change > 0 ? `+${log.change}` : log.change}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">{log.newStock}</td>
                        <td className="py-3 px-4 text-slate-600">{log.performedBy}</td>
                        <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">{log.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: ORDER PROCESSING & LIFECYCLE                           */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Store Orders ({orders.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Accept orders, update preparation state, reject with stock restoration, or print invoices
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="all">All Orders</option>
                  <option value="placed">Placed (New)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total & Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Delivery</th>
                    <th className="py-3 px-4 text-right">Actions & Lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {ord.deliveryAddress.area} • {ord.customerPhone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-slate-900">₹{ord.total}</span>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online UPI'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'out_for_delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'cancelled' || ord.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {ord.assignedDeliveryName ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            {ord.assignedDeliveryName}
                          </span>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignDelivery(ord.id, 'usr_delivery_1', 'Rahul Verma');
                              }
                            }}
                            className="p-1 rounded-lg border border-slate-200 text-[11px] bg-slate-50 cursor-pointer"
                          >
                            <option value="">+ Assign Rider</option>
                            <option value="usr_delivery_1">Rahul Verma (Moshi Zone)</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Invoice Print Button */}
                          <button
                            onClick={() => setInvoiceOrder(ord)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Print Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {ord.status === 'placed' && (
                            <>
                              <button
                                onClick={() => handleOrderStatusChange(ord.id, 'confirmed')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  setRejectOrderId(ord.id);
                                  setRejectModalOpen(true);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ord.status === 'confirmed' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'preparing')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Start Prep
                            </button>
                          )}
                          {ord.status === 'preparing' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'ready_for_pickup')}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Ready for Pickup
                            </button>
                          )}
                          {ord.status === 'ready_for_pickup' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'out_for_delivery')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Dispatch
                            </button>
                          )}
                          {ord.status === 'out_for_delivery' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: BIZNOVA INTELLIGENCE — AI BUSINESS ADVISOR               */}
        {/* ============================================================== */}
        {activeTab === 'ai_advisor' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-emerald-950 text-white border border-purple-800/40 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real-Time Kirana AI Business Advisor</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    BizNova Intelligence — New Balaji Trading Co.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Auditing live database transactions, purchase costs, gross margins, customer search logs, and seasonal Pune FMCG demand. No fabricated statistics.
                  </p>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    ● Intelligence Engine Active
                  </span>
                  <span className="font-semibold text-slate-200">
                    Tupe Vasti, Moshi Corridor
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Section Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Section A: Demand Forecast */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase">
                  <TrendingUp className="w-4 h-4" />
                  <span>A. Product Demand Forecast</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Top Velocity Essentials (Moshi)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aashirvaad Chakki Atta and Amul Taaza Milk have 4.8x weekly reorder rates. Recommend maintaining 30+ units buffer ahead of weekend family dinners.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Weekly velocity: <strong>High</strong></span>
                  <span className="text-emerald-600 font-bold">98% In-Stock Target</span>
                </div>
              </div>

              {/* Section B: Profit Analysis */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                  <DollarSign className="w-4 h-4" />
                  <span>B. Gross Profit Analysis</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Top Gross Profit Contributors
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Amul Pure Cow Ghee generates highest absolute rupee profit (₹76/unit), despite smaller unit volume than milk. Ghee + Rice bundles maximize store basket margin.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Total Gross Margin: <strong>{metrics?.grossProfitMargin || 21}%</strong></span>
                  <span className="text-purple-600 font-bold">₹{metrics?.estimatedGrossProfit}</span>
                </div>
              </div>

              {/* Section C: Seasonal Trends */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
                  <Clock className="w-4 h-4" />
                  <span>D. Pune Seasonal Demand</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Summer & Pre-Monsoon Waves
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rising Pune temperatures (37°C) drive +35% surge in cold beverages, Real juice, and glucose drinks. Feature hydration banners on the storefront homepage.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Forecast surge: <strong>+35%</strong></span>
                  <span className="text-amber-600 font-bold">Action Recommended</span>
                </div>
              </div>
            </div>

            {/* Section C & E: Smart Additions & Inventory Intelligence Proposals */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Actionable AI Recommendations Awaiting Owner Decision</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    The AI advises with verifiable evidence. No changes occur without your explicit approval.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      rec.status === 'approved'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : rec.status === 'dismissed'
                        ? 'opacity-50 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rec.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : rec.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>

                      <span className="text-[10px] text-slate-400 font-semibold">
                        Confidence: {rec.confidence}%
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Supporting Metric */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 text-[11px] font-mono text-slate-700 border border-slate-100">
                      📊 Evidence: {rec.supportingMetric}
                    </div>

                    {/* External Source if present */}
                    {rec.externalSource && (
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                        <span>Source: {rec.externalSource.title} ({rec.externalSource.date})</span>
                      </div>
                    )}

                    {/* Approval Buttons */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {rec.status === 'approved' ? (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Action Executed in Store Database</span>
                        </span>
                      ) : rec.status === 'dismissed' ? (
                        <span className="text-xs font-semibold text-slate-400">Dismissed</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDismissAiAction(rec.id)}
                            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleApproveAiAction(rec.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                          >
                            {rec.suggestedAction?.label || 'Approve & Execute Action'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section F: Interactive AI Chat Interface */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[560px]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-900">
                    Live Chat with BizNova AI Advisor (New Balaji Trading Co.)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Answers cite real database metrics and wholesale margins
                </span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Supporting Data Chips */}
                      {msg.data && msg.data.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-2">
                          {msg.data.map((d: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 font-mono text-[10px]"
                            >
                              {d.label}: <strong>{d.value}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Suggested Action Button inside chat */}
                      {msg.action && (
                        <div className="mt-3 pt-2">
                          <button
                            onClick={() => {
                              if (msg.action.actionType === 'restock') {
                                BizNovaDatabase.restockProduct(
                                  msg.action.payload.productId,
                                  msg.action.payload.quantity,
                                  'Restocked via AI Advisor Chat',
                                  'AI Advisor'
                                );
                                addToast(`Restocked ${msg.action.payload.quantity} units!`, 'success');
                                refreshAllData();
                              } else {
                                addToast('Proposal created! Check proposals section above.', 'info');
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            ⚡ {msg.action.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                    <span>BizNova Advisor is calculating real store sales, margins, and stock metrics...</span>
                  </div>
                )}
              </div>

              {/* All 8 Prompt Action Chips requested by Owner */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-none text-[11px]">
                <button
                  onClick={() => handleSendAiQuery('Which products generated the highest profit this week?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  💰 Highest profit products
                </button>
                <button
                  onClick={() => handleSendAiQuery('What should I purchase tomorrow?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  📋 What to buy tomorrow
                </button>
                <button
                  onClick={() => handleSendAiQuery('Which products are not selling?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  📦 Products not selling
                </button>
                <button
                  onClick={() => handleSendAiQuery('Which products should I add to my shop?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  🔍 New products to add
                </button>
                <button
                  onClick={() => handleSendAiQuery('What should I reorder?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  🚨 What to reorder
                </button>
                <button
                  onClick={() => handleSendAiQuery('Which products should I discount?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  🏷️ Items to discount
                </button>
                <button
                  onClick={() => handleSendAiQuery('How can I improve my monthly profit?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  📈 Improve monthly profit
                </button>
                <button
                  onClick={() => handleSendAiQuery('What are my best-selling products?')}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-500 font-semibold text-slate-700 whitespace-nowrap cursor-pointer shadow-2xs hover:bg-emerald-50"
                >
                  🚀 Best-selling staples
                </button>
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendAiQuery();
                }}
                className="p-3 bg-white border-t border-slate-200 flex gap-2"
              >
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a question about your grocery inventory, profit, margins, or Moshi market demand..."
                  className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: STAFF & DELIVERY MANAGEMENT                             */}
        {/* ============================================================== */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              New Balaji Staff & Hyperlocal Delivery Riders
            </h2>
            <p className="text-xs text-slate-500">
              Team members handling quick order fulfillment in Moshi & Dehu Road
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center">
                    NB
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Balaji Store Management</span>
                    <span className="text-[10px] text-purple-700 font-bold uppercase">Store Owner</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Full owner permissions: Product pricing, catalogue, inventory audits, and financial reports.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                    RV
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Rahul Verma</span>
                    <span className="text-[10px] text-blue-700 font-bold uppercase">Active EV Delivery Partner</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Assigned zone: Moshi Gaon, Tupe Vasti, and Spine Road. Average delivery time: 18 mins.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                    AK
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Anjali Kulkarni</span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Store Inventory Specialist</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Assigned to shelf replenishment, incoming wholesale stock verification, and order packaging.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: STORE SETTINGS & OPERATING RULES                        */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 max-w-2xl space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Shop Operating Rules & Pricing Settings
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                BizNovaDatabase.updateShopSettings(shopSettings);
                addToast('Shop configuration saved successfully!', 'success');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Name</label>
                <input
                  type="text"
                  value={shopSettings.shopName}
                  onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={shopSettings.minOrderAmount}
                    onChange={(e) =>
                      setShopSettings({ ...shopSettings, minOrderAmount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Standard Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={shopSettings.deliveryFee}
                    onChange={(e) =>
                      setShopSettings({ ...shopSettings, deliveryFee: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Free Delivery Above (₹)</label>
                  <input
                    type="number"
                    value={shopSettings.freeDeliveryAbove}
                    onChange={(e) =>
                      setShopSettings({ ...shopSettings, freeDeliveryAbove: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Delivery Time (Mins)</label>
                  <input
                    type="number"
                    value={shopSettings.estimatedDeliveryMinutes}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        estimatedDeliveryMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Store Address</label>
                <input
                  type="text"
                  value={shopSettings.address}
                  onChange={(e) => setShopSettings({ ...shopSettings, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product to New Balaji Trading'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="e.g. Amul, Tata, Suhana"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={prodOrigPrice}
                    onChange={(e) => setProdOrigPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-700 block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-bold text-purple-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="e.g. 500 ml, 1 kg"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low Threshold</label>
                  <input
                    type="number"
                    value={prodThreshold}
                    onChange={(e) => setProdThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barcode / EAN</label>
                  <input
                    type="text"
                    value={prodBarcode}
                    onChange={(e) => setProdBarcode(e.target.value)}
                    placeholder="890..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={prodExpiry}
                    onChange={(e) => setProdExpiry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supplier / Distributor</label>
                  <input
                    type="text"
                    value={prodSupplier}
                    onChange={(e) => setProdSupplier(e.target.value)}
                    placeholder="e.g. Moshi FMCG Depot"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              {/* Verified Stock Checkbox */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={prodVerifiedStock}
                  onChange={(e) => setProdVerifiedStock(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="verifiedCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Verified Physical Stock (Stocked directly at New Balaji Trading Co.)
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Rice, Atta and Grains"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="e.g. rice-atta-grains"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Category highlights or items included..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>


              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModalOpen && restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Restock Product: {restockProduct.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current stock is <strong>{restockProduct.stockQuantity} units</strong>. How many units were received from supplier?
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supplier Note / Invoice Ref</label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-slate-900">
                Reject Order & Restore Stock
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Rejecting will automatically cancel the order and return all deducted products back to physical store inventory.
            </p>

            <form onSubmit={handleConfirmRejectOrder} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Rejection</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="Item temporarily out of stock at physical store">Item temporarily out of stock</option>
                  <option value="Customer delivery location out of service zone">Customer out of delivery zone</option>
                  <option value="Store closing / peak delivery rush">Store closing / rush</option>
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable GST Tax Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">TAX INVOICE</h3>
                <p className="text-xs font-bold text-emerald-800">New Balaji Trading Company</p>
                <p className="text-[10px] text-slate-500">Tupe Vasti, Dehu–Moshi Road, Moshi, Pune 412105</p>
                <p className="text-[10px] text-slate-500">GSTIN: 27AABCN1234F1Z5 • FSSAI: 21523000000000</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {invoiceOrder.orderNumber}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Billed To:</span>
              <p className="text-slate-700 font-semibold">{invoiceOrder.customerName}</p>
              <p className="text-slate-500">{invoiceOrder.customerPhone}</p>
              <p className="text-slate-500">
                {invoiceOrder.deliveryAddress.street}, {invoiceOrder.deliveryAddress.area}, Moshi, Pune - {invoiceOrder.deliveryAddress.pincode}
              </p>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">{it.productName}</td>
                      <td className="p-2 text-center text-slate-600">{it.quantity}</td>
                      <td className="p-2 text-right text-slate-600">₹{it.price}</td>
                      <td className="p-2 text-right font-bold text-slate-900">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">₹{invoiceOrder.subtotal}</span>
              </div>
              {invoiceOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount:</span>
                  <span className="font-bold">-₹{invoiceOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-bold text-slate-900">
                  {invoiceOrder.deliveryFee === 0 ? 'FREE' : `₹${invoiceOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700">₹{invoiceOrder.total}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center pt-2">
                Payment Method: {invoiceOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online UPI'} • Status: PAID
              </p>
            </div>

            {/* Print & Close */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
