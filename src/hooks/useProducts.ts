import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook that fetches products from Supabase and provides CRUD helpers.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products on mount
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Optional: real‑time subscription could be added here
  }, []);

  // ------- CRUD operations -------------------------------------------------
  const deleteProduct = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al eliminar el producto');
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFeatured = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ featured: !product.featured })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al actualizar el producto');
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const duplicateProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const token = localStorage.getItem('admin_token');
    const { id: _, ...productData } = product;
    const newProduct = { ...productData, id: uuidv4() };
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newProduct)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al duplicar el producto');
    }
    setProducts((prev) => [...prev, newProduct]);
  };

  const deleteAllProducts = async () => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al eliminar todos los productos');
    }
    setProducts([]);
  };

  return {
    products,
    loading,
    error,
    deleteProduct,
    toggleFeatured,
    duplicateProduct,
    deleteAllProducts,
    // Future extensions: createProduct, updateProduct, etc.
  };
}
