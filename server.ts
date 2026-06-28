import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, ADMIN_PASSWORD, isAdmin } from './src/config/adminConfig';
const JWT_SECRET_ENV = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET_ENV && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: ADMIN_JWT_SECRET environment variable is not defined in production!');
  process.exit(1);
}
const ACTUAL_JWT_SECRET = JWT_SECRET_ENV || 'dev-secret-fallback-non-production';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/productsData.js';
import { Product, User, Comment, PriceAlert, LiveEvent, StoreName, Coupon } from './src/types.js';

import { supabaseAuth } from './src/supabaseAuthClient';
import multer from 'multer';
import { supabase } from './src/supabaseAdminClient';
// JWT removed – using Basic auth only


const app = express();
const PORT = 3001;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'amz-1',
    code: 'AMAZON15',
    store: 'Amazon',
    discount: '15% DTO',
    discountValue: 15,
    minOrder: 30,
    description: 'Electrónica y gadgets tecnológicos',
    category: 'Electronics',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    isHot: true,
    maxUses: 500,
    usedCount: 314
  },
  {
    id: 'amz-2',
    code: 'PRIMEDAY10',
    store: 'Amazon',
    discount: '$10 DTO',
    discountValue: 10,
    minOrder: 50,
    description: 'Cualquier categoría, mínimo $50',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    isHot: false,
    maxUses: 1000,
    usedCount: 441
  },
  {
    id: 'ml-1',
    code: 'MELI20NOW',
    store: 'Mercado Libre',
    discount: '20% DTO',
    discountValue: 20,
    minOrder: 25,
    description: 'Artículos para el hogar y cocina',
    category: 'Home & Kitchen',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    isHot: true,
    maxUses: 300,
    usedCount: 256
  },
  {
    id: 'ml-2',
    code: 'MELIFREE',
    store: 'Mercado Libre',
    discount: 'Envío GRATIS',
    discountValue: 5,
    description: 'Envío gratis en cualquier compra',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    isHot: false,
    maxUses: 2000,
    usedCount: 880
  },
  {
    id: 'ali-1',
    code: 'ALISUPER',
    store: 'AliExpress',
    discount: '$5 DTO',
    discountValue: 5,
    minOrder: 20,
    description: 'Cualquier compra mayor a $20',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    isHot: true,
    maxUses: 5000,
    usedCount: 4120
  },
  {
    id: 'ali-2',
    code: 'ALITECH30',
    store: 'AliExpress',
    discount: '30% DTO',
    discountValue: 30,
    minOrder: 40,
    description: 'Solo electrónica, mínimo $40',
    category: 'Electronics',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(),
    isHot: false,
    maxUses: 800,
    usedCount: 390
  },
  {
    id: 'tm-1',
    code: 'TEMU40OFF',
    store: 'Temu',
    discount: '40% DTO',
    discountValue: 40,
    minOrder: 15,
    description: 'Tu primera compra en Temu',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    isHot: true,
    maxUses: 10000,
    usedCount: 7230
  },
  {
    id: 'tm-2',
    code: 'TEMUNEW15',
    store: 'Temu',
    discount: '$15 DTO',
    discountValue: 15,
    minOrder: 50,
    description: 'Nuevos usuarios, mínimo $50',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    isHot: false,
    maxUses: 3000,
    usedCount: 1540
  }
];

// --- DATABASE INITALIZATION (JSON File based persistent database) ---
interface Schema {
  users: User[];
  comments: Comment[];
  bookmarks: { userId: string; productId: string; timestamp: string }[];
  priceAlerts: PriceAlert[];
  coupons: Coupon[];
}

function loadDb(): Schema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed.coupons) {
        parsed.coupons = INITIAL_COUPONS;
        saveDb(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading db.json, creating a fresh one', err);
  }

  const defaultDb: Schema = {
    users: [
      {
        id: 'user-demo',
        username: 'Lucas_Offers',
        email: 'lucas@globalshop.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-sim-1',
        username: 'Sofia_Techie',
        email: 'sofia@globalshop.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-sim-2',
        username: 'Marc_Gamer',
        email: 'marc@globalshop.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        createdAt: new Date().toISOString()
      }
    ],
    comments: [
      {
        id: 'c-1',
        productId: 'ml-1',
        userId: 'user-sim-1',
        username: 'Sofia_Techie',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        text: 'This is an absolute steal! The ANC is unbelievable on the WH-1000XM5. Highly recommend it.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'c-2',
        productId: 'al-1',
        userId: 'user-sim-2',
        username: 'Marc_Gamer',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        text: 'Wow, yellow linear switches are extremely smooth. Just bought it on AliExpress, arrived in 8 days!',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ],
    bookmarks: [
      { userId: 'user-demo', productId: 'ml-1', timestamp: new Date().toISOString() },
      { userId: 'user-sim-1', productId: 'am-1', timestamp: new Date().toISOString() }
    ],
    priceAlerts: [
      {
        id: 'a-1',
        productId: 'ml-1',
        userId: 'user-demo',
        targetPrice: 320.00,
        createdAt: new Date().toISOString()
      }
    ],
    coupons: INITIAL_COUPONS
  };

  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json', err);
  }
}

let db = loadDb();

// Active clients for SSE updates
let clients: { id: string; res: any }[] = [];

function broadcast(event: LiveEvent) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (err) {
      console.error('Error broadcasting to client', err);
    }
  });
}

// Simulated real-time users joining, bookmarking, commenting to make the app alive
const SIMULATED_NAMES = ['Mateo_S', 'Camila_Dev', 'Alex_Shop', 'Elena_Pro', 'Nico_G', 'Valentina_Style', 'Thiago_W'];
const SIMULATED_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
];

const SIMULATED_COMMENTS = [
  'The price is really good compared to other stores!',
  'Just ordered one of these, let\'s see when it arrives.',
  'Anyone knows if this shipping is reliable?',
  'I have been tracking this product for a month, this is the lowest price yet.',
  'Amazing quality, absolutely worth the investment.',
  'Highly recommended, perfect design and ergonomics.'
];

setInterval(() => {
  if (clients.length === 0) return;

  // Decide randomly to trigger an event to make it feel alive!
  const rand = Math.random();
  if (rand < 0.3) {
    // Simulated user join
    const randomName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const event: LiveEvent = {
      type: 'user_join',
      id: `sim-evt-${Date.now()}`,
      username: randomName,
      timestamp: new Date().toISOString()
    };
    broadcast(event);
  } else if (rand < 0.6) {
    // Simulated bookmark
    const randomName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const randomProduct = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
    const event: LiveEvent = {
      type: 'bookmark',
      id: `sim-evt-${Date.now()}`,
      username: randomName,
      productId: randomProduct.id,
      productTitle: randomProduct.title,
      store: randomProduct.store,
      timestamp: new Date().toISOString()
    };
    broadcast(event);
  } else if (rand < 0.8) {
    // Simulated comment
    const randomName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const randomAvatar = SIMULATED_AVATARS[Math.floor(Math.random() * SIMULATED_AVATARS.length)];
    const randomProduct = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
    const commentText = SIMULATED_COMMENTS[Math.floor(Math.random() * SIMULATED_COMMENTS.length)];

    const newComment: Comment = {
      id: `sim-c-${Date.now()}`,
      productId: randomProduct.id,
      userId: `sim-user-${Date.now()}`,
      username: randomName,
      userAvatar: randomAvatar,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    db.comments.push(newComment);
    if (db.comments.length > 100) db.comments.shift(); // keep safe length
    saveDb(db);

    const event: LiveEvent = {
      type: 'comment',
      id: `sim-evt-${Date.now()}`,
      username: randomName,
      productId: randomProduct.id,
      productTitle: randomProduct.title,
      text: commentText,
      store: randomProduct.store,
      timestamp: new Date().toISOString()
    };
    broadcast(event);
  } else {
    // Simulated price alert trigger
    const randomName = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)];
    const randomProduct = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
    const event: LiveEvent = {
      type: 'price_alert',
      id: `sim-evt-${Date.now()}`,
      username: randomName,
      productId: randomProduct.id,
      productTitle: randomProduct.title,
      store: randomProduct.store,
      text: `Set target price of $${(randomProduct.price * 0.9).toFixed(2)} on this product!`,
      timestamp: new Date().toISOString()
    };
    broadcast(event);
  }
}, 15000); // Send background simulation updates every 15 seconds to keep dashboard lively and active

// --- API ROUTES ---

function mapDbProductToProduct(dbProduct: any): Product {
  let extraInfo: any = {};
  try {
    if (dbProduct.sku) {
      extraInfo = JSON.parse(dbProduct.sku);
    }
  } catch (e) {
    console.error('Error parsing extra info from sku:', e);
  }

  return {
    id: String(dbProduct.id),
    title: dbProduct.name || '',
    price: Number(dbProduct.price) || 0,
    originalPrice: Number(extraInfo.originalPrice) || Number(dbProduct.price) || 0,
    discount: Number(extraInfo.discount) || 0,
    store: (dbProduct.badge as StoreName) || 'Amazon',
    category: dbProduct.category || 'All',
    image: dbProduct.image || '',
    rating: Number(extraInfo.rating) || 5.0,
    reviewsCount: Number(extraInfo.reviewsCount) || 0,
    url: dbProduct.badge_color || '',
    description: extraInfo.description || '',
    specs: extraInfo.specs || {},
    featured: Boolean(extraInfo.featured)
  };
}

// 1. Get Products
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map(mapDbProductToProduct));
});

// 1b. Get Single Product
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(mapDbProductToProduct(data));
});

// Helper to check if coupons table exists in Supabase
async function isCouponsTableAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.from('coupons').select('id').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
}

// Map database coupon representation to Coupon interface
function mapDbCouponToCoupon(c: any): Coupon {
  return {
    id: c.id,
    code: c.code,
    store: c.store as StoreName,
    discount: c.discount,
    discountValue: Number(c.discount_value),
    minOrder: c.min_order !== null && c.min_order !== undefined ? Number(c.min_order) : undefined,
    description: c.description,
    category: c.category || undefined,
    expiresAt: c.expires_at,
    isHot: Boolean(c.is_hot),
    maxUses: c.max_uses !== null && c.max_uses !== undefined ? Number(c.max_uses) : undefined,
    usedCount: Number(c.used_count || 0)
  };
}

// GET all coupons
app.get('/api/coupons', async (req, res) => {
  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error && data) {
      if (data.length === 0) {
        // Seeding database with default coupons
        const seededDbCoupons = INITIAL_COUPONS.map(c => ({
          code: c.code,
          store: c.store,
          discount: c.discount,
          discount_value: c.discountValue,
          min_order: c.minOrder || null,
          description: c.description,
          category: c.category || null,
          expires_at: c.expiresAt,
          is_hot: Boolean(c.isHot),
          max_uses: c.maxUses || null,
          used_count: c.usedCount || 0
        }));
        await supabase.from('coupons').insert(seededDbCoupons);
        // Fetch again after inserting
        const { data: newData } = await supabase.from('coupons').select('*');
        if (newData) {
          return res.json(newData.map(mapDbCouponToCoupon));
        }
      }
      return res.json(data.map(mapDbCouponToCoupon));
    }
  }
  return res.json(db.coupons || []);
});

// GET single coupon
app.get('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;
  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single();
    if (!error && data) {
      return res.json(mapDbCouponToCoupon(data));
    }
  }
  const coupon = (db.coupons || []).find(c => c.id === id);
  if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado' });
  return res.json(coupon);
});

// 2. Auth: Sign Up
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    avatar: `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1522075469751-3a6694fb2f61', '1534528741775-53994a69daeb'][Math.floor(Math.random() * 5)]}?auto=format&fit=crop&q=80&w=150`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  // Broadcast joining
  broadcast({
    type: 'user_join',
    id: `evt-${Date.now()}`,
    username: newUser.username,
    userId: newUser.id,
    timestamp: new Date().toISOString()
  });

  res.status(201).json({ user: newUser });
});

// AUTH ENDPOINT REMOVED – login and auto‑register disabled
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // For convenience of user-experience and testing, let's auto-register if they login with any email
    const fallbackUsername = email.split('@')[0];
    user = {
      id: `user-${Date.now()}`,
      username: fallbackUsername,
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDb(db);
  }

  broadcast({
    type: 'user_join',
    id: `evt-${Date.now()}`,
    username: user.username,
    userId: user.id,
    timestamp: new Date().toISOString()
  });

  res.json({ user });
});

// 4. Bookmarks: Toggle Favorite
app.post('/api/bookmarks/toggle', (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ error: 'UserId y ProductId son requeridos' });
  }

  const user = db.users.find(u => u.id === userId);
  const product = INITIAL_PRODUCTS.find(p => p.id === productId);

  if (!user || !product) {
    return res.status(404).json({ error: 'Usuario o producto no encontrado' });
  }

  const existingIdx = db.bookmarks.findIndex(b => b.userId === userId && b.productId === productId);
  let active = false;

  if (existingIdx > -1) {
    db.bookmarks.splice(existingIdx, 1);
  } else {
    db.bookmarks.push({ userId, productId, timestamp: new Date().toISOString() });
    active = true;

    // Broadcast bookmark action
    broadcast({
      type: 'bookmark',
      id: `evt-${Date.now()}`,
      username: user.username,
      userId,
      productId,
      productTitle: product.title,
      store: product.store,
      timestamp: new Date().toISOString()
    });
  }

  saveDb(db);
  res.json({ active, bookmarks: db.bookmarks.filter(b => b.userId === userId).map(b => b.productId) });
});

// 5. Get bookmarks of a user
app.get('/api/bookmarks/:userId', (req, res) => {
  const { userId } = req.params;
  const userBookmarks = db.bookmarks.filter(b => b.userId === userId).map(b => b.productId);
  res.json(userBookmarks);
});

// 6. Get comments of a product
app.get('/api/comments/:productId', (req, res) => {
  const { productId } = req.params;
  const prodComments = db.comments.filter(c => c.productId === productId);
  res.json(prodComments);
});

// 7. Add comment to a product
app.post('/api/comments', (req, res) => {
  const { productId, userId, text } = req.body;
  if (!productId || !userId || !text) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const user = db.users.find(u => u.id === userId);
  const product = INITIAL_PRODUCTS.find(p => p.id === productId);

  if (!user || !product) {
    return res.status(404).json({ error: 'Usuario o producto no encontrado' });
  }

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    productId,
    userId,
    username: user.username,
    userAvatar: user.avatar,
    text,
    timestamp: new Date().toISOString()
  };

  db.comments.push(newComment);
  saveDb(db);

  broadcast({
    type: 'comment',
    id: `evt-${Date.now()}`,
    username: user.username,
    userId,
    productId,
    productTitle: product.title,
    text: text,
    store: product.store,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newComment);
});

// 8. Manage Price Alerts
app.post('/api/alerts', (req, res) => {
  const { productId, userId, targetPrice } = req.body;
  if (!productId || !userId || targetPrice == null) {
    return res.status(400).json({ error: 'Faltan datos para crear alerta de precio' });
  }

  const user = db.users.find(u => u.id === userId);
  const product = INITIAL_PRODUCTS.find(p => p.id === productId);

  if (!user || !product) {
    return res.status(404).json({ error: 'Usuario o producto no encontrado' });
  }

  const newAlert: PriceAlert = {
    id: `alert-${Date.now()}`,
    productId,
    userId,
    targetPrice: Number(targetPrice),
    createdAt: new Date().toISOString()
  };

  db.priceAlerts.push(newAlert);
  saveDb(db);

  broadcast({
    type: 'price_alert',
    id: `evt-${Date.now()}`,
    username: user.username,
    userId,
    productId,
    productTitle: product.title,
    store: product.store,
    text: `Configured a price alert for target price $${newAlert.targetPrice.toFixed(2)}`,
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newAlert);
});

app.get('/api/alerts/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(db.priceAlerts.filter(a => a.userId === userId));
});

// 9. Server Sent Events (SSE) stream for real-time dashboard events
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client-${Date.now()}`;
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial events to populate feed immediately
  const initialEvent: LiveEvent = {
    type: 'user_join',
    id: `init-${Date.now()}`,
    username: 'System_Bot',
    timestamp: new Date().toISOString(),
    text: 'Conectado al canal global de ofertas de GlobalShop'
  };
  res.write(`data: ${JSON.stringify(initialEvent)}\n\n`);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y password son obligatorios' });
  if (!isAdmin(email) || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ email, role: 'admin' }, ACTUAL_JWT_SECRET, { expiresIn: '2h' });
  return res.json({ token });
});

// Middleware to protect admin routes
app.use('/api/admin', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACTUAL_JWT_SECRET) as any;
    if (payload.role !== 'admin' || !isAdmin(payload.email)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    // @ts-ignore
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Scraping and details extraction endpoint using Gemini
app.post('/api/admin/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL es requerida' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY no configurada. Por favor, agrega tu API Key de Gemini en el archivo .env del servidor.'
    });
  }

  try {
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`Error al acceder a la URL (${fetchResponse.status})`);
    }

    const html = await fetchResponse.text();

    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

    const headContent = headMatch ? headMatch[1] : '';
    let bodyContent = bodyMatch ? bodyMatch[1] : html;

    bodyContent = bodyContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 30000);

    const cleanHtmlContent = `
      HEAD:
      ${headContent}

      BODY SAMPLE:
      ${bodyContent}
    `;

    const ai = new GoogleGenAI({ apiKey });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `Eres un asistente experto en extracción de información de comercio electrónico.
Analiza el siguiente contenido HTML de una página de producto y extrae la información requerida en un formato JSON plano.

Campos a extraer (si no se encuentran o no aplican, usa los valores por defecto indicados):
- title: El título o nombre del producto.
- price: El precio actual del producto (número decimal).
- originalPrice: El precio original sin descuento (número decimal, opcional, por defecto el mismo precio o 0 si no hay descuento).
- store: Identifica la tienda a la que pertenece el enlace. Debe ser estrictamente uno de los siguientes valores: 'Amazon', 'Mercado Libre', 'AliExpress' o 'Temu' (si no coincide con ninguno, deduce el más cercano o usa 'Amazon').
- category: Deduce una de estas categorías: 'Electronics', 'Home & Kitchen', 'Fashion', 'Outdoor', 'Tools' o 'Entertainment'.
- image: URL de la imagen principal del producto (si la encuentras en meta tags de OpenGraph como og:image o en la página).
- description: Breve descripción de las características principales del producto.
- rating: La calificación promedio del producto (número decimal de 1.0 a 5.0, por defecto 5.0).
- reviewsCount: El número de opiniones/calificaciones (número entero, por defecto 0).

Responde únicamente con el objeto JSON plano (sin formato markdown \`\`\`json ni texto explicativo), asegurándote de que sea un JSON válido.`
        },
        {
          text: cleanHtmlContent
        }
      ]
    });

    let rawJsonText = geminiResponse.text?.trim() || '{}';
    if (rawJsonText.startsWith('```json')) {
      rawJsonText = rawJsonText.substring(7, rawJsonText.length - 3).trim();
    } else if (rawJsonText.startsWith('```')) {
      rawJsonText = rawJsonText.substring(3, rawJsonText.length - 3).trim();
    }

    const productData = JSON.parse(rawJsonText);
    return res.json(productData);

  } catch (error: any) {
    console.error('Error in scraping / Gemini extraction:', error);
    return res.status(500).json({ error: `No se pudo autocompletar la información: ${error.message}` });
  }
});

// Scraping and details extraction from raw copy-pasted text using Gemini
app.post('/api/admin/scrape-text', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto es requerido' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY no configurada. Por favor, agrega tu API Key de Gemini en el archivo .env del servidor.'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `Eres un asistente experto en extracción de información de comercio electrónico.
Analiza el siguiente texto de una página de producto copiado del navegador y extrae la información requerida en un formato JSON plano.

Campos a extraer (si no se encuentran o no aplican, usa los valores por defecto indicados):
- title: El título o nombre del producto.
- price: El precio actual del producto (número decimal).
- originalPrice: El precio original sin descuento (número decimal, opcional, por defecto el mismo precio o 0 si no hay descuento).
- store: Identifica la tienda a la que pertenece el enlace. Debe ser estrictamente uno de los siguientes valores: 'Amazon', 'Mercado Libre', 'AliExpress' o 'Temu' (si no coincide con ninguno, deduce el más cercano o usa 'Amazon').
- category: Deduce una de estas categorías: 'Electronics', 'Home & Kitchen', 'Fashion', 'Outdoor', 'Tools' o 'Entertainment'.
- image: URL de la imagen principal del producto (si la encuentras en el texto, de lo contrario déjala vacía).
- description: Breve descripción de las características principales del producto.
- rating: La calificación promedio del producto (número decimal de 1.0 a 5.0, por defecto 5.0).
- reviewsCount: El número de opiniones/calificaciones (número entero, por defecto 0).

Responde únicamente con el objeto JSON plano (sin formato markdown \`\`\`json ni texto explicativo), asegurándote de que sea un JSON válido.`
        },
        {
          text: text.slice(0, 50000)
        }
      ]
    });

    let rawJsonText = geminiResponse.text?.trim() || '{}';
    if (rawJsonText.startsWith('```json')) {
      rawJsonText = rawJsonText.substring(7, rawJsonText.length - 3).trim();
    } else if (rawJsonText.startsWith('```')) {
      rawJsonText = rawJsonText.substring(3, rawJsonText.length - 3).trim();
    }

    const productData = JSON.parse(rawJsonText);
    return res.json(productData);

  } catch (error: any) {
    console.error('Error in Gemini text extraction:', error);
    return res.status(500).json({ error: `No se pudo extraer la información del texto: ${error.message}` });
  }
});

// Scraping and details extraction of coupon from raw text using Gemini
app.post('/api/admin/scrape-coupon-text', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto es requerido' });

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY no configurada. Por favor, agrega tu API Key de Gemini en el archivo .env del servidor.'
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          text: `Eres un asistente experto en comercio electrónico y cupones de descuento.
Analiza el siguiente texto promocional o información sobre un cupón de descuento y extrae la información requerida en un formato JSON plano.

Campos a extraer (si no se encuentran o no aplican, usa los valores por defecto indicados):
- code: El código promocional o cupón (en mayúsculas, ej: SONY20).
- store: Identifica la tienda a la que pertenece. Debe ser estrictamente uno de los siguientes valores: 'Amazon', 'Mercado Libre', 'AliExpress' o 'Temu' (si no coincide con ninguno, deduce el más cercano o usa 'Amazon').
- discount: La etiqueta de descuento legible (ej: '20% DTO', '$15 DTO', 'Envío GRATIS').
- discountValue: El valor numérico del descuento (ej: 20 para 20%, 15 para $15, 5 para envío gratis).
- minOrder: Compra mínima requerida para aplicar el cupón (número decimal, opcional, por defecto null).
- description: Breve descripción de en qué productos aplica o condiciones (ej: 'Válido para electrónica y computación').
- category: Deduce una de estas categorías o déjala vacía (null) si aplica a toda la tienda: 'Electronics', 'Home & Kitchen', 'Fashion', 'Outdoor', 'Tools' o 'Entertainment'.
- expiresAt: Calcula la fecha de expiración del cupón y devuélvela como una fecha y hora local compatible con datetime-local (formato YYYY-MM-DDTHH:mm). Si no se especifica, calcula una semana a partir de hoy.
- isHot: Si el cupón es destacado o tiene mucha urgencia / alto descuento, devuélvelo como un booleano (true/false).
- maxUses: Número máximo de usos permitidos (número entero, opcional, por defecto null).

Responde únicamente con el objeto JSON plano (sin formato markdown \`\`\`json ni texto explicativo), asegurándote de que sea un JSON válido.`
        },
        {
          text: text.slice(0, 10000)
        }
      ]
    });

    let rawJsonText = geminiResponse.text?.trim() || '{}';
    if (rawJsonText.startsWith('```json')) {
      rawJsonText = rawJsonText.substring(7, rawJsonText.length - 3).trim();
    } else if (rawJsonText.startsWith('```')) {
      rawJsonText = rawJsonText.substring(3, rawJsonText.length - 3).trim();
    }

    const couponData = JSON.parse(rawJsonText);
    return res.json(couponData);

  } catch (error: any) {
    console.error('Error in Gemini coupon text extraction:', error);
    return res.status(500).json({ error: `No se pudo extraer la información del texto: ${error.message}` });
  }
});

// File upload endpoint (store images in Supabase bucket 'image')
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/admin/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const file = req.file;
  const filePath = `${Date.now()}_${file.originalname}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('image')
    .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: false });
  if (uploadError) return res.status(500).json({ error: uploadError.message });
  const { data: publicData } = supabase.storage.from('image').getPublicUrl(filePath);
  const publicUrl = publicData?.publicUrl;
  return res.status(200).json({ url: publicUrl, path: filePath });
});

// Create product
app.post('/api/admin/products', async (req, res) => {
  const p = req.body;
  const dbProduct = {
    name: p.title,
    price: p.price,
    image: p.image,
    category: p.category,
    badge: p.store,
    badge_color: p.url,
    sku: JSON.stringify({
      description: p.description || '',
      originalPrice: p.originalPrice || p.price,
      discount: p.discount || 0,
      rating: p.rating || 5.0,
      reviewsCount: p.reviewsCount || 0,
      specs: p.specs || {},
      featured: Boolean(p.featured)
    })
  };
  const { data, error } = await supabase.from('products').insert([dbProduct]).select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data[0] ? mapDbProductToProduct(data[0]) : null);
});

// Update product
app.put('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const p = req.body;
  
  const { data: existingData, error: fetchError } = await supabase.from('products').select('*').eq('id', id).single();
  if (fetchError) return res.status(500).json({ error: fetchError.message });

  let existingExtra: any = {};
  try {
    if (existingData.sku) {
      existingExtra = JSON.parse(existingData.sku);
    }
  } catch (e) {}

  const mergedExtra = {
    description: p.description !== undefined ? p.description : (existingExtra.description || ''),
    originalPrice: p.originalPrice !== undefined ? p.originalPrice : (existingExtra.originalPrice || existingData.price),
    discount: p.discount !== undefined ? p.discount : (existingExtra.discount || 0),
    rating: p.rating !== undefined ? p.rating : (existingExtra.rating || 5.0),
    reviewsCount: p.reviewsCount !== undefined ? p.reviewsCount : (existingExtra.reviewsCount || 0),
    specs: p.specs !== undefined ? p.specs : (existingExtra.specs || {}),
    featured: p.featured !== undefined ? Boolean(p.featured) : Boolean(existingExtra.featured)
  };

  const dbProduct: any = {};
  if (p.title !== undefined) dbProduct.name = p.title;
  if (p.price !== undefined) dbProduct.price = p.price;
  if (p.image !== undefined) dbProduct.image = p.image;
  if (p.category !== undefined) dbProduct.category = p.category;
  if (p.store !== undefined) dbProduct.badge = p.store;
  if (p.url !== undefined) dbProduct.badge_color = p.url;
  dbProduct.sku = JSON.stringify(mergedExtra);

  const { data, error } = await supabase.from('products').update(dbProduct).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data[0] ? mapDbProductToProduct(data[0]) : null);
});

// Delete all products
app.delete('/api/admin/products', async (req, res) => {
  const { data, error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// Estadísticas de productos (total y por categoría)
app.get('/api/admin/stats', async (req, res) => {
  const { data, error } = await supabase.from('products').select('category');
  if (error) return res.status(500).json({ error: error.message });
  const total = data.length;
  const byCategory = data.reduce((acc, cur) => {
    const cat = cur.category || 'Sin categoría';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return res.json({ total, byCategory });
});

// Lista de productos
app.get('/api/admin/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  return res.json((data || []).map(mapDbProductToProduct));
});

// --- ADMIN COUPONS ENDPOINTS ---

// Create coupon
app.post('/api/admin/coupons', async (req, res) => {
  const c = req.body;
  const dbCoupon = {
    id: c.id || undefined,
    code: c.code,
    store: c.store,
    discount: c.discount,
    discount_value: c.discountValue || 0,
    min_order: c.minOrder || null,
    description: c.description || '',
    category: c.category || null,
    expires_at: c.expiresAt || new Date().toISOString(),
    is_hot: Boolean(c.isHot),
    max_uses: c.maxUses || null,
    used_count: c.usedCount || 0
  };

  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { data, error } = await supabase.from('coupons').insert([dbCoupon]).select();
    if (!error && data && data[0]) {
      return res.status(201).json(mapDbCouponToCoupon(data[0]));
    }
    if (error) {
      console.error('Supabase coupon insert error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback to local DB
  if (!db.coupons) db.coupons = [];
  const localCoupon: Coupon = {
    id: c.id || `cp-${Date.now()}`,
    code: c.code,
    store: c.store,
    discount: c.discount,
    discountValue: c.discountValue || 0,
    minOrder: c.minOrder,
    description: c.description || '',
    category: c.category,
    expiresAt: c.expiresAt || new Date().toISOString(),
    isHot: Boolean(c.isHot),
    maxUses: c.maxUses,
    usedCount: c.usedCount || 0
  };
  db.coupons.push(localCoupon);
  saveDb(db);
  return res.status(201).json(localCoupon);
});

// Update coupon
app.put('/api/admin/coupons/:id', async (req, res) => {
  const { id } = req.params;
  const c = req.body;

  const dbCoupon: any = {};
  if (c.code !== undefined) dbCoupon.code = c.code;
  if (c.store !== undefined) dbCoupon.store = c.store;
  if (c.discount !== undefined) dbCoupon.discount = c.discount;
  if (c.discountValue !== undefined) dbCoupon.discount_value = c.discountValue;
  if (c.minOrder !== undefined) dbCoupon.min_order = c.minOrder;
  if (c.description !== undefined) dbCoupon.description = c.description;
  if (c.category !== undefined) dbCoupon.category = c.category;
  if (c.expiresAt !== undefined) dbCoupon.expires_at = c.expiresAt;
  if (c.isHot !== undefined) dbCoupon.is_hot = Boolean(c.isHot);
  if (c.maxUses !== undefined) dbCoupon.max_uses = c.maxUses;
  if (c.usedCount !== undefined) dbCoupon.used_count = c.usedCount;

  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { data, error } = await supabase.from('coupons').update(dbCoupon).eq('id', id).select();
    if (!error && data && data[0]) {
      return res.json(mapDbCouponToCoupon(data[0]));
    }
    if (error) {
      console.error('Supabase coupon update error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback to local DB
  if (!db.coupons) db.coupons = [];
  const idx = db.coupons.findIndex(item => item.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Cupón no encontrado' });
  db.coupons[idx] = {
    ...db.coupons[idx],
    ...c
  };
  saveDb(db);
  return res.json(db.coupons[idx]);
});

// Delete coupon
app.delete('/api/admin/coupons/:id', async (req, res) => {
  const { id } = req.params;
  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      return res.json({ success: true });
    }
    if (error) {
      console.error('Supabase coupon delete error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback to local DB
  if (!db.coupons) db.coupons = [];
  db.coupons = db.coupons.filter(c => c.id !== id);
  saveDb(db);
  return res.json({ success: true });
});

// Delete all coupons
app.delete('/api/admin/coupons', async (req, res) => {
  const isAvailable = await isCouponsTableAvailable();
  if (isAvailable) {
    const { error } = await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (!error) {
      return res.json({ success: true });
    }
    if (error) {
      console.error('Supabase coupons delete error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Fallback to local DB
  db.coupons = [];
  saveDb(db);
  return res.json({ success: true });
});

// --- VITE AND STATIC ASSETS SERVING MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
