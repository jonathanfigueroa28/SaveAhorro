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

export const CURRENCIES = {
  PEN: { code: 'PEN', symbol: 'S/', name: 'Soles (S/)' },
  USD: { code: 'USD', symbol: '$', name: 'Dólares ($)' }
};

// Formato de moneda profesional
export const formatMoney = (amount, currency = 'PEN') => {
  const num = parseFloat(amount) || 0;
  const sym = currency === 'USD' ? '$' : 'S/';
  return `${sym} ${num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Obtener fecha/hora actual en zona horaria Lima (UTC-5) para input datetime-local
export const getLimaNowIso = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return formatter.format(now).replace(' ', 'T').slice(0, 16);
};

// Formatear cualquier fecha ISO en zona horaria Lima (UTC-5)
export const formatLimaDate = (dateVal, options = {}) => {
  if (!dateVal) return '';
  const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    ...options
  }).format(date);
};

// Presets de gastos hormiga peruanos y rápidos
export const ANT_PRESETS_BY_CURRENCY = {
  PEN: [
    { label: '☕ Café pasado', amount: '3.50', desc: 'Café pasado / expreso' },
    { label: '🍵 Emoliente', amount: '2.00', desc: 'Emoliente calentito' },
    { label: '🥖 Pan c/ Chicharrón', amount: '5.00', desc: 'Panadería / antojo' },
    { label: '🍪 Galleta / Snack', amount: '1.50', desc: 'Galleta / snack' },
    { label: '🥤 Gaseosa / Agua', amount: '2.50', desc: 'Bebida al paso' },
    { label: '🚌 Combi / Micro', amount: '1.50', desc: 'Pasaje urbano' },
    { label: '🚊 Metropolitano / Tren', amount: '3.50', desc: 'Recarga transporte' },
    { label: '🚕 Taxi / Yape pasaje', amount: '8.00', desc: 'Taxi al paso' },
    { label: '🍫 Chocolate / Dulce', amount: '2.50', desc: 'Golosina / antojo' },
    { label: '🍦 Helado', amount: '3.00', desc: 'Helado al paso' },
    { label: '📱 Recarga celular', amount: '5.00', desc: 'Recarga prepago' },
    { label: '🪙 Propina', amount: '1.00', desc: 'Propina' },
    { label: '🍬 Chicles / Caramelos', amount: '0.50', desc: 'Chicles / caramelos' },
    { label: '🥪 Menú del día', amount: '12.00', desc: 'Almuerzo / menú al paso' },
  ],
  USD: [
    { label: '☕ Coffee', amount: '3.00', desc: 'Coffee / espresso' },
    { label: '🍪 Snack / Cookies', amount: '1.50', desc: 'Snack / treat' },
    { label: '🥤 Soda / Water', amount: '1.50', desc: 'Cold drink' },
    { label: '🚌 Transit / Bus', amount: '2.50', desc: 'Bus or subway fare' },
    { label: '🚕 Uber / Taxi', amount: '8.00', desc: 'Ride share' },
    { label: '🍦 Ice cream', amount: '3.00', desc: 'Ice cream' },
    { label: '🪙 Tip', amount: '1.00', desc: 'Tip' },
    { label: '🍬 Candy / Gum', amount: '0.50', desc: 'Candy / gum' },
    { label: '🥪 Lunch / Sandwich', amount: '7.50', desc: 'Quick lunch' },
  ]
};

export const PAYMENT_METHODS = [
  { id: 'efectivo', name: '💵 Efectivo', icon: 'Coins' },
  { id: 'yape', name: '🟣 Yape', icon: 'Smartphone' },
  { id: 'plin', name: '🔵 Plin', icon: 'Zap' },
  { id: 'debito', name: '💳 Tarjeta Débito', icon: 'CreditCard' },
  { id: 'credito', name: '💳 Tarjeta Crédito', icon: 'CreditCard' },
  { id: 'transferencia', name: '🏦 Transferencia', icon: 'Building2' },
  { id: 'otro', name: 'Otro', icon: 'HelpCircle' }
];

export const PERU_BANKS = [
  'BCP',
  'Interbank',
  'BBVA',
  'Scotiabank',
  'Banco de la Nación',
  'Falabella',
  'Ripley',
  'BanBif',
  'Pichincha',
  'Caja Arequipa',
  'Caja Huancayo',
  'Otro'
];

const LOCAL_STORAGE_KEY_EXCHANGE = 'control_ahorro_exchange_rate_v1';

// Consulta en tiempo real de la tasa de cambio de mercado USD -> PEN (Google reference rate)
export const fetchLiveExchangeRate = async () => {
  try {
    const cachedStr = localStorage.getItem(LOCAL_STORAGE_KEY_EXCHANGE);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      // Caché válido por 30 minutos
      if (Date.now() - cached.timestamp < 30 * 60 * 1000 && cached.rate) {
        return cached;
      }
    }

    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.PEN) {
        const result = {
          rate: parseFloat(data.rates.PEN),
          updatedAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_EXCHANGE, JSON.stringify(result));
        return result;
      }
    }
  } catch (e) {
    console.warn('Fallo consulta API de cambio 1, intentando secundaria:', e);
  }

  try {
    const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.rates?.PEN) {
        const result = {
          rate: parseFloat(data2.rates.PEN),
          updatedAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_EXCHANGE, JSON.stringify(result));
        return result;
      }
    }
  } catch (e) {
    console.warn('Fallo consulta API secundaria de cambio:', e);
  }

  return { rate: 3.75, updatedAt: 'Estimado', timestamp: Date.now() };
};

const LOCAL_STORAGE_KEY_EXPENSES = 'control_ahorro_expenses_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'control_ahorro_config_v1';
const LOCAL_STORAGE_KEY_BUDGET = 'control_ahorro_budget_v1';
const LOCAL_STORAGE_KEY_CURRENCY = 'control_ahorro_currency_v1';

export const getPreferredCurrency = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY_CURRENCY) || 'PEN';
};

export const setPreferredCurrency = (currency) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_CURRENCY, currency);
};

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

// Initialize Supabase Client dynamically with session persistence
let supabaseInstance = null;

export const getSupabaseClient = () => {
  const config = getCloudConfig();
  if (config.isEnabled && config.supabaseUrl && config.supabaseAnonKey) {
    if (!supabaseInstance) {
      try {
        // Sanitize URL: Remove /rest/v1 or trailing slashes if user pasted the REST endpoint
        const cleanUrl = config.supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
        supabaseInstance = createClient(cleanUrl, config.supabaseAnonKey.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
          }
        });
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

// --- AUTHENTICATION HELPERS ---

export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) return null;
    return session.user;
  } catch (err) {
    console.warn('Error fetching session:', err);
    return null;
  }
};

export const signUpWithEmail = async (email, password) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado. Conéctalo en el botón Nube.');
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password: password.trim()
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase no está configurado. Conéctalo en el botón Nube.');
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Error during sign out:', e);
    }
  }
};

export const onAuthStateChange = (callback) => {
  const client = getSupabaseClient();
  if (!client) return { unsubscribe: () => {} };
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null);
  });
  return subscription;
};

// --- MULTI-TABLE STORAGE KEYS ---
const LOCAL_STORAGE_KEY_ACCOUNTS = 'saveahorro_accounts_v2';
const LOCAL_STORAGE_KEY_INCOMES = 'saveahorro_incomes_v2';
const LOCAL_STORAGE_KEY_FIXED = 'saveahorro_fixed_expenses_v2';

// Cuentas predeterminadas (incluye Efectivo, Yape BCP, Plin, Ahorros Soles y Dólares)
export const DEFAULT_ACCOUNTS = [
  { id: 'acc_efectivo', name: '💵 Efectivo (Billetera)', type: 'efectivo', bank: 'Efectivo', currency: 'PEN', initial_balance: 100, is_operating: true, color: '#10b981' },
  { id: 'acc_yape', name: '🟣 Yape (BCP Principal)', type: 'billetera_digital', bank: 'BCP', currency: 'PEN', initial_balance: 200, is_operating: true, color: '#8b5cf6' },
  { id: 'acc_plin', name: '🔵 Plin (Interbank / BBVA)', type: 'billetera_digital', bank: 'Interbank', currency: 'PEN', initial_balance: 50, is_operating: true, color: '#06b6d4' },
  { id: 'acc_bcp_debito', name: '💳 Cuenta Corriente BCP', type: 'banco', bank: 'BCP', currency: 'PEN', initial_balance: 500, is_operating: true, color: '#3b82f6' },
  { id: 'acc_ahorro_pen', name: '🏦 Ahorro Reserva Soles', type: 'ahorros', bank: 'BBVA', currency: 'PEN', initial_balance: 3400, is_operating: false, color: '#f59e0b' },
  { id: 'acc_ahorro_usd', name: '💵 Ahorro Reserva Dólares', type: 'ahorros', bank: 'Interbank', currency: 'USD', initial_balance: 2000, is_operating: false, color: '#10b981' },
  { id: 'acc_tc_bcp', name: '💳 Tarjeta Crédito BCP', type: 'tarjeta_credito', bank: 'BCP', currency: 'PEN', initial_balance: 0, is_operating: false, color: '#ef4444' }
];

export const DEFAULT_INCOMES = [
  { id: 'inc_1', title: 'Sueldo Principal (Soles)', amount: 2500, currency: 'PEN', frequency: 'mensual' },
  { id: 'inc_2', title: 'Ingreso Extra / Remoto (USD)', amount: 0, currency: 'USD', frequency: 'mensual' }
];

export const DEFAULT_FIXED_EXPENSES = [
  { id: 'fix_1', title: 'Alquiler / Casa', amount: 800, currency: 'PEN', category: 'servicios', due_day: 5, is_paid: false },
  { id: 'fix_2', title: 'Luz (Enel / Luz del Sur)', amount: 120, currency: 'PEN', category: 'servicios', due_day: 18, is_paid: false },
  { id: 'fix_3', title: 'Agua (Sedapal)', amount: 45, currency: 'PEN', category: 'servicios', due_day: 20, is_paid: false },
  { id: 'fix_4', title: 'Internet Fibra Óptica', amount: 90, currency: 'PEN', category: 'servicios', due_day: 15, is_paid: false },
  { id: 'fix_5', title: 'Suscripciones (Netflix / Spotify)', amount: 55, currency: 'PEN', category: 'entretenimiento', due_day: 25, is_paid: false }
];

// --- CUENTAS CRUD ---
export const fetchAccounts = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      const { data, error } = await client
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Error fetching accounts from Supabase:', e);
    }
  }

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
};

export const saveAccount = async (account) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
  let accounts = raw ? JSON.parse(raw) : DEFAULT_ACCOUNTS;

  const itemToSave = {
    ...account,
    id: account.id || 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    initial_balance: parseFloat(account.initial_balance) || 0,
    current_balance: parseFloat(account.current_balance ?? account.initial_balance) || 0,
    user_id: user?.id || null,
    created_at: account.created_at || new Date().toISOString()
  };

  const exists = accounts.some(a => a.id === itemToSave.id);
  if (exists) {
    accounts = accounts.map(a => a.id === itemToSave.id ? itemToSave : a);
  } else {
    accounts = [...accounts, itemToSave];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

  if (client && user) {
    try {
      await client.from('accounts').upsert([itemToSave]);
    } catch (err) {
      console.warn('Supabase account save error:', err);
    }
  }
  return itemToSave;
};

export const deleteAccount = async (id) => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
  if (raw) {
    const accounts = JSON.parse(raw).filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      await client.from('accounts').delete().eq('id', id).eq('user_id', user.id);
    } catch (e) {
      console.warn('Error deleting account:', e);
    }
  }
};

// --- SUELDOS E INGRESOS CRUD ---
export const fetchIncomes = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      const { data, error } = await client
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_INCOMES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Error fetching incomes:', e);
    }
  }
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_INCOMES);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_INCOMES, JSON.stringify(DEFAULT_INCOMES));
  return DEFAULT_INCOMES;
};

export const saveIncome = async (income) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_INCOMES);
  let incomes = raw ? JSON.parse(raw) : DEFAULT_INCOMES;

  const itemToSave = {
    ...income,
    id: income.id || 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    amount: parseFloat(income.amount) || 0,
    user_id: user?.id || null,
    created_at: income.created_at || new Date().toISOString()
  };

  const exists = incomes.some(i => i.id === itemToSave.id);
  if (exists) {
    incomes = incomes.map(i => i.id === itemToSave.id ? itemToSave : i);
  } else {
    incomes = [...incomes, itemToSave];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_INCOMES, JSON.stringify(incomes));

  if (client && user) {
    try {
      await client.from('incomes').upsert([itemToSave]);
    } catch (err) {
      console.warn('Error saving income to Supabase:', err);
    }
  }
  return itemToSave;
};

export const deleteIncome = async (id) => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_INCOMES);
  if (raw) {
    const list = JSON.parse(raw).filter(i => i.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_INCOMES, JSON.stringify(list));
  }
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      await client.from('incomes').delete().eq('id', id).eq('user_id', user.id);
    } catch (e) {}
  }
};

// --- GASTOS FIJOS DEL MES CRUD ---
export const fetchFixedExpenses = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      const { data, error } = await client
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true });
      if (!error && data && data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY_FIXED, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Error fetching fixed expenses:', e);
    }
  }
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FIXED);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_FIXED, JSON.stringify(DEFAULT_FIXED_EXPENSES));
  return DEFAULT_FIXED_EXPENSES;
};

export const saveFixedExpense = async (fixed) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FIXED);
  let list = raw ? JSON.parse(raw) : DEFAULT_FIXED_EXPENSES;

  const itemToSave = {
    ...fixed,
    id: fixed.id || 'fix_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    amount: parseFloat(fixed.amount) || 0,
    due_day: parseInt(fixed.due_day) || 1,
    is_paid: Boolean(fixed.is_paid),
    user_id: user?.id || null,
    created_at: fixed.created_at || new Date().toISOString()
  };

  const exists = list.some(f => f.id === itemToSave.id);
  if (exists) {
    list = list.map(f => f.id === itemToSave.id ? itemToSave : f);
  } else {
    list = [...list, itemToSave];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_FIXED, JSON.stringify(list));

  if (client && user) {
    try {
      await client.from('fixed_expenses').upsert([itemToSave]);
    } catch (err) {
      console.warn('Error saving fixed expense to Supabase:', err);
    }
  }
  return itemToSave;
};

export const deleteFixedExpense = async (id) => {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FIXED);
  if (raw) {
    const list = JSON.parse(raw).filter(f => f.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_FIXED, JSON.stringify(list));
  }
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      await client.from('fixed_expenses').delete().eq('id', id).eq('user_id', user.id);
    } catch (e) {}
  }
};

// --- DATA ACCESS LAYER (HYBRID: LocalStorage + Supabase) ---

export const fetchExpenses = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client) {
    try {
      let query = client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (user?.id) {
        query = query.eq('user_id', user.id);
      }
        
      const { data, error } = await query;
      if (!error && data) {
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
  const currentCurrency = expense.currency || getPreferredCurrency() || 'PEN';
  const user = await getCurrentUser();
  const newExpense = {
    id: expense.id || 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    amount: parseFloat(expense.amount),
    currency: currentCurrency,
    category: expense.category,
    description: expense.description || '',
    is_ant_expense: Boolean(expense.is_ant_expense),
    payment_method: expense.payment_method || null,
    account_id: expense.account_id || null,
    bank: expense.bank || null,
    place: expense.place || null,
    user_id: user?.id || null,
    date: expense.date || new Date().toISOString(),
    created_at: expense.created_at || new Date().toISOString()
  };

  // Local storage save first
  const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  let existing = existingStr ? JSON.parse(existingStr) : getInitialSeedData();
  existing = [newExpense, ...existing.filter(e => e.id !== newExpense.id)];
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(existing));

  let cloudError = null;
  // Sync to Supabase if available
  const client = getSupabaseClient();
  if (client) {
    try {
      // Intentar guardar con todas las columnas
      let { error } = await client.from('expenses').upsert([newExpense]);
      // Si faltan columnas nuevas en la tabla de Supabase (código PGRST204), reintentar con columnas base
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        const basePayload = {
          id: newExpense.id,
          amount: newExpense.amount,
          category: newExpense.category,
          description: newExpense.description,
          is_ant_expense: newExpense.is_ant_expense,
          date: newExpense.date,
          created_at: newExpense.created_at
        };
        const retry = await client.from('expenses').upsert([basePayload]);
        error = retry.error;
      }

      if (error) {
        console.error('Supabase save error:', error);
        cloudError = error.message;
      }
    } catch (err) {
      console.error('Supabase exception during save:', err);
      cloudError = err.message;
    }
  }

  return { expense: newExpense, cloudError, isCloudEnabled: Boolean(client) };
};

export const updateExpense = async (id, updatedFields) => {
  const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY_EXPENSES);
  let existing = existingStr ? JSON.parse(existingStr) : [];
  let updatedExpense = null;

  existing = existing.map(item => {
    if (item.id === id) {
      updatedExpense = { ...item, ...updatedFields };
      return updatedExpense;
    }
    return item;
  });

  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(existing));

  let cloudError = null;
  const client = getSupabaseClient();
  if (client && updatedExpense) {
    try {
      let { error } = await client.from('expenses').upsert([updatedExpense]);
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        const basePayload = {
          id: updatedExpense.id,
          amount: updatedExpense.amount,
          category: updatedExpense.category,
          description: updatedExpense.description,
          is_ant_expense: updatedExpense.is_ant_expense,
          date: updatedExpense.date,
          created_at: updatedExpense.created_at
        };
        const retry = await client.from('expenses').upsert([basePayload]);
        error = retry.error;
      }
      if (error) {
        console.error('Supabase update error:', error);
        cloudError = error.message;
      }
    } catch (err) {
      console.error('Supabase update exception:', err);
      cloudError = err.message;
    }
  }

  return { expense: updatedExpense, cloudError };
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
  const user = await getCurrentUser();
  if (client) {
    try {
      let query = client.from('expenses').delete().eq('id', id);
      if (user?.id) {
        query = query.eq('user_id', user.id);
      }
      await query;
    } catch (err) {
      console.error('Error deleting from Supabase:', err);
    }
  }
};

export const getMonthlyBudget = () => {
  const b = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
  return b ? parseFloat(b) : 1500.00; // Presupuesto mensual por defecto en Soles
};

export const setMonthlyBudget = (amount) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, amount.toString());
};

// Seed demo data for first time user experience (adaptado a Lima, Perú en Soles)
function getInitialSeedData() {
  const today = new Date();
  const seed = [
    {
      id: 'demo_1',
      amount: 3.50,
      currency: 'PEN',
      category: 'gastos-hormiga',
      description: 'Café pasado y galleta ☕🍪',
      is_ant_expense: true,
      date: new Date(today.getTime() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_2',
      amount: 2.00,
      currency: 'PEN',
      category: 'gastos-hormiga',
      description: 'Emoliente caliente en la esquina 🍵',
      is_ant_expense: true,
      date: new Date(today.getTime() - 20 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_3',
      amount: 65.00,
      currency: 'PEN',
      category: 'comida',
      description: 'Compras semanales en mercado / súper 🛒',
      is_ant_expense: false,
      date: new Date(today.getTime() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_4',
      amount: 1.50,
      currency: 'PEN',
      category: 'transporte',
      description: 'Pasaje en combi / micro 🚌',
      is_ant_expense: false,
      date: new Date(today.getTime() - 72 * 3600 * 1000).toISOString()
    },
    {
      id: 'demo_5',
      amount: 2.50,
      currency: 'PEN',
      category: 'gastos-hormiga',
      description: 'Gaseosa Inca Kola / agua al paso 🥤',
      is_ant_expense: true,
      date: new Date(today.getTime() - 96 * 3600 * 1000).toISOString()
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY_EXPENSES, JSON.stringify(seed));
  return seed;
}

const LOCAL_STORAGE_KEY_LIQUIDITY = 'saveahorro_liquidity_v1';

export const getLiquidityData = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LIQUIDITY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading liquidity data', e);
  }
  return {
    accounts: [
      { id: 'acc_1', name: 'Cuenta Principal (Sueldo / Día a día)', bank: 'BCP', currency: 'PEN', balance: 200, isOperating: true },
      { id: 'acc_2', name: 'Ahorro Reserva Soles', bank: 'BBVA', currency: 'PEN', balance: 3400, isOperating: false },
      { id: 'acc_3', name: 'Ahorro Reserva Dólares', bank: 'Interbank', currency: 'USD', balance: 2000, isOperating: false }
    ],
    expectedSalary: 2500,
    creditCardInitialDebt: 0
  };
};

export const saveLiquidityData = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LIQUIDITY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving liquidity data', e);
  }
};

