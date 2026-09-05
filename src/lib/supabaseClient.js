import { createClient } from '@supabase/supabase-js';

// Pre-defined default categories with icons and colors
export const DEFAULT_CATEGORIES = [
  { id: 'gastos-hormiga', name: 'Gastos Hormiga 🐜', icon: 'Bug', color: '#f59e0b', isAnt: true },
  { id: 'comida', name: 'Alimentación & Mercados', icon: 'Utensils', color: '#10b981', isAnt: false },
  { id: 'transporte', name: 'Transporte & Movilidad', icon: 'Bus', color: '#3b82f6', isAnt: false },
  { id: 'servicios', name: 'Servicios & Hogar', icon: 'Home', color: '#8b5cf6', isAnt: false },
  { id: 'entretenimiento', name: 'Entretenimiento & Ocio', icon: 'Film', color: '#ec4899', isAnt: false },
  { id: 'salud', name: 'Salud & Farmacia', icon: 'HeartPulse', color: '#ef4444', isAnt: false },
  { id: 'educacion', name: 'Educación & Cursos', icon: 'GraduationCap', color: '#06b6d4', isAnt: false },
  { id: 'compras', name: 'Ropa & Compras', icon: 'ShoppingBag', color: '#f97316', isAnt: false },
  { id: 'otros', name: 'Otros / Imprevistos', icon: 'HelpCircle', color: '#64748b', isAnt: false },
];

const LOCAL_STORAGE_KEY_EXPENSES = 'control_ahorro_expenses_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'control_ahorro_config_v1';
const LOCAL_STORAGE_KEY_BUDGET = 'control_ahorro_budget_v1';

// Helper to get stored config (checks localStorage or Vite environment variables from Vercel)
export const getCloudConfig = () => {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  try {
    const configStr = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (configStr) {
      const parsed = JSON.parse(configStr);
      // If user manually configured it, prioritize it, otherwise fallback to env
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cloud config', e);
  }

  if (envUrl && envKey) {
    return { supabaseUrl: envUrl, supabaseAnonKey: envKey, isEnabled: true };
  }

  return { supabaseUrl: '', supabaseAnonKey: '', isEnabled: false };
};

export const saveCloudConfig = (config) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
};

// Initialize Supabase Client dynamically
let supabaseInstance = null;

export const getSupabaseClient = () => {
  const config = getCloudConfig();
  if (config.isEnabled && config.supabaseUrl && config.supabaseAnonKey) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey);
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

// --- DATA ACCESS LAYER (HYBRID: LocalStorage + Supabase) ---

export const fetchExpenses = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      if (!error && data) {
        // Also sync local storage as backup
        localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(data));
        return data;
      } else {
        console.warn('Supabase fetch error, falling back to local storage:', error?.message);
      }
    } catch (err) {
      console.warn('Supabase request failed:', err);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return getInitialSeedData();
};

export const saveExpense = async (expense) => {
  const newExpense = {
    id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    amount: parseFloat(expense.amount),
    category: expense.category,
    description: expense.description || '',
    is_ant_expense: Boolean(expense.is_ant_expense),
    date: expense.date || new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  // Local storage save first
  const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  let existing = existingStr ? JSON.parse(existingStr) : getInitialSeedData();
  existing = [newExpense, ...existing.filter(e => e.id !== newExpense.id)];
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(existing));

  // Sync to Supabase if available
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('expenses').upsert([newExpense]);
      if (error) console.error('Supabase save error:', error.message);
    } catch (err) {
      console.error('Supabase exception during save:', err);
    }
  }

  return newExpense;
};

export const deleteExpense = async (id) => {
  // Local storage remove
  const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  if (existingStr) {
    const existing = JSON.parse(existingStr);
    const filtered = existing.filter(e => e.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(filtered));
  }

  // Cloud remove
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('expenses').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting from Supabase:', err);
    }
  }
};

export const getMonthlyBudget = () => {
  const b = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
  return b ? parseFloat(b) : 500.00; // Default budget
};

export const setMonthlyBudget = (amount) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, amount.toString());
};

// Seed demo data for first time user experience
function getInitialSeedData() {
  const today = new Date();
  const seed = [
    {
      id: 'demo_1',
      amount: 3.50,
      category: 'gastos-hormiga',
      description: 'Café expreso y galleta de chocolate ☕🍪',
      is_ant_expense: true,
      date: new Date(today.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_2',
      amount: 1.80,
      category: 'gastos-hormiga',
      description: 'Botella de agua y chicle en la calle 💧',
      is_ant_expense: true,
      date: new Date(today.getTime() - 20 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_3',
      amount: 45.00,
      category: 'comida',
      description: 'Supermercado semanal 🛒',
      is_ant_expense: false,
      date: new Date(today.getTime() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_4',
      amount: 12.50,
      category: 'transporte',
      description: 'Recarga de tarjeta de transporte 🚌',
      is_ant_expense: false,
      date: new Date(today.getTime() - 72 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_5',
      amount: 2.20,
      category: 'gastos-hormiga',
      description: 'Snack de papas en la oficina 🍟',
      is_ant_expense: true,
      date: new Date(today.getTime() - 96 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(seed));
  return seed;
}
