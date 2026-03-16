import { create } from 'zustand';
import axios from 'axios';

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
  // New Fields
  date_purchased?: string;
  quantity_purchased?: number;
  purchase_amount?: number;
  supplier_name?: string;
  supplier_contact?: string;
  supplier_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  logs?: any[]; // For detail view
}

export interface Settings {
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  theme: 'light' | 'dark' | 'custom';
  customColor?: string;
  currency: string;
  notificationsEnabled: boolean;
}

interface AppState {
  items: InventoryItem[];
  categories: string[];
  selectedItem: InventoryItem | null;
  settings: Settings;
  loading: boolean;
  error: string | null;
  loadItems: (search?: string, status?: string) => Promise<void>;
  loadItem: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  addItem: (item: any) => Promise<void>;
  updateItem: (id: string, metadata: any) => Promise<void>;
  adjustStock: (id: string, change_amount: number, update_type: string, reason?: string, price_per_unit?: number, total_amount?: number) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
  changePassword: (current: string, next: string) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  currency: '$',
  notificationsEnabled: true
};

const getSavedSettings = (): Settings => {
  const saved = localStorage.getItem('inventory_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const useStore = create<AppState>((set, get) => ({
  items: [],
  categories: [],
  selectedItem: null,
  settings: getSavedSettings(),
  loading: false,
  error: null,
  loadItems: async (search = '', status = '') => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get('http://localhost:3001/api/v1/inventory', { params: { search, status } });
      set({ items: data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch inventory', loading: false });
    }
  },
  loadItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`http://localhost:3001/api/v1/inventory/${id}`);
      set({ selectedItem: data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch item', loading: false });
    }
  },
  loadCategories: async () => {
    try {
      const { data } = await axios.get('http://localhost:3001/api/v1/inventory/categories');
      set({ categories: data.data });
    } catch (error: any) {
      console.error('Failed to load categories', error);
    }
  },
  addItem: async (item) => {
    try {
      await axios.post('http://localhost:3001/api/v1/inventory', item);
      await get().loadItems();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  },
  updateItem: async (id, metadata) => {
    try {
      await axios.put(`http://localhost:3001/api/v1/inventory/${id}`, metadata);
      await get().loadItems();
      if (get().selectedItem?.id === id) await get().loadItem(id);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  },
  adjustStock: async (id, change_amount, update_type, reason, price_per_unit, total_amount) => {
    try {
      await axios.post(`http://localhost:3001/api/v1/inventory/${id}/stock`, { 
        change_amount, update_type, reason, price_per_unit, total_amount 
      });
      await get().loadItems();
      if (get().selectedItem?.id === id) await get().loadItem(id);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  },
  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    set({ settings: updated });
    localStorage.setItem('inventory_settings', JSON.stringify(updated));
  },
  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    localStorage.setItem('inventory_settings', JSON.stringify(DEFAULT_SETTINGS));
  },
  changePassword: async (current, next) => {
    try {
      const { changePassword: changePasswordApi } = await import('./api');
      const result = await changePasswordApi(current, next);
      if (!result.success) throw new Error(result.error);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message;
      set({ error: msg });
      throw new Error(msg);
    }
  }
}));
