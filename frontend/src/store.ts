import { create } from 'zustand';
import { fetchInventory, createItem, updateStock, fetchCategories } from './api';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  threshold: number;
  price: number;
  supplier: string;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
}

interface AppState {
  items: InventoryItem[];
  categories: string[];
  loading: boolean;
  error: string | null;
  loadItems: (search?: string, status?: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  addItem: (item: any) => Promise<void>;
  adjustStock: (id: string, change_amount: number, update_type: string, reason?: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  items: [],
  categories: [],
  loading: false,
  error: null,
  loadItems: async (search = '', status = '') => {
    set({ loading: true, error: null });
    try {
      const items = await fetchInventory(search, status);
      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch inventory', loading: false });
    }
  },
  loadCategories: async () => {
    try {
      const categories = await fetchCategories();
      set({ categories });
    } catch (error: any) {
      console.error('Failed to load categories', error);
    }
  },
  addItem: async (item) => {
    try {
      await createItem(item);
      await get().loadItems();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  },
  adjustStock: async (id, change_amount, update_type, reason) => {
    try {
      await updateStock(id, { change_amount, update_type, reason });
      await get().loadItems();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  }
}));
