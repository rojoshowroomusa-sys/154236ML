import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, StoreName } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'Electronics', label: 'Electrónica y Gadgets' },
  { value: 'Home & Kitchen', label: 'Hogar y Cocina' },
  { value: 'Fashion', label: 'Moda y Accesorios' },
  { value: 'Outdoor', label: 'Aire Libre' },
  { value: 'Tools', label: 'Herramientas y Mejoras' },
  { value: 'Entertainment', label: 'Diversión y Juguetes' }
];

const STORES: StoreName[] = ['Amazon', 'Mercado Libre', 'AliExpress', 'Temu'];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState<Product>({
    id: '',
    title: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    store: 'Amazon',
    category: 'Electronics',
    image: '',
    rating: 5.0,
    reviewsCount: 0,
    url: '',
    description: '',
    specs: {},
    featured: false
  });

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [scraping, setScraping] = useState(false);
  const [rawText, setRawText] = useState('');
  const [scrapingText, setScrapingText] = useState(false);

  const handleScrape = async () => {
    if (!product.url) {
      alert('Por favor ingresa primero la URL del producto');
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      return;
    }

    setScraping(true);
    try {
      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: product.url })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al obtener la información');
      }

      const extracted = await response.json();
      
      setProduct((prev) => ({
        ...prev,
        title: extracted.title || prev.title,
        price: extracted.price !== undefined ? Number(extracted.price) : prev.price,
        originalPrice: extracted.originalPrice !== undefined ? Number(extracted.originalPrice) : prev.originalPrice,
        discount: extracted.discount !== undefined ? Number(extracted.discount) : prev.discount,
        store: extracted.store || prev.store,
        category: extracted.category || prev.category,
        image: extracted.image || prev.image,
        rating: extracted.rating !== undefined ? Number(extracted.rating) : prev.rating,
        reviewsCount: extracted.reviewsCount !== undefined ? Number(extracted.reviewsCount) : prev.reviewsCount,
        description: extracted.description || prev.description
      }));
      alert('Campos autocompletados con éxito. Revisa y edita los detalles antes de guardar.');
    } catch (err: any) {
      alert(err.message || 'Error al autocompletar');
    } finally {
      setScraping(false);
    }
  };

  const handleScrapeText = async () => {
    if (!rawText) {
      alert('Por favor pega el texto copiado de la página primero');
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      return;
    }

    setScrapingText(true);
    try {
      const response = await fetch('/api/admin/scrape-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: rawText })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al obtener la información');
      }

      const extracted = await response.json();
      
      setProduct((prev) => ({
        ...prev,
        title: extracted.title || prev.title,
        price: extracted.price !== undefined ? Number(extracted.price) : prev.price,
        originalPrice: extracted.originalPrice !== undefined ? Number(extracted.originalPrice) : prev.originalPrice,
        discount: extracted.discount !== undefined ? Number(extracted.discount) : prev.discount,
        store: extracted.store || prev.store,
        category: extracted.category || prev.category,
        image: extracted.image || prev.image,
        rating: extracted.rating !== undefined ? Number(extracted.rating) : prev.rating,
        reviewsCount: extracted.reviewsCount !== undefined ? Number(extracted.reviewsCount) : prev.reviewsCount,
        description: extracted.description || prev.description
      }));
      alert('Campos autocompletados con éxito a partir del texto copiado. Revisa y edita los detalles antes de guardar.');
    } catch (err: any) {
      alert(err.message || 'Error al autocompletar');
    } finally {
      setScrapingText(false);
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo cargar el producto');
          return res.json();
        })
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (field: keyof Product, value: any) => {
    setProduct((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate discount if originalPrice and price are set
      if (field === 'price' || field === 'originalPrice') {
        const p = field === 'price' ? Number(value) : Number(prev.price);
        const op = field === 'originalPrice' ? Number(value) : Number(prev.originalPrice);
        if (op > p && op > 0) {
          updated.discount = Math.round(((op - p) / op) * 100);
        } else {
          updated.discount = 0;
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!product.title || !product.price || !product.image) {
      alert('Por favor completa los campos requeridos (Título, Precio, Imagen)');
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar el producto');
      }

      alert(isEdit ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-emerald-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 shadow-sm border-b border-gray-200 dark:border-zinc-800">
        <Link to="/" className="text-zinc-600 dark:text-gray-300 hover:text-emerald-600 flex items-center gap-1.5 font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
        <h1 className="text-xl font-bold text-zinc-800 dark:text-white">
          {isEdit ? 'Editar Oferta' : 'Crear Nueva Oferta'}
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 font-medium transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{isEdit ? 'Guardar Cambios' : 'Crear Oferta'}</span>
        </button>
      </header>

      <main className="flex-1 container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="mb-6 text-lg font-bold text-zinc-850 dark:text-gray-150 border-b pb-2 dark:border-zinc-800">Información del producto</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Título *</label>
              <input
                type="text"
                value={product.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. Auriculares Sony WH-1000XM5"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Precio Actual ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Precio Original ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.originalPrice || ''}
                  onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Dejar vacío si no hay"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Descuento (%)</label>
                <input
                  type="number"
                  value={product.discount || ''}
                  readOnly
                  className="mt-1 block w-full rounded border border-gray-250 dark:border-zinc-750 bg-gray-50 dark:bg-zinc-900 p-2 text-sm text-zinc-500 cursor-not-allowed focus:outline-none"
                  placeholder="Autocalculado"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Tienda *</label>
                <select
                  value={product.store}
                  onChange={(e) => handleChange('store', e.target.value as StoreName)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {STORES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Categoría *</label>
                <select
                  value={product.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Destacado</label>
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={product.featured || false}
                    onChange={(e) => handleChange('featured', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    id="featured-checkbox"
                  />
                  <label htmlFor="featured-checkbox" className="ml-2 text-sm text-zinc-600 dark:text-gray-400 select-none">
                    Mostrar en portada
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Calificación (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={product.rating || ''}
                  onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 5.0)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="5.0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Opiniones (Reviews)</label>
                <input
                  type="number"
                  value={product.reviewsCount || ''}
                  onChange={(e) => handleChange('reviewsCount', parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">URL del Enlace *</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={product.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  className="flex-1 rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="https://..."
                  required
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping}
                  className={`px-3 py-2 rounded font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${scraping ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {scraping ? 'Extrayendo...' : 'Autocompletar con IA'}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-gray-400">
                Nota: Algunas tiendas (como Mercado Libre) bloquean consultas desde servidores externos. Si el autocompletado de arriba no llena los precios o imágenes, utiliza la alternativa de pegar el texto de la página abajo.
              </p>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-2">
              <details className="group">
                <summary className="flex justify-between items-center font-bold text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer select-none">
                  <span>¿Fallo el autocompletado directo? Copia y pega el texto de la página</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="16" width="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-zinc-500 dark:text-gray-400">
                    Abre la publicación en tu navegador, presiona <strong>Ctrl + A</strong> (seleccionar todo), luego <strong>Ctrl + C</strong> (copiar) y pega todo aquí:
                  </p>
                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Pega el contenido copiado de la página del producto aquí..."
                  />
                  <button
                    type="button"
                    onClick={handleScrapeText}
                    disabled={scrapingText || !rawText}
                    className={`w-full py-2 rounded font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${scrapingText || !rawText ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {scrapingText ? 'Extrayendo del texto...' : 'Autocompletar desde Texto Copiado'}
                  </button>
                </div>
              </details>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">URL de la Imagen *</label>
              <input
                type="text"
                value={product.image}
                onChange={(e) => handleChange('image', e.target.value)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Descripción</label>
              <textarea
                rows={3}
                value={product.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Breve detalle de las características o por qué es una buena oferta..."
              />
            </div>
          </div>
        </section>

        {/* Vista previa en vivo */}
        <section className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h2 className="mb-6 text-lg font-bold text-zinc-850 dark:text-gray-150 border-b pb-2 dark:border-zinc-800">Vista previa de la Oferta</h2>
            <div className="border border-gray-200 dark:border-zinc-750 rounded-xl overflow-hidden max-w-sm mx-auto shadow-md">
              <div className="relative bg-gray-100 h-56 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">Sin imagen seleccionada</span>
                )}
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-rose-600 text-white font-bold text-xs px-2 py-1 rounded">
                    -{product.discount}%
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-white/95 dark:bg-zinc-900/95 shadow-sm text-zinc-800 dark:text-white text-xs px-2 py-1 rounded font-bold">
                  {product.store}
                </span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  {product.category}
                </span>
                <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-white line-clamp-2">{product.title || 'Título del Producto'}</h3>
                
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-zinc-900 dark:text-white">${product.price.toFixed(2)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                  {product.description || 'Aquí se mostrará la descripción detallada de tu oferta.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Los campos marcados con (*) son obligatorios para guardar la oferta.
          </div>
        </section>
      </main>
    </div>
  );
}
