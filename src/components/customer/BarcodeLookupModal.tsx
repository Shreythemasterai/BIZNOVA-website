'use client';

import React, { useState } from 'react';
import { X, Barcode, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BizNovaDatabase } from '@/lib/db';
import { Product } from '@/types';

export function BarcodeLookupModal({ onSelectProduct }: { onSelectProduct: (p: Product) => void }) {
  const { isBarcodeLookupOpen, setIsBarcodeLookupOpen, addToast } = useApp();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);

  if (!isBarcodeLookupOpen) return null;

  const handleSearch = (codeToSearch?: string) => {
    const code = (codeToSearch || barcodeInput).trim();
    if (!code) return;

    const products = BizNovaDatabase.getProducts();
    const found = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        p.sku.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setMatchedProduct(found);
    } else {
      setMatchedProduct(null);
      addToast(`No item found matching barcode/SKU: ${code}`, 'error');
    }
  };

  const sampleBarcodes = [
    { label: 'Aashirvaad Atta (5kg)', code: '8901030383921' },
    { label: 'Amul Cow Ghee (1L)', code: '8901262010053' },
    { label: 'Tata Toor Dal (1kg)', code: '8901030894721' },
    { label: 'Parle-G Gold (1kg)', code: '8901719102031' },
    { label: 'Society Tea (500g)', code: '8901239100213' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5">
        <button
          onClick={() => {
            setIsBarcodeLookupOpen(false);
            setMatchedProduct(null);
            setBarcodeInput('');
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Barcode &amp; SKU Scanner</h3>
            <p className="text-xs text-slate-500">Scan or enter 13-digit retail barcode</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="e.g. 8901030383921 or SKU"
            className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find</span>
          </button>
        </form>

        {matchedProduct && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-slide-up">
            <img
              src={matchedProduct.imageUrl}
              alt={matchedProduct.name}
              className="w-14 h-14 object-contain rounded-lg bg-white p-1"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Match Found
              </span>
              <h4 className="text-xs font-bold text-slate-900 truncate">{matchedProduct.name}</h4>
              <p className="text-[11px] text-slate-500">
                ₹{matchedProduct.price} • {matchedProduct.unit} • Stock: {matchedProduct.stockQuantity}
              </p>
            </div>
            <button
              onClick={() => {
                onSelectProduct(matchedProduct);
                setIsBarcodeLookupOpen(false);
              }}
              className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all cursor-pointer"
              title="View Product"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Sample Store Shelf Barcodes:
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {sampleBarcodes.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setBarcodeInput(item.code);
                  handleSearch(item.code);
                }}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="font-medium text-slate-800">{item.label}</span>
                <span className="font-mono text-[11px] text-slate-400">{item.code}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
