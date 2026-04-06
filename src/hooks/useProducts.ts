import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../types';
import { initialProducts } from '../data/initialProducts';

const STORAGE_KEY = 'bfp-products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return initialProducts;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setProducts(prev => [...prev, {
      ...product,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setProducts(initialProducts);
  }, []);

  return { products, addProduct, updateProduct, deleteProduct, resetToDefaults };
}
