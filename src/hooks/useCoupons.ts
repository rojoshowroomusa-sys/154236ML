import { useEffect, useState } from 'react';
import { Coupon } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook that fetches coupons from Supabase and provides CRUD helpers.
 */
export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      const mapped = (data || []).map((c: any) => ({
        id: c.id,
        code: c.code,
        store: c.store,
        discount: c.discount,
        discountValue: Number(c.discount_value),
        minOrder: c.min_order ? Number(c.min_order) : undefined,
        description: c.description,
        category: c.category || undefined,
        expiresAt: c.expires_at,
        isHot: c.is_hot,
        maxUses: c.max_uses ? Number(c.max_uses) : undefined,
        usedCount: Number(c.used_count),
      }));
      setCoupons(mapped);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ------- CRUD operations -------------------------------------------------
  const deleteCoupon = async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    if (error) {
      throw error;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleHot = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const { error } = await supabase
      .from('coupons')
      .update({ is_hot: !coupon.isHot })
      .eq('id', id);
    if (error) {
      throw error;
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isHot: !c.isHot } : c))
    );
  };

  const duplicateCoupon = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const { id: _, ...couponData } = coupon;
    
    // Create unique code by adding a suffix
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${couponData.code}_${randomSuffix}`;
    const newId = uuidv4();

    const { error } = await supabase
      .from('coupons')
      .insert({
        id: newId,
        code: newCode,
        store: couponData.store,
        discount: couponData.discount,
        discount_value: couponData.discountValue,
        min_order: couponData.minOrder,
        description: couponData.description,
        category: couponData.category,
        expires_at: couponData.expiresAt,
        is_hot: couponData.isHot || false,
        max_uses: couponData.maxUses,
        used_count: couponData.usedCount || 0,
      });
    if (error) {
      throw error;
    }
    setCoupons((prev) => [...prev, { ...couponData, id: newId, code: newCode }]);
  };

  const deleteAllCoupons = async () => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .neq('id', '');
    if (error) {
      throw error;
    }
    setCoupons([]);
  };

  return {
    coupons,
    loading,
    error,
    deleteCoupon,
    toggleHot,
    duplicateCoupon,
    deleteAllCoupons,
    refreshCoupons: fetchCoupons
  };
}
