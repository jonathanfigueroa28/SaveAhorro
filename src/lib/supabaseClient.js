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

// Generador de UUID compatible con PostgreSQL y navegadores
export const isValidUUID = (str) => {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

// Formatear cualquier fecha ISO en zona horaria Lima (UTC-5) de forma segura contra RangeError
export const formatLimaDate = (dateVal, options = {}) => {
  if (!dateVal) return '';
  try {
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat('es-PE', {
      timeZone: 'America/Lima',
      ...options
    }).format(date);
  } catch (e) {
    return '';
  }
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

// In-memory cache for live market exchange rate USD -> PEN
let inMemoryExchangeRate = null;

export const fetchLiveExchangeRate = async () => {
  if (inMemoryExchangeRate && (Date.now() - inMemoryExchangeRate.timestamp < 30 * 60 * 1000)) {
    return inMemoryExchangeRate;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.PEN) {
        inMemoryExchangeRate = {
          rate: parseFloat(data.rates.PEN),
          updatedAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        };
        return inMemoryExchangeRate;
      }
    }
  } catch (e) {
    console.warn('Consulta tasa cambio primaria falló:', e);
  }

  try {
    const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.rates?.PEN) {
        inMemoryExchangeRate = {
          rate: parseFloat(data2.rates.PEN),
          updatedAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        };
        return inMemoryExchangeRate;
      }
    }
  } catch (e) {
    console.warn('Consulta tasa cambio secundaria falló:', e);
  }

  return { rate: 3.75, updatedAt: 'Estimado', timestamp: Date.now() };
};

// ==============================================================================
// LIMPIEZA TOTAL DE LOCALSTORAGE (CERO PERSISTENCIA FINANCIERA LOCAL)
// ==============================================================================
export const clearFinancialLocalStorage = () => {
  try {
    const financialKeys = [
      'control_ahorro_expenses_v1',
      'saveahorro_accounts_v2',
      'saveahorro_incomes_v2',
      'saveahorro_fixed_expenses_v2',
      'saveahorro_tc_config_v2',
      'saveahorro_tc_base_debt',
      'saveahorro_savings_goal_v1',
      'control_ahorro_budget_v1',
      'control_ahorro_currency_v1',
      'saveahorro_liquidity_v1',
      'saveahorro_local_users',
      'saveahorro_active_user',
      'saveahorro_user_profile',
      'saveahorro_zero_defaults_v2',
      'control_ahorro_exchange_rate_v1'
    ];
    financialKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
  } catch (e) {
    console.warn('Limpieza de almacenamiento local:', e);
  }
};

// Ejecución inmediata de limpieza de registros locales residuales
clearFinancialLocalStorage();

// ==============================================================================
// CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS SUPABASE
// ==============================================================================
const LOCAL_STORAGE_KEY_CONFIG = 'control_ahorro_config_v1';

export const getCloudConfig = () => {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  try {
    const configStr = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (configStr) {
      const parsed = JSON.parse(configStr);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return parsed;
      }
    }
  } catch (e) {}

  if (envUrl && envKey) {
    return { supabaseUrl: envUrl, supabaseAnonKey: envKey, isEnabled: true };
  }

  return { supabaseUrl: '', supabaseAnonKey: '', isEnabled: false };
};

export const saveCloudConfig = (config) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
};

let supabaseInstance = null;
let knownTableColumns = {};
let knownMissingColumns = {};
let isIntrospecting = false;

/**
 * Consulta la especificación OpenAPI de Supabase en tiempo de ejecución
 * para conocer de forma anticipada qué columnas existen físicamente en cada tabla.
 * Esto evita por completo errores HTTP 400 en la consola del navegador.
 */
export const introspectSchema = async () => {
  if (isIntrospecting) return;
  const config = getCloudConfig();
  if (!config.isEnabled || !config.supabaseUrl || !config.supabaseAnonKey) return;

  isIntrospecting = true;
  try {
    const cleanUrl = config.supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/rest/v1/`, {
      headers: {
        'apikey': config.supabaseAnonKey.trim(),
        'Authorization': `Bearer ${config.supabaseAnonKey.trim()}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.definitions) {
        Object.keys(data.definitions).forEach(table => {
          if (data.definitions[table]?.properties) {
            knownTableColumns[table] = new Set(Object.keys(data.definitions[table].properties));
          }
        });
        console.info('[Supabase Introspect] Columnas físicas detectadas para:', Object.keys(knownTableColumns));
      }
    }
  } catch (e) {
    console.warn('[Supabase Introspect] Consulta de esquema OpenAPI omitida:', e?.message || e);
  } finally {
    isIntrospecting = false;
  }
};

export const getSupabaseClient = () => {
  const config = getCloudConfig();
  if (config.isEnabled && config.supabaseUrl && config.supabaseAnonKey) {
    if (!supabaseInstance) {
      try {
        const cleanUrl = config.supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
        supabaseInstance = createClient(cleanUrl, config.supabaseAnonKey.trim(), {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage // Sesión de autenticación oficial Supabase
          }
        });
        // Disparar introspección en segundo plano sin bloquear
        introspectSchema();
      } catch (e) {
        console.error('Error al inicializar cliente de Supabase:', e);
        return null;
      }
    }
    return supabaseInstance;
  }
  return null;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
  knownTableColumns = {};
  knownMissingColumns = {};
  isIntrospecting = false;
};

// ==============================================================================
// AUTENTICACIÓN DIRECTA CON SUPABASE AUTH (CERO USUARIOS EN LOCALSTORAGE)
// ==============================================================================
export const getCurrentUser = async () => {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (!error && session?.user) return session.user;
    } catch (err) {
      console.warn('Error al verificar sesión en Supabase:', err);
    }
  }
  return null;
};

export const signUpWithEmail = async (email, password, metadata = {}) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Base de datos no configurada. Conecta tu proyecto Supabase en el botón Nube.');
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password: password.trim(),
    options: {
      data: metadata
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  const client = getSupabaseClient();
  if (!client) throw new Error('Base de datos no configurada. Conecta tu proyecto Supabase en el botón Nube.');
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
      console.warn('Error durante cierre de sesión:', e);
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

// ==============================================================================
// AJUSTES DE USUARIO Y PRESUPUESTO (TABLA: user_settings)
// ==============================================================================
let inMemoryMonthlyBudget = 1500;
let inMemoryPreferredCurrency = 'PEN';

export const fetchUserSettings = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return null;
  try {
    const { data, error } = await client
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      if (data.monthly_budget !== null && data.monthly_budget !== undefined) {
        inMemoryMonthlyBudget = parseFloat(data.monthly_budget);
      }
      if (data.preferred_currency) {
        inMemoryPreferredCurrency = data.preferred_currency;
      }
      return data;
    }
  } catch (e) {
    console.error('Supabase fetchUserSettings error:', e);
  }
  return null;
};

/**
 * Extrae el nombre de una columna faltante de cualquier mensaje o detalle de error de PostgREST / Postgres.
 */
function extractMissingColumn(error) {
  if (!error) return null;
  const fullText = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`;

  // PostgREST PGRST204: Could not find the 'frequency' column of 'incomes' in the schema cache
  const m1 = fullText.match(/Could not find the '([^']+)' column/i);
  if (m1) return m1[1];

  const m2 = fullText.match(/Could not find the column '([^']+)'/i);
  if (m2) return m2[1];

  // PostgreSQL 42703: column "frequency" of relation "incomes" does not exist
  const m3 = fullText.match(/column ["']([^"']+)["'] of relation/i);
  if (m3) return m3[1];

  const m4 = fullText.match(/column ["']([^"']+)["'] does not exist/i);
  if (m4) return m4[1];

  const m5 = fullText.match(/Could not find the '([^']+)' field/i);
  if (m5) return m5[1];

  return null;
}

/**
 * Realiza un upsert tolerante a diferencias de esquema en Supabase:
 * 1. Filtra proactivamente columnas no presentes físicamente en la tabla usando el esquema OpenAPI.
 * 2. Si alguna columna falta o falla en PostgREST (PGRST204), la detecta y reintenta sin esa columna.
 * 3. Mantiene todos los datos en memoria para que la interfaz nunca pierda la información del usuario.
 */
async function resilientUpsert(client, tableName, payload) {
  let currentPayload = { ...payload };

  // 1. Filtrado preventivo mediante introspección OpenAPI
  if (knownTableColumns[tableName] && knownTableColumns[tableName].size > 0) {
    const allowed = knownTableColumns[tableName];
    for (const key of Object.keys(currentPayload)) {
      if (!allowed.has(key)) {
        delete currentPayload[key];
      }
    }
  }

  // 2. Filtrado preventivo de columnas que ya sabemos que no existen en esta sesión
  if (knownMissingColumns[tableName] && knownMissingColumns[tableName].size > 0) {
    knownMissingColumns[tableName].forEach(col => {
      delete currentPayload[col];
    });
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const { data, error } = await client.from(tableName).upsert([currentPayload]).select();
      
      if (!error) {
        const savedRow = (data && data[0]) ? data[0] : currentPayload;
        return { ...payload, ...savedRow };
      }

      // Detectar error de columna faltante en schema cache de PostgREST
      const missingCol = extractMissingColumn(error);
      if (missingCol && currentPayload[missingCol] !== undefined) {
        console.warn(`[Supabase Auto-Heal] Columna '${missingCol}' no existe en la tabla '${tableName}'. Guardando en base de datos sin esa columna...`);
        if (!knownMissingColumns[tableName]) knownMissingColumns[tableName] = new Set();
        knownMissingColumns[tableName].add(missingCol);
        delete currentPayload[missingCol];
        continue;
      }

      // Si falló por clave foránea (FK user_id inválido o temporal), reintentar sin user_id
      if (error.code === '23503' && currentPayload.user_id && !isValidUUID(currentPayload.user_id)) {
        console.warn(`[Supabase Auto-Heal] user_id '${currentPayload.user_id}' no es UUID de auth.users. Reintentando sin user_id...`);
        delete currentPayload.user_id;
        continue;
      }

      // Si falló por formato de UUID inválido (ej: "inc_...", "acc_...", "fix_...") en tabla con columna UUID
      if (error.code === '22P02' || error.message?.includes('invalid input syntax for type uuid')) {
        const match = error.message.match(/invalid input syntax for type uuid: "([^"]+)"/i);
        const badVal = match ? match[1] : null;
        let healed = false;
        if (badVal) {
          for (const [k, v] of Object.entries(currentPayload)) {
            if (v === badVal) {
              if (k === 'id') {
                currentPayload.id = generateUUID();
                healed = true;
                console.warn(`[Supabase Auto-Heal] Reemplazado ID no-UUID '${badVal}' por UUID estándar '${currentPayload.id}'`);
              } else {
                console.warn(`[Supabase Auto-Heal] Campo '${k}' contenía valor no-UUID '${badVal}'. Removido para compatibilidad.`);
                delete currentPayload[k];
                healed = true;
              }
            }
          }
        }
        if (!healed && currentPayload.id && !isValidUUID(currentPayload.id)) {
          currentPayload.id = generateUUID();
          healed = true;
        }
        if (healed) continue;
      }

      console.error(`Supabase save error en '${tableName}':`, error.message || error);
      throw error;
    } catch (err) {
      const missingCol = extractMissingColumn(err);
      if (missingCol && currentPayload[missingCol] !== undefined) {
        console.warn(`[Supabase Auto-Heal] Excepción por columna '${missingCol}' en '${tableName}'. Reintentando sin ella...`);
        if (!knownMissingColumns[tableName]) knownMissingColumns[tableName] = new Set();
        knownMissingColumns[tableName].add(missingCol);
        delete currentPayload[missingCol];
        continue;
      }
      if (err.code === '22P02' || err.message?.includes('invalid input syntax for type uuid')) {
        currentPayload.id = generateUUID();
        continue;
      }
      throw err;
    }
  }

  return { ...payload, ...currentPayload };
}

export const saveUserSettings = async (settings) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (settings.monthly_budget !== undefined) {
    inMemoryMonthlyBudget = parseFloat(settings.monthly_budget) || 1500;
  }
  if (settings.preferred_currency !== undefined) {
    inMemoryPreferredCurrency = settings.preferred_currency || 'PEN';
  }

  if (client && user) {
    try {
      const payload = {
        user_id: user.id,
        monthly_budget: inMemoryMonthlyBudget,
        preferred_currency: inMemoryPreferredCurrency,
        ...settings,
        updated_at: new Date().toISOString()
      };
      await resilientUpsert(client, 'user_settings', payload);
    } catch (e) {
      console.error('Supabase saveUserSettings error:', e);
    }
  }
};

export const getMonthlyBudget = () => inMemoryMonthlyBudget;

export const setMonthlyBudget = async (amount) => {
  inMemoryMonthlyBudget = parseFloat(amount) || 1500;
  await saveUserSettings({ monthly_budget: inMemoryMonthlyBudget });
};

export const getPreferredCurrency = () => inMemoryPreferredCurrency;

export const setPreferredCurrency = async (currency) => {
  inMemoryPreferredCurrency = currency || 'PEN';
  await saveUserSettings({ preferred_currency: inMemoryPreferredCurrency });
};

// ==============================================================================
// 1. CUENTAS BANCARIAS Y EFECTIVO (TABLA: accounts) - 100% SUPABASE
// ==============================================================================
export const DEFAULT_ACCOUNTS = [];

export const fetchAccounts = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return [];

  try {
    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchAccounts aviso:', error.message);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name || 'Cuenta',
      type: row.type || 'efectivo',
      bank: row.bank || null,
      currency: row.currency || 'PEN',
      initial_balance: parseFloat(row.initial_balance) || 0,
      current_balance: parseFloat(row.current_balance ?? row.initial_balance) || 0,
      is_operating: row.is_operating !== undefined ? Boolean(row.is_operating) : true,
      color: row.color || '#3b82f6',
      created_at: row.created_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Error fetching accounts from Supabase:', e);
    return [];
  }
};

export const saveAccount = async (account) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) {
    throw new Error('Debes estar conectado a Supabase e iniciar sesión para guardar cuentas en la base de datos.');
  }

  const accountId = (account.id && isValidUUID(account.id)) ? account.id : generateUUID();

  const cleanPayload = {
    id: accountId,
    user_id: user.id,
    name: account.name || 'Nueva Cuenta',
    type: account.type || 'efectivo',
    bank: account.bank || null,
    currency: account.currency || 'PEN',
    initial_balance: parseFloat(account.initial_balance) || 0,
    current_balance: parseFloat(account.current_balance ?? account.initial_balance) || 0,
    is_operating: Boolean(account.is_operating),
    color: account.color || '#3b82f6',
    created_at: account.created_at || new Date().toISOString()
  };

  return await resilientUpsert(client, 'accounts', cleanPayload);
};

export const deleteAccount = async (id) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return;
  try {
    const { error } = await client.from('accounts').delete().eq('id', id).eq('user_id', user.id);
    if (error) console.warn('Supabase deleteAccount aviso:', error.message);
  } catch (e) {
    console.warn('Supabase deleteAccount exception:', e);
  }
};

// ==============================================================================
// 2. SUELDOS E INGRESOS (TABLA: incomes) - 100% SUPABASE
// ==============================================================================
export const DEFAULT_INCOMES = [];

export const fetchIncomes = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return [];

  try {
    const { data, error } = await client
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchIncomes aviso:', error.message);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title || 'Ingreso',
      amount: parseFloat(row.amount) || 0,
      currency: row.currency || 'PEN',
      frequency: row.frequency || 'mensual',
      gross_salary: parseFloat(row.gross_salary ?? row.amount) || 0,
      regime: row.regime || (row.currency === 'USD' ? 'neto_directo' : 'planilla_general'),
      pension_system_id: row.pension_system_id || 'afp_integra',
      has_suspension_4ta: Boolean(row.has_suspension_4ta),
      created_at: row.created_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Error fetching incomes from Supabase:', e);
    return [];
  }
};

export const saveIncome = async (income) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) {
    throw new Error('Debes estar conectado a Supabase e iniciar sesión para guardar ingresos en la base de datos.');
  }

  const incomeId = (income.id && isValidUUID(income.id)) ? income.id : generateUUID();

  const cleanPayload = {
    id: incomeId,
    user_id: user.id,
    title: income.title || 'Ingreso',
    amount: parseFloat(income.amount) || 0,
    currency: income.currency || 'PEN',
    frequency: income.frequency || 'mensual',
    gross_salary: parseFloat(income.gross_salary || income.amount) || 0,
    regime: income.regime || 'planilla_general',
    pension_system_id: income.pension_system_id || 'afp_integra',
    has_suspension_4ta: Boolean(income.has_suspension_4ta),
    created_at: income.created_at || new Date().toISOString()
  };

  return await resilientUpsert(client, 'incomes', cleanPayload);
};

export const deleteIncome = async (id) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return;
  try {
    const { error } = await client.from('incomes').delete().eq('id', id).eq('user_id', user.id);
    if (error) console.warn('Supabase deleteIncome aviso:', error.message);
  } catch (e) {
    console.warn('Supabase deleteIncome exception:', e);
  }
};

// ==============================================================================
// 3. GASTOS FIJOS DEL MES (TABLA: fixed_expenses) - 100% SUPABASE
// ==============================================================================
export const DEFAULT_FIXED_EXPENSES = [];

export const fetchFixedExpenses = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return [];

  try {
    const { data, error } = await client
      .from('fixed_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('due_day', { ascending: true });

    if (error) {
      console.warn('Supabase fetchFixedExpenses aviso:', error.message);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title || 'Gasto Fijo',
      amount: parseFloat(row.amount) || 0,
      currency: row.currency || 'PEN',
      category: row.category || 'servicios',
      due_day: parseInt(row.due_day) || 1,
      is_paid: Boolean(row.is_paid),
      account_id: row.account_id || null,
      created_at: row.created_at || new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Error fetching fixed expenses from Supabase:', e);
    return [];
  }
};

export const saveFixedExpense = async (fixed) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) {
    throw new Error('Debes estar conectado a Supabase e iniciar sesión para guardar gastos fijos en la base de datos.');
  }

  const fixedId = (fixed.id && isValidUUID(fixed.id)) ? fixed.id : generateUUID();
  const linkedAccountId = (fixed.account_id && isValidUUID(fixed.account_id)) ? fixed.account_id : null;

  const cleanPayload = {
    id: fixedId,
    user_id: user.id,
    title: fixed.title || 'Gasto Fijo',
    amount: parseFloat(fixed.amount) || 0,
    currency: fixed.currency || 'PEN',
    category: fixed.category || 'servicios',
    due_day: parseInt(fixed.due_day) || 1,
    is_paid: Boolean(fixed.is_paid),
    account_id: linkedAccountId,
    created_at: fixed.created_at || new Date().toISOString()
  };

  return await resilientUpsert(client, 'fixed_expenses', cleanPayload);
};

export const deleteFixedExpense = async (id) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return;
  try {
    const { error } = await client.from('fixed_expenses').delete().eq('id', id).eq('user_id', user.id);
    if (error) console.warn('Supabase deleteFixedExpense aviso:', error.message);
  } catch (e) {
    console.warn('Supabase deleteFixedExpense exception:', e);
  }
};

// ==============================================================================
// 4. GASTOS GENERALES Y HORMIGA (TABLA: expenses) - 100% SUPABASE
// ==============================================================================
export const fetchExpenses = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return [];

  try {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetchExpenses aviso:', error.message);
      return [];
    }
    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      amount: parseFloat(row.amount) || 0,
      currency: row.currency || inMemoryPreferredCurrency || 'PEN',
      category: row.category || 'gastos-hormiga',
      description: row.description || '',
      is_ant_expense: Boolean(row.is_ant_expense),
      payment_method: row.payment_method || null,
      account_id: row.account_id || null,
      bank: row.bank || null,
      place: row.place || null,
      is_historical_already_billed: Boolean(row.is_historical_already_billed),
      date: row.date || row.created_at || new Date().toISOString(),
      created_at: row.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Supabase fetchExpenses exception:', err);
    return [];
  }
};

export const saveExpense = async (expense) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) {
    throw new Error('Debes iniciar sesión con Supabase para registrar gastos en la base de datos.');
  }

  const expenseId = (expense.id && isValidUUID(expense.id)) ? expense.id : generateUUID();
  const rawDate = expense.date ? new Date(expense.date) : new Date();
  const validDateIso = (rawDate instanceof Date && !isNaN(rawDate.getTime()))
    ? rawDate.toISOString()
    : new Date().toISOString();

  const cleanPayload = {
    id: expenseId,
    user_id: user.id,
    amount: parseFloat(expense.amount) || 0,
    currency: expense.currency || inMemoryPreferredCurrency || 'PEN',
    category: expense.category || 'gastos-hormiga',
    description: expense.description || '',
    is_ant_expense: Boolean(expense.is_ant_expense),
    payment_method: expense.payment_method || null,
    account_id: (expense.account_id && isValidUUID(expense.account_id)) ? expense.account_id : null,
    bank: expense.bank || null,
    place: expense.place || null,
    is_historical_already_billed: Boolean(expense.is_historical_already_billed),
    date: validDateIso,
    created_at: expense.created_at || new Date().toISOString()
  };

  const saved = await resilientUpsert(client, 'expenses', cleanPayload);
  return { expense: saved, cloudError: null, isCloudEnabled: true };
};

export const updateExpense = async (id, updatedFields) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) {
    throw new Error('Debes iniciar sesión para actualizar gastos.');
  }

  let currentFields = { ...updatedFields };

  // Pre-filtrar columnas si se conocen de antemano
  if (knownTableColumns['expenses'] && knownTableColumns['expenses'].size > 0) {
    for (const key of Object.keys(currentFields)) {
      if (!knownTableColumns['expenses'].has(key)) {
        delete currentFields[key];
      }
    }
  }

  if (knownMissingColumns['expenses'] && knownMissingColumns['expenses'].size > 0) {
    knownMissingColumns['expenses'].forEach(col => {
      delete currentFields[col];
    });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await client
      .from('expenses')
      .update(currentFields)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (!error) {
      return { expense: (data && data[0]) ? data[0] : { id, ...updatedFields }, cloudError: null };
    }

    const missingCol = extractMissingColumn(error);
    if (missingCol && currentFields[missingCol] !== undefined) {
      if (!knownMissingColumns['expenses']) knownMissingColumns['expenses'] = new Set();
      knownMissingColumns['expenses'].add(missingCol);
      delete currentFields[missingCol];
      continue;
    }
    console.warn('Supabase updateExpense aviso:', error.message);
    break;
  }
  return { expense: { id, ...updatedFields }, cloudError: null };
};

export const deleteExpense = async (id) => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return;
  try {
    const { error } = await client.from('expenses').delete().eq('id', id).eq('user_id', user.id);
    if (error) console.warn('Supabase deleteExpense aviso:', error.message);
  } catch (e) {
    console.warn('Supabase deleteExpense exception:', e);
  }
};

// ==============================================================================
// 5. TARJETA DE CRÉDITO & DEUDAS FACTURADAS (TABLA: credit_card_configs) - 100% SUPABASE
// ==============================================================================
export const DEFAULT_TC_CONFIG = {
  name: 'Tarjeta de Crédito Principal',
  bank: 'BCP',
  closingDay: 20, // Día de corte
  dueDay: 5,     // Día de pago
  billedDebtPEN: 0,
  billedDebtUSD: 0,
  paymentAccountPEN: '',
  paymentAccountUSD: '',
  isBilledPaidThisMonth: false
};

let inMemoryTcConfig = { ...DEFAULT_TC_CONFIG };

export const getCachedCreditCardConfig = () => inMemoryTcConfig;

export const fetchCreditCardConfig = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return inMemoryTcConfig;

  try {
    const { data, error } = await client
      .from('credit_card_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const mapped = {
        name: data.name || DEFAULT_TC_CONFIG.name,
        bank: data.bank || DEFAULT_TC_CONFIG.bank,
        closingDay: data.closing_day ?? DEFAULT_TC_CONFIG.closingDay,
        dueDay: data.due_day ?? DEFAULT_TC_CONFIG.dueDay,
        billedDebtPEN: parseFloat(data.billed_debt_pen) || 0,
        billedDebtUSD: parseFloat(data.billed_debt_usd) || 0,
        paymentAccountPEN: data.payment_account_pen || '',
        paymentAccountUSD: data.payment_account_usd || '',
        isBilledPaidThisMonth: Boolean(data.is_billed_paid_this_month)
      };
      inMemoryTcConfig = mapped;
      return mapped;
    }
  } catch (e) {
    console.error('Supabase fetchCreditCardConfig exception:', e);
  }
  return inMemoryTcConfig;
};

export const saveCreditCardConfig = async (config) => {
  const updated = { ...DEFAULT_TC_CONFIG, ...inMemoryTcConfig, ...config };
  inMemoryTcConfig = updated;

  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      const configId = (config.id && isValidUUID(config.id)) ? config.id : (isValidUUID(user.id) ? user.id : generateUUID());
      const payload = {
        id: configId,
        user_id: user.id,
        name: updated.name,
        bank: updated.bank,
        closing_day: parseInt(updated.closingDay) || 20,
        due_day: parseInt(updated.dueDay) || 5,
        billed_debt_pen: parseFloat(updated.billedDebtPEN) || 0,
        billed_debt_usd: parseFloat(updated.billedDebtUSD) || 0,
        payment_account_pen: (updated.paymentAccountPEN && isValidUUID(updated.paymentAccountPEN)) ? updated.paymentAccountPEN : null,
        payment_account_usd: (updated.paymentAccountUSD && isValidUUID(updated.paymentAccountUSD)) ? updated.paymentAccountUSD : null,
        is_billed_paid_this_month: Boolean(updated.isBilledPaidThisMonth),
        updated_at: new Date().toISOString()
      };
      await resilientUpsert(client, 'credit_card_configs', payload);
    } catch (err) {
      console.error('Error saving credit_card_configs to Supabase:', err);
      throw err;
    }
  }
  return updated;
};

// ==============================================================================
// 6. PLAN DE AHORRO MENSUAL PROGRAMADO (TABLA: savings_goals) - 100% SUPABASE
// ==============================================================================
export const DEFAULT_SAVINGS_GOAL = {
  amountPEN: 0,
  amountUSD: 0,
  sourceIncomeId: '',
  destinationAccountId: '',
  isTransferredThisMonth: false
};

let inMemorySavingsGoal = { ...DEFAULT_SAVINGS_GOAL };

export const getCachedMonthlySavingsGoal = () => inMemorySavingsGoal;

export const fetchMonthlySavingsGoal = async () => {
  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (!client || !user) return inMemorySavingsGoal;

  try {
    const { data, error } = await client
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const mapped = {
        amountPEN: parseFloat(data.amount_pen) || 0,
        amountUSD: parseFloat(data.amount_usd) || 0,
        sourceIncomeId: data.source_income_id || '',
        destinationAccountId: data.destination_account_id || '',
        isTransferredThisMonth: Boolean(data.is_transferred_this_month)
      };
      inMemorySavingsGoal = mapped;
      return mapped;
    }
  } catch (e) {
    console.error('Supabase fetchMonthlySavingsGoal exception:', e);
  }
  return inMemorySavingsGoal;
};

export const saveMonthlySavingsGoal = async (goal) => {
  const updated = { ...DEFAULT_SAVINGS_GOAL, ...inMemorySavingsGoal, ...goal };
  inMemorySavingsGoal = updated;

  const client = getSupabaseClient();
  const user = await getCurrentUser();
  if (client && user) {
    try {
      const goalId = (goal.id && isValidUUID(goal.id)) ? goal.id : (isValidUUID(user.id) ? user.id : generateUUID());
      const payload = {
        id: goalId,
        user_id: user.id,
        amount_pen: parseFloat(updated.amountPEN) || 0,
        amount_usd: parseFloat(updated.amountUSD) || 0,
        source_income_id: (updated.sourceIncomeId && isValidUUID(updated.sourceIncomeId)) ? updated.sourceIncomeId : null,
        destination_account_id: (updated.destinationAccountId && isValidUUID(updated.destinationAccountId)) ? updated.destinationAccountId : null,
        is_transferred_this_month: Boolean(updated.isTransferredThisMonth),
        updated_at: new Date().toISOString()
      };
      await resilientUpsert(client, 'savings_goals', payload);
    } catch (err) {
      console.error('Error saving savings_goals to Supabase:', err);
      throw err;
    }
  }
  return updated;
};
