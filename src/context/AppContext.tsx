'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, CartItem, Product, Address } from '@/types';
import { BizNovaDatabase } from '@/lib/db';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  cartSavings: number;
  activeAddress: Address | null;
  setActiveAddress: (address: Address) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isVoiceSearchOpen: boolean;
  setIsVoiceSearchOpen: (open: boolean) => void;
  isBarcodeLookupOpen: boolean;
  setIsBarcodeLookupOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  resetDemoData: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'biznova_cart_items_v2';
const WISHLIST_STORAGE_KEY = 'biznova_wishlist_items_v2';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(() => BizNovaDatabase.getCurrentUser());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isBarcodeLookupOpen, setIsBarcodeLookupOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart, user, and wishlist from storage on mount
  useEffect(() => {
    try {
      const user = BizNovaDatabase.getCurrentUser();
      setCurrentUserState(user);

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setActiveAddress(defaultAddr);
      }

      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }

      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      } else {
        const dbWishlist = BizNovaDatabase.getWishlist(user.id);
        setWishlist(dbWishlist);
      }
    } catch (e) {
      console.error('Error initializing app context:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart, isInitialized]);

  // Save wishlist to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist, isInitialized]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    const users = BizNovaDatabase.getUsers();
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      BizNovaDatabase.setCurrentUser(targetUser.id);
      setCurrentUserState(targetUser);
      if (targetUser.addresses && targetUser.addresses.length > 0) {
        setActiveAddress(targetUser.addresses[0]);
      }
      addToast(`Switched persona to ${targetUser.name} (${role.toUpperCase()})`, 'info');
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stockQuantity <= 0) {
      addToast(`${product.name} is currently out of stock`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stockQuantity) {
          addToast(`Only ${product.stockQuantity} units available at New Balaji store`, 'error');
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQty } : item
        );
      } else {
        if (quantity > product.stockQuantity) {
          addToast(`Only ${product.stockQuantity} units available at New Balaji store`, 'error');
          return prev;
        }
        return [...prev, { productId: product.id, product, quantity }];
      }
    });

    addToast(`Added ${product.name} to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      return prev.map((item) => {
        if (item.productId === productId) {
          if (quantity > item.product.stockQuantity) {
            addToast(`Max available stock is ${item.product.stockQuantity}`, 'error');
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const cartSavings = cart.reduce((savings, item) => {
    if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
      return savings + (item.product.originalPrice - item.product.price) * item.quantity;
    }
    return savings;
  }, 0);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== productId);
        addToast('Removed item from your wishlist', 'info');
      } else {
        updated = [...prev, productId];
        addToast('Saved item to your wishlist ❤️', 'success');
      }
      BizNovaDatabase.toggleWishlist(currentUser.id, productId);
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const resetDemoData = () => {
    BizNovaDatabase.resetDatabaseToDemo();
    setCart([]);
    setWishlist([]);
    const defaultUser = BizNovaDatabase.getCurrentUser();
    setCurrentUserState(defaultUser);
    if (defaultUser.addresses && defaultUser.addresses.length > 0) {
      setActiveAddress(defaultUser.addresses[0]);
    }
    addToast('Demo database restored to pristine New Balaji Trading Co. state!', 'info');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        cartSavings,
        activeAddress,
        setActiveAddress,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        isVoiceSearchOpen,
        setIsVoiceSearchOpen,
        isBarcodeLookupOpen,
        setIsBarcodeLookupOpen,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}

      {/* Global Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center justify-between gap-3 animate-slide-up transition-all ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-900/95 text-white border-slate-700'
                : 'bg-emerald-900/95 text-emerald-50 border-emerald-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs text-white/70 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
