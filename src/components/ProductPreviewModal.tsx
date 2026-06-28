import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Product } from '../types';

interface ProductPreviewModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductPreviewModal({ product, onClose }: ProductPreviewModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden"
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
            aria-label="Cerrar vista previa"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-full md:w-48 h-48 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{product.title}</h3>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">${product.price.toFixed(2)}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
                <div className="mt-4">
                  <h4 className="font-medium text-zinc-800 dark:text-gray-200">Especificaciones</h4>
                  <ul className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
