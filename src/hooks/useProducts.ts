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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        discount: p.discount ? Number(p.discount) : undefined,
        store: p.store,
        category: p.category,
        image: p.image,
        rating: Number(p.rating),
        reviewsCount: Number(p.reviews_count),
        url: p.url,
        description: p.description,
        specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs,
        featured: p.featured,
      }));
      setProducts(mapped);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ------- CRUD operations -------------------------------------------------
  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      throw error;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleFeatured = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const { error } = await supabase
      .from('products')
      .update({ featured: !product.featured })
      .eq('id', id);
    if (error) {
      throw error;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const duplicateProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const { id: _, ...productData } = product;
    const newId = uuidv4();
    const { error } = await supabase
      .from('products')
      .insert({
        id: newId,
        title: productData.title,
        price: productData.price,
        original_price: productData.originalPrice,
        discount: productData.discount,
        store: productData.store,
        category: productData.category,
        image: productData.image,
        rating: productData.rating,
        reviews_count: productData.reviewsCount,
        url: productData.url,
        description: productData.description,
        specs: productData.specs,
        featured: productData.featured || false,
      });
    if (error) {
      throw error;
    }
    setProducts((prev) => [...prev, { ...productData, id: newId }]);
  };

  const deleteAllProducts = async () => {
    const { error } = await supabase
      .from('products')
      .delete()
      .neq('id', '');
    if (error) {
      throw error;
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
