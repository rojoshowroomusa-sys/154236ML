import { Heart, Star, ShoppingCart, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, StoreName } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onViewDetails: () => void;
  shopperCount?: number; // Real-time shoppers looking at this card
}

const STORE_THEMES: Record<StoreName, {
  badge: string;
  button: string;
  border: string;
  dot: string;
  ctaText: string;
}> = {
  'Amazon': {
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-100/50 dark:border-sky-900/40',
    button: 'bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-600 dark:hover:bg-sky-500',
    border: 'hover:border-sky-200 dark:hover:border-sky-900/60',
    dot: 'bg-sky-500',
    ctaText: 'Ver en Amazon'
  },
  'Mercado Libre': {
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/40',
    button: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-medium dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-zinc-950',
    border: 'hover:border-amber-200 dark:hover:border-amber-900/60',
    dot: 'bg-amber-500',
    ctaText: 'Ver Oferta'
  },
  'AliExpress': {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/40',
    button: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-600 dark:hover:bg-rose-500',
    border: 'hover:border-rose-200 dark:hover:border-rose-900/60',
    dot: 'bg-rose-500',
    ctaText: 'Ver en AliExpress'
  },
  'Temu': {
    badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/40',
    button: 'bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-500',
    border: 'hover:border-orange-200 dark:hover:border-orange-900/60',
    dot: 'bg-orange-500',
    ctaText: 'Ver en Temu'
  }
};

export default function ProductCard({
  product,
  isBookmarked,
  onToggleBookmark,
  onViewDetails,
  shopperCount = 0
}: ProductCardProps) {
  const theme = STORE_THEMES[product.store];

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      onClick={onViewDetails}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${theme.border} dark:border-zinc-800 dark:bg-zinc-900/50 hover:shadow-md cursor-pointer`}
      id={`product-card-${product.id}`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50 dark:bg-zinc-950">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dark overlay gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges / Filters Row */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {/* Platform Badge */}
          <span className={`inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
            <span>{product.store}</span>
          </span>

          {/* Discount Badge */}
          {product.discount && (
            <span className="inline-flex items-center space-x-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              <Percent className="h-3 w-3" />
              <span>{product.discount}% DTO</span>
            </span>
          )}
        </div>

        {/* Bookmark Heart Button (touch safe: absolute pointer-events-auto) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          className={`absolute right-3 top-3 z-10 flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-100 bg-white/90 shadow-sm backdrop-blur-xs transition-transform duration-200 active:scale-90 hover:scale-115 dark:border-zinc-800 dark:bg-zinc-900/90 ${
            isBookmarked 
              ? 'text-rose-500 fill-rose-500' 
              : 'text-gray-400 hover:text-rose-500 dark:text-zinc-400'
          }`}
          aria-label="Bookmark deal"
          id={`bookmark-btn-${product.id}`}
        >
          <Heart className="h-4.5 w-4.5" />
        </button>

        {/* Real-time viewer notification badge */}
        {shopperCount > 0 && (
          <div className="absolute bottom-2.5 left-3 flex items-center space-x-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{shopperCount} navegando ahora</span>
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Rating and count */}
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-zinc-400 mb-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span className="ml-1 font-bold text-zinc-700 dark:text-zinc-200">{product.rating.toFixed(1)}</span>
          </div>
          <span>•</span>
          <span>({product.reviewsCount} opiniones)</span>
        </div>

        {/* Title */}
        <h4 className="font-display text-sm sm:text-base font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug tracking-tight mb-3 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
          {product.title}
        </h4>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pricing & CTA Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-zinc-800/60 mt-auto">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-zinc-950 dark:text-white">
              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">
                ${product.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95 ${theme.button}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{theme.ctaText}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
