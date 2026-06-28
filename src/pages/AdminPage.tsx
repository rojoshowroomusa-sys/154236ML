import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit, Trash2, Save, Star, Copy, Eye, Tag } from 'lucide-react';
import { Product, Coupon } from '../types';
import ProductPreviewModal from '../components/ProductPreviewModal';
import { exportProductsToCSV } from '../utils/csvExport';
import { useProducts } from '../hooks/useProducts';
import { useCoupons } from '../hooks/useCoupons';

interface AdminPageProps {
  onClose: () => void;
}

export default function AdminPage({ onClose }: AdminPageProps) {
  const {
    products,
    loading: productsLoading,
    error: productsError,
    deleteProduct,
    toggleFeatured,
    duplicateProduct,
    deleteAllProducts,
  } = useProducts();

  const {
    coupons,
    loading: couponsLoading,
    error: couponsError,
    deleteCoupon,
    toggleHot,
    duplicateCoupon,
    deleteAllCoupons,
  } = useCoupons();

  const [activeTab, setActiveTab] = useState<'products' | 'coupons'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  if (productsLoading || couponsLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <p className="text-white">Cargando datos...</p>
      </div>
    );
  }

  if (productsError || couponsError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <p className="text-red-500">Error al cargar datos: {productsError || couponsError}</p>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );



  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Enlace copiado al portapapeles');
    });
  };

  const exportCSV = () => {
    exportProductsToCSV(products);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Header with search and export */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <input
          type="text"
          placeholder={activeTab === 'products' ? "Buscar por título, tienda, categoría..." : "Buscar por código, tienda, categoría..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white"
        />
        <div className="flex space-x-2">
          {activeTab === 'products' && (
            <button
              onClick={exportCSV}
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 text-sm font-medium"
            >
              Exportar CSV
            </button>
          )}
          {activeTab === 'products' ? (
            <Link
              to="/admin/create"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 text-sm font-medium inline-flex items-center"
            >
              Crear Oferta
            </Link>
          ) : (
            <Link
              to="/admin/coupons/create"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 text-sm font-medium inline-flex items-center"
            >
              Crear Cupón
            </Link>
          )}
          <button
            onClick={() => {
              if (activeTab === 'products') {
                if (window.confirm('¿Estás seguro de eliminar todas las ofertas?')) deleteAllProducts();
              } else {
                if (window.confirm('¿Estás seguro de eliminar todos los cupones?')) deleteAllCoupons();
              }
            }}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 text-sm font-medium"
          >
            Eliminar todos
          </button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
          aria-label="Cerrar página de administración"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-4 text-2xl font-bold text-zinc-800 dark:text-white flex items-center space-x-2">
          <span>Panel de Administración</span>
        </h2>

        {/* Tab system */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 mb-6">
          <button
            onClick={() => { setActiveTab('products'); setSearchQuery(''); }}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
          >
            Ofertas ({products.length})
          </button>
          <button
            onClick={() => { setActiveTab('coupons'); setSearchQuery(''); }}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'coupons' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
          >
            Cupones ({coupons.length})
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            <ul className="space-y-4">
              {filteredProducts.map((product) => (
                <li key={product.id} className="rounded border border-gray-200 dark:border-zinc-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-zinc-800 dark:text-white">{product.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">${product.price}</p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Link
                        to={`/admin/edit/${product.id}`}
                        className="rounded p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-800/30"
                        aria-label="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => toggleFeatured(product.id)}
                        className={`rounded p-2 ${product.featured ? 'text-yellow-500' : 'text-gray-400'} hover:bg-yellow-50 dark:hover:bg-yellow-800/30`}
                        aria-label="Destacar"
                      >
                        <Star className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => duplicateProduct(product.id)}
                        className="rounded p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/30"
                        aria-label="Duplicar"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => copyLink(product.url)}
                        className="rounded p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800/30"
                        aria-label="Copiar enlace"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPreviewProduct(product)}
                        className="rounded p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-800/30"
                        aria-label="Vista previa"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('¿Eliminar esta oferta?')) deleteProduct(product.id); }}
                        className="rounded p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-800/30"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">No hay productos para administrar.</p>
            )}
          </>
        ) : (
          <>
            <ul className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <li key={coupon.id} className="rounded border border-gray-200 dark:border-zinc-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-800 dark:text-white">{coupon.code}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">{coupon.store}</span>
                        {coupon.isHot && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-extrabold uppercase">HOT</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{coupon.discount} - {coupon.description}</p>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">Expira: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2 items-center">
                      <Link
                        to={`/admin/coupons/edit/${coupon.id}`}
                        className="rounded p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-800/30"
                        aria-label="Editar cupón"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => toggleHot(coupon.id)}
                        className={`rounded p-2 ${coupon.isHot ? 'text-red-500' : 'text-gray-400'} hover:bg-red-50 dark:hover:bg-red-800/30`}
                        aria-label="Toggle Hot"
                      >
                        <Star className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => duplicateCoupon(coupon.id)}
                        className="rounded p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-800/30"
                        aria-label="Duplicar cupón"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('¿Eliminar este cupón?')) deleteCoupon(coupon.id); }}
                        className="rounded p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-800/30"
                        aria-label="Eliminar cupón"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {filteredCoupons.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400">No hay cupones para administrar.</p>
            )}
          </>
        )}
      </motion.div>
      {/* Preview Modal */}
      <AnimatePresence>
        {previewProduct && (
          <ProductPreviewModal
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
