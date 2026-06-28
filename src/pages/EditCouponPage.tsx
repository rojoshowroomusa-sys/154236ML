import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { Coupon, StoreName } from '../types';

export default function EditCouponPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState<Partial<Coupon>>({
    code: '',
    store: 'Amazon',
    discount: '',
    discountValue: 0,
    minOrder: undefined,
    description: '',
    category: '',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().substring(0, 16), // default 7 days from now
    isHot: false,
    maxUses: undefined,
    usedCount: 0
  });

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [rawText, setRawText] = useState('');
  const [scrapingText, setScrapingText] = useState(false);

  const handleScrapeText = async () => {
    if (!rawText) {
      alert('Por favor pega el texto promocional primero');
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      return;
    }

    setScrapingText(true);
    setError('');
    try {
      const response = await fetch('/api/admin/scrape-coupon-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: rawText })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al extraer información');
      }

      const extracted = await response.json();
      setCoupon((prev) => ({
        ...prev,
        code: extracted.code || prev.code,
        store: extracted.store || prev.store,
        discount: extracted.discount || prev.discount,
        discountValue: extracted.discountValue !== undefined ? Number(extracted.discountValue) : prev.discountValue,
        minOrder: extracted.minOrder !== null && extracted.minOrder !== undefined ? Number(extracted.minOrder) : prev.minOrder,
        description: extracted.description || prev.description,
        category: extracted.category || prev.category,
        expiresAt: extracted.expiresAt || prev.expiresAt,
        isHot: extracted.isHot !== undefined ? Boolean(extracted.isHot) : prev.isHot,
        maxUses: extracted.maxUses !== null && extracted.maxUses !== undefined ? Number(extracted.maxUses) : prev.maxUses
      }));
      alert('Campos autocompletados con éxito a partir del texto. Revisa y edita los detalles antes de guardar.');
    } catch (err: any) {
      alert(err.message || 'Error al autocompletar');
    } finally {
      setScrapingText(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      navigate('/');
      return;
    }

    if (isEdit && id) {
      fetch(`/api/coupons/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo cargar el cupón');
          return res.json();
        })
        .then((data) => {
          // Format ISO string to datetime-local compatible format (YYYY-MM-DDTHH:mm)
          const formattedDate = data.expiresAt ? new Date(data.expiresAt).toISOString().substring(0, 16) : '';
          setCoupon({
            ...data,
            expiresAt: formattedDate
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEdit, navigate]);

  const handleChange = (field: keyof Coupon, value: any) => {
    setCoupon((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) {
      alert('Inicia sesión como administrador primero');
      return;
    }

    setSaving(true);
    setError('');

    // Prepare JSON data
    const payload = {
      ...coupon,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : new Date().toISOString()
    };

    try {
      const url = isEdit ? `/api/admin/coupons/${id}` : '/api/admin/coupons';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar el cupón');
      }

      alert(isEdit ? 'Cupón actualizado correctamente' : 'Cupón creado correctamente');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <p className="text-zinc-600 dark:text-zinc-400">Cargando cupón...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-850 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-zinc-500 hover:text-zinc-850 dark:hover:text-white p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-zinc-950 dark:text-white flex items-center space-x-2">
              <Tag className="h-5 w-5 text-indigo-500" />
              <span>{isEdit ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</span>
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-600 text-sm border border-rose-100 dark:border-rose-900/40">
            {error}
          </div>
        )}

        {/* AI Autofill section */}
        <div className="mb-6 border border-indigo-150 dark:border-indigo-900/40 rounded-lg p-4 bg-indigo-50/20 dark:bg-indigo-950/10">
          <details className="group">
            <summary className="flex justify-between items-center font-bold text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer select-none">
              <span>🪄 Autocompletar con Inteligencia Artificial (IA)</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="16" width="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              <p className="text-[11px] text-zinc-500 dark:text-gray-400">
                Copia y pega la promoción, correo promocional o descripción del cupón aquí y Gemini extraerá los detalles automáticamente:
              </p>
              <textarea
                rows={3}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-xs text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ej. Consigue 20% de descuento en AliExpress usando el cupón ALISUPER20 en cualquier compra de electrónica mayor a $50 válido hasta el 5 de julio..."
              />
              <button
                type="button"
                onClick={handleScrapeText}
                disabled={scrapingText || !rawText}
                className={`w-full py-2 rounded font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${scrapingText || !rawText ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {scrapingText ? 'Extrayendo con IA...' : 'Autocompletar Formulario con IA'}
              </button>
            </div>
          </details>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Código del Cupón *</label>
              <input
                type="text"
                value={coupon.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. SONY20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Tienda *</label>
              <select
                value={coupon.store}
                onChange={(e) => handleChange('store', e.target.value as StoreName)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Amazon">Amazon</option>
                <option value="Mercado Libre">Mercado Libre</option>
                <option value="AliExpress">AliExpress</option>
                <option value="Temu">Temu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Etiqueta de Descuento *</label>
              <input
                type="text"
                value={coupon.discount}
                onChange={(e) => handleChange('discount', e.target.value)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. 20% DTO, $10 OFF o Envío GRATIS"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Valor de Descuento (Numérico) *</label>
              <input
                type="number"
                value={coupon.discountValue || ''}
                onChange={(e) => handleChange('discountValue', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. 20 o 10 (para ordenar)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Compra Mínima (Opcional)</label>
              <input
                type="number"
                value={coupon.minOrder || ''}
                onChange={(e) => handleChange('minOrder', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. 50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Categoría (Opcional)</label>
              <select
                value={coupon.category || ''}
                onChange={(e) => handleChange('category', e.target.value || undefined)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Todas las categorías</option>
                <option value="Electronics">Electronics</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Fashion">Fashion</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Tools">Tools</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Fecha de Expiración *</label>
              <input
                type="datetime-local"
                value={coupon.expiresAt}
                onChange={(e) => handleChange('expiresAt', e.target.value)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Usos Máximos (Opcional)</label>
              <input
                type="number"
                value={coupon.maxUses || ''}
                onChange={(e) => handleChange('maxUses', e.target.value ? parseInt(e.target.value) : undefined)}
                className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. 1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-gray-350">Descripción *</label>
            <input
              type="text"
              value={coupon.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-1 block w-full rounded border border-gray-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 p-2 text-sm text-zinc-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Ej. Válido en toda la tienda o en categorías seleccionadas"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isHot-checkbox"
              checked={coupon.isHot || false}
              onChange={(e) => handleChange('isHot', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isHot-checkbox" className="text-sm font-semibold text-zinc-700 dark:text-gray-350 select-none">
              Marcar como Cupón "HOT" (Destacado en rojo)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-zinc-850">
            <Link
              to="/"
              className="px-4 py-2 border border-gray-200 dark:border-zinc-750 rounded text-zinc-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-zinc-850 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded text-white font-semibold text-sm transition ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cupón'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
