import { useEffect, useState } from 'react';
import { Coupon } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
      const response = await fetch('/api/coupons');
      if (!response.ok) {
        throw new Error('Error al cargar los cupones');
      }
      const data = await response.json();
      setCoupons(data);
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
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al eliminar el cupón');
    }
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleHot = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isHot: !coupon.isHot })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al actualizar el cupón');
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isHot: !c.isHot } : c))
    );
  };

  const duplicateCoupon = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const token = localStorage.getItem('admin_token');
    const { id: _, ...couponData } = coupon;
    
    // Create unique code by adding a suffix
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `${couponData.code}_${randomSuffix}`;
    const newCoupon = { ...couponData, id: uuidv4(), code: newCode };

    const response = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newCoupon)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al duplicar el cupón');
    }
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const deleteAllCoupons = async () => {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/admin/coupons', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al eliminar todos los cupones');
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
