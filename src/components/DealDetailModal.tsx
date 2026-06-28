import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bell, TrendingDown, Star, ExternalLink, ShieldCheck, Clock, Check, AlertCircle } from 'lucide-react';
import { Product, User, Comment } from '../types';

interface DealDetailModalProps {
  product: Product | null;
  user: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export default function DealDetailModal({
  product,
  user,
  onClose,
  onOpenAuth
}: DealDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [settingAlert, setSettingAlert] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product) return;

    // Fetch comments
    fetch(`/api/comments/${product.id}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error('Error fetching comments', err));

    // Listen to window/global SSE events to update comments live if someone else replies!
    const handleLiveComment = (e: CustomEvent) => {
      const evt = e.detail;
      if (evt.type === 'comment' && evt.productId === product.id) {
        setComments(prev => {
          // Avoid duplicate comments
          if (prev.some(c => c.id === evt.id)) return prev;
          return [...prev, {
            id: evt.id,
            productId: evt.productId,
            userId: evt.userId || 'sim',
            username: evt.username || 'Anonymous',
            userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            text: evt.text || '',
            timestamp: evt.timestamp
          }];
        });
      }
    };

    window.addEventListener('live-event', handleLiveComment as EventListener);
    return () => {
      window.removeEventListener('live-event', handleLiveComment as EventListener);
    };
  }, [product]);

  useEffect(() => {
    // Scroll to bottom of comments when comments load or change
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  if (!product) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user.id,
          text: newComment
        })
      });

      if (res.ok) {
        const addedComment = await res.json();
        // Check if already in comments list due to SSE, otherwise add
        setComments(prev => {
          if (prev.some(c => c.id === addedComment.id)) return prev;
          return [...prev, addedComment];
        });
        setNewComment('');
      }
    } catch (err) {
      console.error('Error writing comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!targetPrice || isNaN(Number(targetPrice))) return;

    setSettingAlert(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user.id,
          targetPrice: Number(targetPrice)
        })
      });

      if (res.ok) {
        setAlertSuccess(true);
        setTimeout(() => setAlertSuccess(false), 3500);
        setTargetPrice('');
      }
    } catch (err) {
      console.error('Error configuring price alert', err);
    } finally {
      setSettingAlert(false);
    }
  };

  // Generate smooth high-quality coordinate points for price trend chart
  const originalPrice = product.originalPrice || product.price * 1.15;
  const currentPrice = product.price;
  const priceHistory = [
    originalPrice,
    originalPrice * 0.98,
    originalPrice * 0.95,
    originalPrice * 1.02,
    originalPrice * 0.94,
    currentPrice * 1.08,
    currentPrice
  ];

  // Map prices to coordinate box
  const minHist = Math.min(...priceHistory) * 0.95;
  const maxHist = Math.max(...priceHistory) * 1.05;
  const range = maxHist - minHist;
  const points = priceHistory.map((val, idx) => {
    const x = (idx / (priceHistory.length - 1)) * 100;
    const y = 100 - ((val - minHist) / range) * 80 - 10; // offset inside 100px vertical range
    return `${x},${y}`;
  }).join(' ');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          id="deal-detail-modal"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-md border border-gray-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white dark:border-zinc-700 transition-colors"
            id="close-deal-modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* LEFT COLUMN: PRODUCT SPECS & CHART */}
          <div className="w-full md:w-1/2 overflow-y-auto p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800 flex flex-col space-y-6">
            {/* Store and title */}
            <div>
              <span className="text-xs font-bold font-mono tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
                {product.store} Exclusive
              </span>
              <h3 className="font-display text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-2 leading-tight">
                {product.title}
              </h3>
            </div>

            {/* Product Image Cover */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-md">
                  -{product.discount}% OFF
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Description</h4>
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications Grid */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2.5">Specifications</h4>
              <div className="grid grid-cols-2 gap-3.5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-gray-50 p-2.5 dark:bg-zinc-950/40 border border-gray-100/40 dark:border-zinc-900">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium uppercase">{key}</p>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Trend Chart (Custom animated SVG) */}
            <div className="rounded-xl border border-gray-100 p-4 dark:border-zinc-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-950/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">30-Day Price Trend</h4>
                </div>
                <span className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                  Lowest Price Detected
                </span>
              </div>

              {/* Draw animated SVG */}
              <div className="relative h-28 w-full mt-2 bg-transparent">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(156,163,175,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(156,163,175,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(156,163,175,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                  
                  {/* Fill Area Gradient */}
                  <defs>
                    <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  <polygon
                    points={`0,100 ${points} 100,100`}
                    fill="url(#gradient-chart)"
                  />

                  {/* Smooth Spark Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={points}
                    className="animate-dash"
                  />

                  {/* Circles at data points */}
                  {priceHistory.map((val, idx) => {
                    const x = (idx / (priceHistory.length - 1)) * 100;
                    const y = 100 - ((val - minHist) / range) * 80 - 10;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="2"
                        className="fill-emerald-500 hover:r-3 hover:stroke-white hover:stroke-1 cursor-pointer transition-all"
                      />
                    );
                  })}
                </svg>

                {/* Price indicators */}
                <div className="absolute left-0 top-0 text-[9px] font-mono font-medium text-gray-400">${maxHist.toFixed(0)}</div>
                <div className="absolute left-0 bottom-0 text-[9px] font-mono font-medium text-gray-400">${minHist.toFixed(0)}</div>
                <div className="absolute right-0 bottom-2 text-[10px] font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1 rounded">
                  Now: ${currentPrice}
                </div>
              </div>
            </div>

            {/* Direct Link Anchor Button */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold text-sm py-3 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-md mt-auto shrink-0"
            >
              <span>Ver Oferta Directamente</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* RIGHT COLUMN: SMART PRICE ALERTS & REAL-TIME COMMUNITY CHAT */}
          <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full bg-gray-50/50 dark:bg-zinc-950/30 overflow-hidden">
            
            {/* SECTION 1: PRICE ALERT FORM */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shrink-0">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <Bell className="h-4.5 w-4.5 text-emerald-500 animate-swing" />
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">Set Smart Price Alert</h4>
              </div>

              {alertSuccess ? (
                <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>¡Alerta activada! Te notificaremos en tiempo real cuando baje de tu precio objetivo.</span>
                </div>
              ) : (
                <form onSubmit={handleSetAlert} className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2 text-sm font-bold text-gray-400 dark:text-zinc-500 font-mono">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={product.price}
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={`Target (e.g. ${(product.price * 0.9).toFixed(0)})`}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-7 pr-3 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={settingAlert}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shrink-0 transition-colors"
                  >
                    Set Alert
                  </button>
                </form>
              )}
            </div>

            {/* SECTION 2: REAL-TIME DISCUSSION FEED */}
            <div className="p-4 px-6 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-950/20 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Live Community Chat</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-500 flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Synchronized Real-Time</span>
              </span>
            </div>

            {/* Comments List Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <AlertCircle className="h-8 w-8 text-gray-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">No discussion yet on this deal</p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <img
                      src={comment.userAvatar}
                      alt={comment.username}
                      className="h-8.5 w-8.5 rounded-full object-cover shrink-0 border border-gray-100 dark:border-zinc-800"
                    />
                    <div className="flex-1 rounded-2xl bg-white p-3 shadow-xs border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800/60">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">@{comment.username}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comments Form Input (docked at the bottom) */}
            <div className="p-4 bg-white border-t border-gray-100 dark:border-zinc-800/80 dark:bg-zinc-900 shrink-0">
              {user ? (
                <form onSubmit={handlePostComment} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or comment on this offer..."
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-2 px-3.5 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shrink-0 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 dark:bg-zinc-950/40 dark:border-zinc-800/80">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Sign in to join the live discussion</span>
                  <button
                    onClick={onOpenAuth}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
