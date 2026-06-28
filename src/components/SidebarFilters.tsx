import { Star, ShieldCheck, Filter, X, Search, RefreshCw } from 'lucide-react';
import { StoreName } from '../types';

interface SidebarFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStores: StoreName[];
  onToggleStore: (store: StoreName) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  onClearAll: () => void;
  totalResultsCount: number;
}

const ALL_STORES: StoreName[] = ['Amazon', 'Mercado Libre', 'AliExpress', 'Temu'];
const STORE_COLOR_CLASSES: Record<StoreName, string> = {
  'Amazon': 'text-sky-500 border-sky-300 focus:ring-sky-400',
  'Mercado Libre': 'text-amber-500 border-amber-400 focus:ring-amber-500',
  'AliExpress': 'text-rose-500 border-rose-300 focus:ring-rose-400',
  'Temu': 'text-orange-500 border-orange-300 focus:ring-orange-400'
};

const CATEGORIES = [
  { id: 'All', label: 'Todas las Categorías' },
  { id: 'Electronics', label: 'Electrónica y Gadgets' },
  { id: 'Home & Kitchen', label: 'Hogar y Cocina' },
  { id: 'Fashion', label: 'Moda y Accesorios' },
  { id: 'Outdoor', label: 'Aire Libre (Aventura y Outdoor)' },
  { id: 'Tools', label: 'Herramientas y Mejoras' },
  { id: 'Entertainment', label: 'Diversión (Juguetes y Entretenimiento)' }
];

export default function SidebarFilters({
  searchQuery,
  onSearchChange,
  selectedStores,
  onToggleStore,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  onClearAll,
  totalResultsCount
}: SidebarFiltersProps) {
  return (
    <div className="flex flex-col space-y-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm dark:bg-zinc-900/40 dark:border-zinc-800" id="sidebar-filters">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-zinc-800/60">
        <div className="flex items-center space-x-2">
          <Filter className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-300" />
          <h3 className="font-display font-bold text-zinc-900 dark:text-white">Filtros</h3>
        </div>
        <span className="text-xs font-mono font-semibold bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-full">
          {totalResultsCount} resultados
        </span>
      </div>

      {/* Search Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Buscar
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar marcas, artículos..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
          <div className="absolute right-3 top-2.5 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Categorías
        </label>
        <div className="flex flex-col space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`text-left text-sm px-3 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950/20 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Store checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Plataformas
        </label>
        <div className="space-y-2">
          {ALL_STORES.map((store) => {
            const isChecked = selectedStores.includes(store);
            const colorClass = STORE_COLOR_CLASSES[store];
            return (
              <label
                key={store}
                className="flex items-center space-x-2.5 cursor-pointer text-sm text-gray-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleStore(store)}
                  className={`h-4.5 w-4.5 rounded border-gray-300 focus:ring-opacity-50 ${colorClass}`}
                />
                <span>{store}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Slider / Inputs */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Rango de Precios ($)
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Min"
              value={minPrice || ''}
              onChange={(e) => onPriceChange(Number(e.target.value), maxPrice)}
              className="w-full text-center rounded-xl border border-gray-200 bg-white py-1.5 px-2 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
            />
          </div>
          <span className="text-gray-400">—</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder="Max"
              value={maxPrice || ''}
              onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
              className="w-full text-center rounded-xl border border-gray-200 bg-white py-1.5 px-2 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Custom Price Select sliders */}
        <div className="space-y-1.5 pt-1">
          <input
            type="range"
            min="0"
            max="1500"
            step="10"
            value={maxPrice || 1500}
            onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-emerald-500 dark:accent-emerald-400"
          />
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>$0</span>
            <span>$500</span>
            <span>$1000</span>
            <span>$1500+</span>
          </div>
        </div>
      </div>

      {/* Customer ratings */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Calificación de Clientes
        </label>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`flex w-full items-center justify-between text-sm py-1.5 px-2.5 rounded-xl transition-all ${
                minRating === rating
                  ? 'bg-amber-50 text-amber-700 font-bold dark:bg-amber-950/20 dark:text-amber-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(rating) ? 'fill-amber-400' : 'text-gray-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs">o más</span>
              </div>
              <span className="text-xs font-mono font-medium">{rating.toFixed(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearAll}
        className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-dashed border-gray-200 py-2.5 text-xs font-bold text-gray-500 hover:border-gray-300 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-white transition-all-300"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Limpiar Todos los Filtros</span>
      </button>

      {/* Verified Sellers notice */}
      <div className="rounded-xl bg-emerald-50/40 p-3.5 border border-emerald-100/50 dark:bg-emerald-950/10 dark:border-emerald-900/30 flex items-start space-x-2.5">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 dark:text-emerald-400" />
        <div className="text-[11px] leading-relaxed">
          <p className="font-bold text-emerald-800 dark:text-emerald-400">Solo Vendedores Verificados</p>
          <p className="text-gray-500 dark:text-zinc-400 mt-0.5">Todos los productos son recopilados únicamente de tiendas oficiales.</p>
        </div>
      </div>
    </div>
  );
}
