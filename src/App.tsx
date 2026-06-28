import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'motion/react';
import { Search, Compass, ShieldCheck, TrendingDown, Users, Sparkles, MessageSquare, AlertCircle, Grid, List, ChevronRight, ChevronLeft, Heart, ArrowUpRight, Star } from 'lucide-react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SidebarFilters from './components/SidebarFilters';
import ProductCard from './components/ProductCard';
import DealDetailModal from './components/DealDetailModal';
import CouponsSection from './components/CouponsSection';
// import AdminPanel (removed)
import AdminPage from './pages/AdminPage';
import { Product, User, LiveEvent, StoreName } from './types';

const CATEGORY_LABELS: Record<string, string> = {
  'All': 'Todas las Ofertas Curadas',
  'Electronics': 'Electrónica y Gadgets',
  'Home & Kitchen': 'Hogar y Cocina',
  'Fashion': 'Moda y Accesorios',
  'Outdoor': 'Aire Libre (Aventura y Outdoor)',
  'Tools': 'Herramientas y Mejoras',
  'Entertainment': 'Diversión (Juguetes y Entretenimiento)'
};


export default function App() {
  // Views and Theme States
  const [currentView, setView] = useState<'home' | 'electronics' | 'favorites'>('home');
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // User Authentication State
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Admin page navigation state (not used for modal now)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false); // retained for backward compatibility

  // Products Database
  const [products, setProducts] = useState<Product[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStores, setSelectedStores] = useState<StoreName[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);

  // Sort and Display States
  const [sortBy, setSortBy] = useState<'popular' | 'low-high' | 'high-low' | 'discount'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Real-Time Events Stream
  const [events, setEvents] = useState<LiveEvent[]>([]);

  // Apply Tailwind theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch initial products & bookmarks if user is logged in
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.error('Error fetching products', err);
        setLoadingProducts(false);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    fetch(`/api/bookmarks/${user.id}`)
      .then((res) => res.json())
      .then((data) => setBookmarks(data))
      .catch((err) => console.error('Error fetching bookmarks', err));
  }, [user]);

  // Establish Real-Time SSE Connection with express backend
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const liveEvt: LiveEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, liveEvt].slice(-50)); // store last 50 events in state
        
        // Dispatch to window so other components can pick up live updates
        window.dispatchEvent(new CustomEvent('live-event', { detail: liveEvt }));
      } catch (err) {
        console.error('Error parsing live SSE event', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error, retrying...', err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Sync user logging
  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));
  };

  const handleLogout = () => {
    setUser(null);
    setBookmarks([]);
    localStorage.removeItem('user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('supabase_token');
  };

  // Toggle Bookmark logic
  const handleToggleBookmark = async (productId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId })
      });

      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error('Error toggling bookmark', err);
    }
  };

  // Filter & Sort core logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search matching
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.store.toLowerCase().includes(searchQuery.toLowerCase());

      // Store selection matching
      const matchesStore = selectedStores.length === 0 || selectedStores.includes(p.store);

      // Category matching
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      // Pricing matching
      const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

      // Rating matching
      const matchesRating = p.rating >= minRating;

      return matchesSearch && matchesStore && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchQuery, selectedStores, selectedCategory, minPrice, maxPrice, minRating]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'low-high') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'high-low') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'discount') {
      return list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }
    // Default sorting - 'popular': combination of rating and count
    return list.sort((a, b) => (b.rating * b.reviewsCount) - (a.rating * a.reviewsCount));
  }, [filteredProducts, sortBy]);

  // Pagination helper
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedStores([]);
    setSelectedCategory('All');
    setMinPrice(0);
    setMaxPrice(1500);
    setMinRating(0);
    setSortBy('popular');
    setCurrentPage(1);
  };

  // Curated items shown on the landing home page
  const curatedMLOffers = useMemo(() => {
    return products.filter((p) => p.store === 'Mercado Libre').slice(0, 4);
  }, [products]);

  const curatedAliOffers = useMemo(() => {
    return products.filter((p) => p.store === 'AliExpress').slice(0, 3);
  }, [products]);

  const curatedTemuOffers = useMemo(() => {
    return products.filter((p) => p.store === 'Temu').slice(0, 4);
  }, [products]);

  // Curated Amazon grid elements
  const kindleScribe = useMemo(() => products.find((p) => p.id === 'am-1'), [products]);
  const echoPop = useMemo(() => products.find((p) => p.id === 'am-2'), [products]);
  const fireStick = useMemo(() => products.find((p) => p.id === 'am-3'), [products]);

  // Calculate real-time simulated shoppers browse count for products
  const productShopperCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Seed counts randomly but stably using IDs
    products.forEach((p) => {
      const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      counts[p.id] = (seed % 8) + 1; // 1 to 8 shoppers
    });
    // Add real-time variations based on current events list length
    events.forEach((evt, idx) => {
      if (evt.productId && counts[evt.productId]) {
        counts[evt.productId] = Math.min(12, counts[evt.productId] + (idx % 2 === 0 ? 1 : -1));
      }
    });
    return counts;
  }, [products, events]);

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white" id="globalshop-app">
      {/* Navigation bar */}
      <Navbar
        currentView={currentView}
        setView={(view) => {
          setView(view);
          setCurrentPage(1);
        }}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAdmin={() => setAdminPanelOpen(true)}
      />

      {/* Renderizar AdminPage */}
      {adminPanelOpen && (
        <AdminPage
          onClose={() => setAdminPanelOpen(false)}
        />
      )}

      {/* VIEW PANEL CONTROLLER */}
      <main className="flex-1 w-full flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-1 flex flex-col w-full"
              id="view-home"
            >
            
            {/* HERO HERO SECTION */}
            <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-gray-100 dark:bg-zinc-900/40 dark:border-zinc-900">
              {/* Abstract soft gradient background glow */}
              <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl" />
              <div className="absolute left-10 bottom-0 -z-10 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

              <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-white dark:text-zinc-900">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Evita Cambiar de Pestañas</span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white tracking-tight mt-6 leading-none">
                  Las mejores ofertas de tus <br className="hidden sm:inline" />
                  tiendas favoritas en <span className="text-emerald-500 dark:text-emerald-400">una vista unificada</span>.
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Compara las principales plataformas globales en una sola vista hermosa diseñada para tu estilo de vida móvil. Busca y configura alertas en tiempo real.
                </p>

                {/* Hero Search Box */}
                <div className="mx-auto mt-8 max-w-lg" id="hero-search-container">
                  <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
                    <input
                      type="text"
                      placeholder="Buscar marcas o tiendas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setView('electronics');
                        }
                      }}
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm text-zinc-900 placeholder-gray-400 focus:outline-none dark:text-white"
                    />
                    <button
                      onClick={() => setView('electronics')}
                      className="rounded-xl bg-zinc-900 px-5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                    >
                      Buscar
                    </button>
                  </div>
                </div>

                {/* Brand Quick Filters Row */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3" id="brand-quick-filters">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mr-1">Filtros rápidos:</span>
                  <button
                    onClick={() => {
                      setSelectedStores([]);
                      setView('electronics');
                    }}
                    className="rounded-full border border-gray-200 bg-white px-4.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all hover:scale-[1.04] active:scale-95 duration-200 ease-out shadow-xs cursor-pointer"
                  >
                    Mostrar Todo
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStores(['Amazon']);
                      setView('electronics');
                    }}
                    className="flex items-center space-x-1.5 rounded-full border border-gray-200 bg-white px-4.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all hover:scale-[1.04] active:scale-95 duration-200 ease-out shadow-xs cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Amazon</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStores(['Mercado Libre']);
                      setView('electronics');
                    }}
                    className="flex items-center space-x-1.5 rounded-full border border-gray-200 bg-white px-4.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all hover:scale-[1.04] active:scale-95 duration-200 ease-out shadow-xs cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Mercado Libre</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStores(['AliExpress']);
                      setView('electronics');
                    }}
                    className="flex items-center space-x-1.5 rounded-full border border-gray-200 bg-white px-4.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all hover:scale-[1.04] active:scale-95 duration-200 ease-out shadow-xs cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>AliExpress</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStores(['Temu']);
                      setView('electronics');
                    }}
                    className="flex items-center space-x-1.5 rounded-full border border-gray-200 bg-white px-4.5 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all hover:scale-[1.04] active:scale-95 duration-200 ease-out shadow-xs cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Temu</span>
                  </button>
                </div>
              </div>
            </section>

            {/* CURATED SECTION 1: MERCADO LIBRE DEALS */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
              <div className="flex items-end justify-between border-b border-gray-100 pb-4 mb-6 dark:border-zinc-900">
                <div>
                  <span className="text-[10px] font-bold text-amber-500 font-mono uppercase tracking-widest">Selected Curations</span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5">Mercado Libre Deals</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedStores(['Mercado Libre']);
                    setView('electronics');
                  }}
                  className="group flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>See all ML offers</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-72 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {curatedMLOffers.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isBookmarked={bookmarks.includes(product.id)}
                      onToggleBookmark={() => handleToggleBookmark(product.id)}
                      onViewDetails={() => setSelectedProduct(product)}
                      shopperCount={productShopperCounts[product.id]}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* CURATED SECTION 2: AMAZON ESSENTIALS (Special bento-grid split layout like the screenshots) */}
            <section className="bg-white dark:bg-zinc-900/20 border-y border-gray-100 dark:border-zinc-900 w-full py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between border-b border-gray-100 pb-4 mb-6 dark:border-zinc-900">
                  <div>
                    <span className="text-[10px] font-bold text-sky-500 font-mono uppercase tracking-widest">Curated Flagships</span>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5">Amazon Essentials</h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStores(['Amazon']);
                      setView('electronics');
                    }}
                    className="group flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Browse Amazon collection</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left big card: Kindle Scribe split view */}
                  {kindleScribe && (
                    <div 
                      onClick={() => setSelectedProduct(kindleScribe)}
                      className="lg:col-span-2 group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-gray-50 dark:bg-zinc-950">
                        <img 
                          src={kindleScribe.image} 
                          alt={kindleScribe.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                        <span className="absolute left-3.5 top-3.5 rounded-full bg-sky-500 px-3 py-1 text-xs font-black text-white shadow-sm">
                          Exclusive Amazon
                        </span>
                      </div>

                      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-1 text-xs text-zinc-400 mb-1.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{kindleScribe.rating}</span>
                            <span>({kindleScribe.reviewsCount} reviews)</span>
                          </div>
                          
                          <h3 className="font-display text-lg sm:text-xl font-black text-zinc-900 dark:text-white leading-tight">
                            {kindleScribe.title}
                          </h3>

                          <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                            {kindleScribe.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {Object.entries(kindleScribe.specs).slice(0, 2).map(([key, value]) => (
                              <span key={key} className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500 font-medium">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-zinc-800/60 mt-6">
                          <span className="text-2xl font-black font-mono text-zinc-950 dark:text-white">${kindleScribe.price}</span>
                          <button 
                            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 shadow-xs flex items-center space-x-1.5"
                          >
                            <span>View on Amazon</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right vertical side stack cards: Echo Pop & Fire TV Stick */}
                  <div className="flex flex-col space-y-4">
                    {[echoPop, fireStick].map((prod) => {
                      if (!prod) return null;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className="group flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <img
                            src={prod.image}
                            alt={prod.title}
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 rounded-xl object-cover shrink-0 border border-gray-50 dark:border-zinc-800"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400">
                              {prod.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-0.5 font-mono font-bold">${prod.price}</p>
                          </div>
                          <div className="p-1 rounded-full bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:bg-zinc-800 dark:group-hover:bg-emerald-950/40">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* CURATED SECTION 3: ALIEXPRESS FINDS */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
              <div className="flex items-end justify-between border-b border-gray-100 pb-4 mb-6 dark:border-zinc-900">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 font-mono uppercase tracking-widest">Global Bargains</span>
                  <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5">AliExpress Finds</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedStores(['AliExpress']);
                    setView('electronics');
                  }}
                  className="group flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Explore AliExpress finds</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {curatedAliOffers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isBookmarked={bookmarks.includes(product.id)}
                    onToggleBookmark={() => handleToggleBookmark(product.id)}
                    onViewDetails={() => setSelectedProduct(product)}
                    shopperCount={productShopperCounts[product.id]}
                  />
                ))}
              </div>
            </section>

            {/* CURATED SECTION 4: TEMU DEALS */}
            <section className="bg-orange-50/40 dark:bg-orange-950/10 border-y border-orange-100/60 dark:border-orange-900/20 w-full py-12">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between border-b border-orange-100/80 pb-4 mb-6 dark:border-orange-900/20">
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 font-mono uppercase tracking-widest">Unbeatable Prices</span>
                    <h2 className="font-display text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5">Temu Flash Deals</h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStores(['Temu']);
                      setView('electronics');
                    }}
                    className="group flex items-center space-x-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    <span>Browse all Temu deals</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-72 bg-orange-100/60 dark:bg-zinc-800 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {curatedTemuOffers.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isBookmarked={bookmarks.includes(product.id)}
                        onToggleBookmark={() => handleToggleBookmark(product.id)}
                        onViewDetails={() => setSelectedProduct(product)}
                        shopperCount={productShopperCounts[product.id]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 5: CUPONES DE DESCUENTO */}
            <CouponsSection />

            {/* "COMO FUNCIONA" STEP BLOCK */}
            <section className="bg-zinc-950 text-white py-16 w-full border-t border-zinc-900">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest">Simple Workflow</span>
                <h2 className="font-display text-2xl sm:text-3xl font-black mt-1">Cómo funciona</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="flex flex-col items-center p-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg border border-zinc-800">
                      1
                    </div>
                    <h3 className="font-bold text-lg mt-4 text-zinc-100">Busca y Compara</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs">
                      Stop opening 10 browser tabs. Find items across global markets with a single clean unified search engine.
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg border border-zinc-800">
                      2
                    </div>
                    <h3 className="font-bold text-lg mt-4 text-zinc-100">Elige la Mejor Oferta</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs">
                      Select the direct seller store, verify custom configured target price alerts and look at aggregated star ratings.
                    </p>
                  </div>

                  <div className="flex flex-col items-center p-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold font-mono text-lg border border-zinc-800">
                      3
                    </div>
                    <h3 className="font-bold text-lg mt-4 text-zinc-100">Compra con Confianza</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xs">
                      Click the direct anchor button to securely checkout on the official verified flagship platforms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* BENTO GRID: THE SMARTER WAY TO SHOP GLOBALLY */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
              <div className="text-center mb-12">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-widest">Unified Dashboard</span>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
                  The Smarter Way to Shop Globally
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Verified Sellers */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between h-48 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">Verified Sellers Only</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      We only scrape flagship stores and verified merchants to protect you from fraudulent offers.
                    </p>
                  </div>
                </div>

                {/* Card 2: Price tracking */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between h-48 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">Smart Price Tracking</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Set a price target on any item. Our backend monitors it and alerts you instantly in real-time.
                    </p>
                  </div>
                </div>

                {/* Card 3: Live chat */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-between h-48 shadow-xs">
                  <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">Shopper Live Chat</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Discuss live with other community shoppers on item sheets to share insights or ask questions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            </motion.div>
          )}

          {currentView === 'electronics' && (
            <motion.div
              key="electronics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-8"
              id="view-electronics"
            >
            
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 shrink-0">
              <SidebarFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedStores={selectedStores}
                onToggleStore={(store) => {
                  setSelectedStores((prev) =>
                    prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
                  );
                }}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
                minRating={minRating}
                onRatingChange={setMinRating}
                onClearAll={handleClearAllFilters}
                totalResultsCount={sortedProducts.length}
              />
            </aside>

            {/* List and sorting grid */}
            <section className="flex-1 flex flex-col">
              
              {/* Header sorting row (Matches screenshot 2) */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-3 dark:border-zinc-900">
                <div className="flex items-center space-x-2">
                  <h2 className="font-display text-lg font-bold text-zinc-900 dark:text-white">
                    {CATEGORY_LABELS[selectedCategory] || selectedCategory}
                  </h2>
                  <span className="text-xs font-mono font-medium text-gray-400 dark:text-zinc-500">
                    ({sortedProducts.length} offers)
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sorting dropdown */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="low-high">Lowest Price</option>
                      <option value="high-low">Highest Price</option>
                      <option value="discount">Best Discount</option>
                    </select>
                  </div>

                  {/* Grid / List switchers */}
                  <div className="flex items-center bg-gray-100 p-0.5 rounded-lg dark:bg-zinc-800">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md ${
                        viewMode === 'grid'
                          ? 'bg-white shadow-xs text-zinc-950 dark:bg-zinc-900 dark:text-white'
                          : 'text-gray-400 dark:text-zinc-500'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md ${
                        viewMode === 'list'
                          ? 'bg-white shadow-xs text-zinc-950 dark:bg-zinc-900 dark:text-white'
                          : 'text-gray-400 dark:text-zinc-500'
                      }`}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid or list renderer */}
              {sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                  <AlertCircle className="h-10 w-10 text-gray-300 dark:text-zinc-700 mb-3" />
                  <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">No deals match your filters</p>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Try resetting the pricing range or selection stores.</p>
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-4 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isBookmarked={bookmarks.includes(product.id)}
                      onToggleBookmark={() => handleToggleBookmark(product.id)}
                      onViewDetails={() => setSelectedProduct(product)}
                      shopperCount={productShopperCounts[product.id]}
                    />
                  ))}
                </div>
              ) : (
                /* LIST VIEW MODE */
                <div className="space-y-4">
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-zinc-800 dark:bg-zinc-900/40 p-4 gap-4"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="h-32 w-full sm:w-44 rounded-xl object-cover shrink-0 bg-gray-50 dark:bg-zinc-950"
                      />
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{product.store}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(product.id);
                              }}
                              className={`p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                                bookmarks.includes(product.id) ? 'text-rose-500' : 'text-gray-400 dark:text-zinc-500'
                              }`}
                            >
                              <Heart className="h-4.5 w-4.5" />
                            </button>
                          </div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-emerald-500 transition-colors">
                            {product.title}
                          </h4>
                          <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-zinc-800/60 mt-4">
                          <span className="text-lg font-black font-mono text-zinc-950 dark:text-white">${product.price}</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-0.5">
                            <span>Ver Oferta</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination indicators (Matches screenshot 2) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-12 pb-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-9 w-9 text-xs font-bold rounded-xl transition-all ${
                        currentPage === i + 1
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm scale-105'
                          : 'border border-gray-200 bg-white text-zinc-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

            </section>
            </motion.div>
          )}

          {currentView === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full"
              id="view-favorites"
            >
            <div className="border-b border-gray-100 pb-4 mb-6 dark:border-zinc-900">
              <h2 className="font-display text-2xl font-black text-zinc-900 dark:text-white">My Bookmarked Deals</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Exclusive products you saved and configured alerts for.</p>
            </div>

            {bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">No bookmarked deals yet</h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1.5 max-w-sm leading-relaxed">
                  Start exploring our multi-platform catalog and click the heart icon on cards to save your favorites!
                </p>
                <button
                  onClick={() => setView('electronics')}
                  className="mt-6 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors shadow-md"
                >
                  Explore Electronics Offers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products
                  .filter((p) => bookmarks.includes(p.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isBookmarked={true}
                      onToggleBookmark={() => handleToggleBookmark(product.id)}
                      onViewDetails={() => setSelectedProduct(product)}
                      shopperCount={productShopperCounts[product.id]}
                    />
                  ))}
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-gray-100 py-12 dark:bg-zinc-950 dark:border-zinc-900 shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Compass className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-lg text-zinc-950 dark:text-white">GlobalShop Deals</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">
              We monitor millions of products in real-time across Amazon, Mercado Libre, and AliExpress to find you the most exclusive flagship bargains.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Press Kit</li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Affiliate Disclosure</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Cookie Settings</li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-xs text-gray-400 dark:text-zinc-500">Subscribe to our newsletter to receive the best daily bargains directly.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold text-xs px-3 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-gray-50 dark:border-zinc-900 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} GlobalShop Deals Inc. All rights reserved.</span>
          
          {/* High Tech Immersive UI System Status indicator */}
          <div className="flex items-center space-x-6 my-4 sm:my-0 font-mono text-[10px] tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
            <div className="flex items-center space-x-2">
              <span className="system-status-pulse shrink-0" />
              <span>SISTEMA OPERATIVO • LATENCIA: 14MS</span>
            </div>
            <span className="hidden md:inline text-zinc-500">• AURA v2.4.0</span>
          </div>

          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer">English</span>
            <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer">Spanish</span>
          </div>
        </div>
      </footer>

      {/* MODAL LIGHTBOXES */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {selectedProduct && (
        <DealDetailModal
          product={selectedProduct}
          user={user}
          onClose={() => setSelectedProduct(null)}
          onOpenAuth={() => {
            setSelectedProduct(null);
            setAuthModalOpen(true);
          }}
        />
      )}

    </div>
  );
}
