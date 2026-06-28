import { useState } from 'react';
import { Menu, X, Sun, Moon, User, LogOut, Heart, Compass, HelpCircle, Sparkles, TrendingUp, ShoppingBag, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentView: 'home' | 'electronics' | 'favorites';
  setView: (view: 'home' | 'electronics' | 'favorites') => void;
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenAdmin: () => void;
}

export default function Navbar({
  currentView,
  setView,
  user,
  onOpenAuth,
  onLogout,
  darkMode,
  setDarkMode,
  onOpenAdmin
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Compass },
    { id: 'electronics', label: 'Explorar Ofertas', icon: Sparkles },
    { id: 'favorites', label: 'Mis Favoritos', icon: Heart },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          onClick={() => setView('home')} 
          className="flex cursor-pointer items-center space-x-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-white"
          id="nav-logo"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-display font-bold">
            Global<span className="text-emerald-500 dark:text-emerald-400">Shop</span>
          </span>
          <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900 hidden sm:inline-block">
            Deals
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-1 bg-gray-50/60 p-1 rounded-xl dark:bg-zinc-900/60 border border-gray-100/20 dark:border-zinc-800/40 relative" id="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`group relative flex items-center space-x-1.5 text-xs font-semibold px-4.5 py-2 rounded-lg transition-all duration-300 outline-none ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-gray-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
                id={`nav-item-${item.id}`}
              >
                {/* Active Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-lg bg-white shadow-xs border border-gray-200/50 dark:bg-zinc-800 dark:border-zinc-700/50"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                  <span>{item.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4" id="nav-actions">
            {/* Admin Panel Button (visible only for admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-all-300"
                aria-label="Open admin panel"
                id="admin-button"
              >
                <Settings className="h-4.5 w-4.5" />
              </button>
            )}
          {/* Dark Mode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-all-300"
            aria-label="Toggle dark mode"
            id="dark-mode-toggle"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* User Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
                id="user-menu-button"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-8 w-8 rounded-full border-2 border-emerald-500 object-cover"
                />
                <span className="hidden lg:inline text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {user.username}
                </span>
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <>
                    {/* Overlay to close */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950 z-20"
                      id="user-dropdown-menu"
                    >
                      <div className="px-3 py-2 border-b border-gray-50 dark:border-zinc-800/80 mb-1">
                        <p className="text-xs text-gray-400 dark:text-zinc-500">Conectado como</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">{user.username}</p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          setView('favorites');
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                      >
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>Mis Favoritos</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        id="logout-button"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={onOpenAuth}
                className="rounded-lg px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition-colors"
                id="signin-btn"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={onOpenAuth}
                className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors shadow-sm"
                id="join-btn"
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors md:hidden"
            aria-label="Open main menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide-Out Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Menu Panel (drawn similar to the overlay menu on slide-out in screenshot 1) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-72 bg-zinc-950 p-6 text-white shadow-2xl md:hidden flex flex-col justify-between"
              id="mobile-side-menu"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-5 w-5 text-emerald-400" />
                    <span className="font-display font-bold text-lg">GlobalShop</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-8 flex flex-col space-y-4">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.07 + 0.1, type: 'spring', stiffness: 350, damping: 26 }}
                        onClick={() => {
                          setView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 rounded-xl p-3 text-left text-base font-medium transition-colors cursor-pointer outline-none ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Menu Bottom actions */}
              <div className="pt-6 border-t border-zinc-800">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-9 w-9 rounded-full object-cover border border-emerald-500"
                      />
                      <div className="truncate w-32">
                        <p className="text-sm font-semibold leading-none truncate">{user.username}</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-2 rounded-lg bg-zinc-900 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-zinc-900 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-500"
                    >
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
