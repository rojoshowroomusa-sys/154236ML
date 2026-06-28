import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Tag, Clock, Zap, ChevronRight, Flame } from 'lucide-react';
import { StoreName, Coupon } from '../types';

const STORE_STYLES: Record<StoreName, { accent: string; badge: string; border: string; bg: string; dot: string }> = {
  'Amazon':       { accent: 'text-sky-600 dark:text-sky-400',   badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',   border: 'border-sky-200/70 dark:border-sky-800/40',   bg: 'bg-sky-50/50 dark:bg-sky-950/10',   dot: 'bg-sky-500' },
  'Mercado Libre':{ accent: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', border: 'border-amber-200/70 dark:border-amber-800/40', bg: 'bg-amber-50/50 dark:bg-amber-950/10', dot: 'bg-amber-500' },
  'AliExpress':   { accent: 'text-rose-600 dark:text-rose-400',  badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',   border: 'border-rose-200/70 dark:border-rose-800/40',   bg: 'bg-rose-50/50 dark:bg-rose-950/10',   dot: 'bg-rose-500' },
  'Temu':         { accent: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', border: 'border-orange-200/70 dark:border-orange-800/40', bg: 'bg-orange-50/50 dark:bg-orange-950/10', dot: 'bg-orange-500' }
};

function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) return `Quedan ${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `Quedan ${hours}h ${mins}m`;
  return `Quedan ${mins}m`;
}

function CouponCard({ coupon }: { coupon: Coupon; key?: any }) {
  const [copied, setCopied] = useState(false);
  const style = STORE_STYLES[coupon.store];
  const timeLeft = getTimeLeft(coupon.expiresAt);
  const isExpiringSoon = new Date(coupon.expiresAt).getTime() - Date.now() < 1000 * 60 * 60 * 24;
  const usagePercent = coupon.maxUses ? Math.round((coupon.usedCount! / coupon.maxUses) * 100) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col rounded-2xl border ${style.border} ${style.bg} overflow-hidden`}
    >
      {/* Top dashed divider line (coupon aesthetic) */}
      <div className="absolute left-0 right-0 top-18 flex items-center px-4 pointer-events-none">
        <div className="flex-1 border-t border-dashed border-gray-200 dark:border-zinc-700/60" />
      </div>
      {/* Left half-circle notch */}
      <div className={`absolute -left-3 top-16 h-6 w-6 rounded-full bg-gray-50 dark:bg-zinc-950 border ${style.border}`} />
      {/* Right half-circle notch */}
      <div className={`absolute -right-3 top-16 h-6 w-6 rounded-full bg-gray-50 dark:bg-zinc-950 border ${style.border}`} />

      {/* Top section */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center space-x-1.5">
            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              <span>{coupon.store}</span>
            </span>
            {coupon.isHot && (
              <span className="inline-flex items-center space-x-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Flame className="h-2.5 w-2.5" />
                <span>Hot</span>
              </span>
            )}
          </div>
          {coupon.category && (
            <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{coupon.category}</span>
          )}
        </div>

        <p className={`text-2xl font-black mt-2 ${style.accent}`}>{coupon.discount}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-snug">{coupon.description}</p>
        {coupon.minOrder && (
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">Compra mín: ${coupon.minOrder}</p>
        )}
      </div>

      {/* Bottom section */}
      <div className="px-5 pb-4 pt-3 flex flex-col space-y-3">
        {/* Code copy row */}
        <button
          onClick={handleCopy}
          className={`group flex items-center justify-between w-full rounded-xl border-2 border-dashed px-3 py-2.5 transition-all duration-200 ${
            copied
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
              : `${style.border} bg-white dark:bg-zinc-900/60 hover:border-opacity-80`
          }`}
          aria-label={`Copy coupon code ${coupon.code}`}
        >
          <span className={`font-mono font-black text-sm tracking-widest ${copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
            {coupon.code}
          </span>
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="h-4 w-4 text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy className="h-4 w-4 text-gray-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Footer row */}
        <div className="flex items-center justify-between text-[10px]">
          <span className={`flex items-center space-x-1 font-semibold ${isExpiringSoon ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-zinc-500'}`}>
            <Clock className="h-3 w-3" />
            <span>{timeLeft}</span>
          </span>

          {coupon.maxUses && (
            <div className="flex items-center space-x-2">
              <div className="w-16 h-1 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <span className="text-gray-400 dark:text-zinc-500">quedan {coupon.maxUses - coupon.usedCount!}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ALL_STORES: StoreName[] = ['Amazon', 'Mercado Libre', 'AliExpress', 'Temu'];

export default function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState<StoreName | 'All'>('All');

  useEffect(() => {
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading coupons:', err);
        setLoading(false);
      });
  }, []);

  const filtered = activeStore === 'All'
    ? coupons
    : coupons.filter((c) => c.store === activeStore);

  const hotCount = coupons.filter((c) => c.isHot).length;

  if (loading) {
    return (
      <div className="w-full py-14 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Cargando cupones...</p>
      </div>
    );
  }

  return (
    <section className="w-full py-14 bg-white dark:bg-zinc-900/20 border-y border-gray-100 dark:border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-widest">Cupones Exclusivos</span>
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <Zap className="h-2.5 w-2.5" />
                <span>{hotCount} HOT</span>
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 flex items-center space-x-2">
              <Tag className="h-5 w-5 text-emerald-500" />
              <span>Cupones de Descuento</span>
            </h2>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Copia el código y úsalo al finalizar tu compra en la tienda.</p>
          </div>

          {/* Store filter tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveStore('All')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                activeStore === 'All'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'border border-gray-200 text-gray-500 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400'
              }`}
            >
              Todas
            </button>
            {ALL_STORES.map((store) => {
              const style = STORE_STYLES[store];
              const isActive = activeStore === store;
              return (
                <button
                  key={store}
                  onClick={() => setActiveStore(store)}
                  className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                    isActive
                      ? `${style.badge} shadow-sm`
                      : 'border border-gray-200 text-gray-500 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  <span>{store}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coupon grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Los cupones se actualizan diariamente. Verifica la vigencia antes de usarlos.</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

      </div>
    </section>
  );
}
