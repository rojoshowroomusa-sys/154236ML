import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User as UserIcon, Lock, Sparkles, Loader2 } from 'lucide-react';
import { User } from '../types';
import { supabaseAuth } from '../supabaseAuthClient';
import { ADMIN_EMAIL, isAdmin } from '../config/adminConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await supabaseAuth.auth.signUp({
          email,
          password,
          options: { data: { username } }
        });
      } else {
        result = await supabaseAuth.auth.signInWithPassword({ email, password });
      }
      const { data, error } = result;
      if (error) throw new Error(error.message);
      if (!data?.user) throw new Error('Usuario no encontrado');
      
      // Store token for future auth
      if (data.session?.access_token) {
        localStorage.setItem('supabase_token', data.session.access_token);
        if (isAdmin(email)) {
          localStorage.setItem('admin_token', data.session.access_token);
        }
      }
      
      const role: 'admin' | 'user' = isAdmin(email) ? 'admin' : 'user';
      const userWithRole = {
        id: data.user.id,
        username: isAdmin(email) ? 'Admin' : (data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User'),
        email: data.user.email || email,
        avatar: data.user.user_metadata?.avatar || '',
        createdAt: data.user.created_at,
        role
      };

      localStorage.setItem('user', JSON.stringify(userWithRole));
      onAuthSuccess(userWithRole);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
            id="auth-modal"
          >
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-linear-to-r from-emerald-500 via-teal-500 to-indigo-500" />

            <div className="p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
                id="close-auth-modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title & Description */}
              <div className="text-center mb-6">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
                  {isSignUp ? 'Join GlobalShop Deals' : 'Welcome Back'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">
                  {isSignUp 
                    ? 'Track best deals, customize price alerts and discuss live with other shoppers'
                    : 'Access your saved bookmarks, configured alerts and shopper activity.'
                  }
                </p>
              </div>

              {/* Error messages */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
                        <UserIcon className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your_handle"
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Password
                    </label>
                    {!isSignUp && (
                      <span className="text-xs text-emerald-600 hover:underline cursor-pointer dark:text-emerald-400">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-500">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 disabled:opacity-50 transition-all shadow-md flex items-center justify-center space-x-2"
                  id="submit-auth-form"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white dark:text-zinc-900" />
                  ) : (
                    <span>{isSignUp ? 'Create Free Account' : 'Sign In To Dashboard'}</span>
                  )}
                </button>
              </form>

              {/* Toggle Account Mode */}
              <div className="mt-6 text-center border-t border-gray-50 dark:border-zinc-800/80 pt-4">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-gray-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  id="toggle-auth-mode"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign In' 
                    : 'Don\'t have an account yet? Create one free'
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
