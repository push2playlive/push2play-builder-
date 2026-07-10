import React, { useState } from 'react';
import {
  ShoppingBag, Sparkles, Heart, CreditCard, Trash2, ArrowRight, Check,
  ChevronRight, BadgePercent, Star, ArrowDownToLine, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreItem } from '../types';
import { INITIAL_STORE_ITEMS } from '../mockData';

interface StorePageProps {
  accentColor: string;
  tokenCount: number;
  onBuyCoins: (coins: number) => void;
}

export const StorePage: React.FC<StorePageProps> = ({ accentColor, tokenCount, onBuyCoins }) => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);
  const [cart, setCart] = useState<{ item: StoreItem; qty: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orderHistory, setOrderHistory] = useState<{ id: string; date: string; items: string[]; total: number }[]>([
    { id: 'ORD-1049', date: 'Jul 4, 2026', items: ['Neon Verified Badge'], total: 200 }
  ]);

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'stripe' | 'success'>('cart');
  const [stripeCardName, setStripeCardName] = useState('');
  const [stripeCardNum, setStripeCardNum] = useState('');

  const handleAddToCart = (item: StoreItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
    setShowCartDrawer(true);
    setCheckoutStep('cart');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const toggleWishlist = (itemId: string) => {
    setWishlist((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const cartTotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);

  const handleStripeCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeCardName || !stripeCardNum) {
      alert('Please fill out cardholder details!');
      return;
    }
    setCheckoutStep('success');

    // If coin package purchased, top up PPL coins balance
    cart.forEach((c) => {
      if (c.item.type === 'coins') {
        // e.g., Starter Pack is 500 coins
        onBuyCoins(500 * c.qty);
      }
    });

    setOrderHistory((prev) => [
      {
        id: `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        items: cart.map((c) => c.item.name),
        total: cartTotal,
      },
      ...prev,
    ]);

    setCart([]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#030303] px-4 md:px-6 py-4 space-y-6">
      {/* Header Promo Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-900 bg-gradient-to-r from-zinc-950 via-zinc-900 to-purple-950/20 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-5">
        <div className="space-y-2 max-w-lg">
          <span className="text-[8px] font-black tracking-widest text-purple-400 bg-purple-950/40 border border-purple-900/30 px-2 py-0.5 rounded uppercase">Utube Prime Store</span>
          <h2 className="text-base sm:text-xl font-black text-white leading-tight uppercase tracking-wider">
            UPGRADE YOUR CINEMATIC EXPERIENCE
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed">
            Acquire custom verified neon tags, animated crown emotes, lifetime course access certificates, and physical streetwear apparel with full PPL staking utility integration.
          </p>
        </div>
        <button
          onClick={() => {
            const coinPack = storeItems.find((s) => s.type === 'coins');
            if (coinPack) handleAddToCart(coinPack);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-2xl text-xs font-black uppercase transition-transform hover:scale-[1.01] cursor-pointer flex-shrink-0"
        >
          <BadgePercent className="h-4.5 w-4.5 text-purple-600 animate-bounce" />
          <span>Top Up 500 PPL Coins</span>
        </button>
      </div>

      {/* Main Grid split: Categories / Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <h3 className="text-xs font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
            <Package className="h-4 w-4 text-purple-400" />
            STORE CATALOG ({storeItems.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {storeItems.map((item) => {
              const inWishlist = wishlist.includes(item.id);
              return (
                <div key={item.id} className="bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col justify-between group">
                  <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-zinc-400 hover:text-white"
                    >
                      <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/75 rounded text-[8px] font-mono font-black text-amber-500 tracking-wider uppercase">
                      {item.type}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60 mt-auto">
                      <span className="text-xs font-black font-mono text-zinc-200">
                        {item.type === 'coins' ? `$4.99` : `${item.price.toLocaleString()} PPL`}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-[10px] font-bold text-white transition-all cursor-pointer"
                      >
                        Add Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Order history / Wishlist */}
        <div className="space-y-5">
          {/* Wishlist */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/10" />
              MY WISHLIST ({wishlist.length})
            </h3>
            {wishlist.length === 0 ? (
              <p className="text-[10px] text-zinc-600 font-semibold">Wishlist is empty. Tap hearts on catalog items to save them here.</p>
            ) : (
              <div className="space-y-1.5">
                {wishlist.map((id) => {
                  const item = storeItems.find((s) => s.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-[10px] py-1 border-b border-zinc-900/40">
                      <span className="text-zinc-300 font-bold truncate max-w-[110px]">{item.name}</span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="text-purple-400 hover:underline uppercase text-[9px] font-bold"
                      >
                        Buy Now
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-purple-400" />
              ORDER LOGS
            </h3>
            <div className="space-y-2">
              {orderHistory.map((ord) => (
                <div key={ord.id} className="bg-[#09090b] border border-zinc-900/60 p-2.5 rounded-xl text-[10px] space-y-1">
                  <div className="flex justify-between font-bold text-zinc-500">
                    <span>{ord.id}</span>
                    <span>{ord.date}</span>
                  </div>
                  <p className="text-white font-semibold truncate">{ord.items.join(', ')}</p>
                  <p className="text-[9px] text-amber-500 font-bold font-mono">Total: {ord.total.toLocaleString()} PPL</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED STRIPE CHECKOUT SLIDE DRAWER */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-y-0 right-0 w-80 bg-[#0d0d0f] border-l border-zinc-800 shadow-2xl z-50 flex flex-col p-5 justify-between">
            {/* Drawer Header */}
            <div>
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-purple-400" />
                  Your Shopping Cart
                </h3>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Steps views */}
              {checkoutStep === 'cart' ? (
                /* Cart list */
                <div className="mt-4 space-y-3 overflow-y-auto max-h-[350px]">
                  {cart.length === 0 ? (
                    <p className="text-zinc-600 text-[10px] font-semibold text-center py-10">Your cart is empty.</p>
                  ) : (
                    cart.map((c) => (
                      <div key={c.item.id} className="flex justify-between items-start gap-2 text-[11px] pb-3.5 border-b border-zinc-900/60">
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate">{c.item.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{c.qty}x • {c.item.price.toLocaleString()} PPL</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(c.item.id)}
                          className="text-zinc-600 hover:text-red-500 p-1 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : checkoutStep === 'stripe' ? (
                /* Stripe simulation */
                <form onSubmit={handleStripeCheckout} className="mt-4 space-y-3.5 font-sans">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1.5">
                    <span className="text-[8px] font-black uppercase text-purple-400 flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5" />
                      STRIPE EMBEDDED INTEGRATION
                    </span>
                    <p className="text-[9px] text-zinc-500">Real credit network sandbox configuration.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-zinc-500">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={stripeCardName}
                      onChange={(e) => setStripeCardName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-zinc-500">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="•••• •••• •••• 4242"
                      value={stripeCardNum}
                      onChange={(e) => setStripeCardNum(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#22c55e] text-black font-extrabold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Authorize Transaction</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                /* Success screen */
                <div className="mt-10 text-center space-y-4">
                  <div className="w-10 h-10 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Payment authorized</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed">Coins added or badges enabled. Staking logs updated successfully.</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCartDrawer(false);
                      setCheckoutStep('cart');
                    }}
                    className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-bold text-zinc-200"
                  >
                    Close Store Drawer
                  </button>
                </div>
              )}
            </div>

            {/* Total Footer inside drawer */}
            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="border-t border-zinc-900 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-zinc-500">SUBTOTAL:</span>
                  <span className="text-white font-mono">{cartTotal.toLocaleString()} PPL</span>
                </div>
                <button
                  onClick={() => setCheckoutStep('stripe')}
                  className="w-full py-2 bg-purple-600 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all hover:bg-purple-700 cursor-pointer"
                >
                  Proceed to Stripe Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
