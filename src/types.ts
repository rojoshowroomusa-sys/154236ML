export type StoreName = 'Amazon' | 'Mercado Libre' | 'AliExpress' | 'Temu';

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number; // percentage, e.g. 52 for 52%
  store: StoreName;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  url: string;
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: string;
  active?: boolean;
  role?: 'admin' | 'user';
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  userId: string;
  targetPrice: number;
  createdAt: string;
}

export type LiveEventType = 'bookmark' | 'comment' | 'user_join' | 'user_leave' | 'price_alert';

export interface LiveEvent {
  type: LiveEventType;
  id: string;
  userId?: string;
  username?: string;
  productId?: string;
  productTitle?: string;
  store?: StoreName;
  text?: string;
  timestamp: string;
}

export interface Coupon {
  id: string;
  code: string;
  store: StoreName;
  discount: string;        // e.g. "15%" or "$10 OFF"
  discountValue: number;   // numeric for sorting
  minOrder?: number;
  description: string;
  category?: string;
  expiresAt: string;       // ISO string
  isHot?: boolean;
  maxUses?: number;
  usedCount?: number;
}
