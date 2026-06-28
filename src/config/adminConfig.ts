// src/config/adminConfig.ts

/**
 * Dirección de correo electrónico que tiene privilegios de administrador.
 */
export const ADMIN_EMAIL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL) || 
  (typeof process !== 'undefined' && process.env.VITE_ADMIN_EMAIL) || 
  "admin@globalshop.com";

/**
 * Contraseña del administrador.
 */
export const ADMIN_PASSWORD = 
  (typeof process !== 'undefined' && process.env.ADMIN_PASSWORD) || 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) ||
  "admin1234";

/**
 * Helper para verificar si un email corresponde al administrador.
 */
export const isAdmin = (email: string): boolean => email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
