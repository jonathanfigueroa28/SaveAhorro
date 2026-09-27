import React, { useState } from 'react';
import { getCloudConfig, saveCloudConfig, resetSupabaseClient } from '../lib/supabaseClient';
import { Cloud, Check, Copy, ExternalLink, X, ShieldCheck, Database, Rocket } from 'lucide-react';

export default function CloudConfigModal({ isOpen, onClose, onConfigSaved }) {
  const currentConfig = getCloudConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.supabaseAnonKey || '');
  const [isEnabled, setIsEnabled] = useState(currentConfig.isEnabled || false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeSqlTab, setActiveSqlTab] = useState('patch'); // 'patch' or 'full'

  if (!isOpen) return null;

  const sqlScript = `-- =========================================================
-- SAVEAHORRO 🐜: MIGRACIÓN COMPLETA MULTIUSUARIO Y MULTITABLA
-- Copia y pega todo este bloque en el SQL Editor de Supabase y presiona "RUN"
-- =========================================================

-- 1. TABLA DE GASTOS (EXPENSES)
create table if not exists public.expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  amount numeric not null,
  currency text default 'PEN',
  category text not null,
  description text,
  is_ant_expense boolean default false,
  payment_method text,
  account_id text,
  bank text,
  place text,
  is_historical_already_billed boolean default false,
  date timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.expenses add column if not exists amount numeric default 0;
alter table public.expenses add column if not exists currency text default 'PEN';
alter table public.expenses add column if not exists category text default 'gastos-hormiga';
alter table public.expenses add column if not exists description text;
alter table public.expenses add column if not exists is_ant_expense boolean default false;
alter table public.expenses add column if not exists payment_method text;
alter table public.expenses add column if not exists account_id text;
alter table public.expenses add column if not exists bank text;
alter table public.expenses add column if not exists place text;
alter table public.expenses add column if not exists is_historical_already_billed boolean default false;
alter table public.expenses add column if not exists date timestamptz default now();
alter table public.expenses add column if not exists created_at timestamptz default now();

-- 2. TABLA DE CUENTAS BANCARIAS Y EFECTIVO (ACCOUNTS)
create table if not exists public.accounts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null,
  bank text,
  currency text default 'PEN',
  initial_balance numeric default 0,
  current_balance numeric default 0,
  is_operating boolean default true,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

alter table public.accounts add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.accounts add column if not exists name text;
alter table public.accounts add column if not exists type text;
alter table public.accounts add column if not exists bank text;
alter table public.accounts add column if not exists currency text default 'PEN';
alter table public.accounts add column if not exists initial_balance numeric default 0;
alter table public.accounts add column if not exists current_balance numeric default 0;
alter table public.accounts add column if not exists is_operating boolean default true;
alter table public.accounts add column if not exists color text default '#3b82f6';
alter table public.accounts add column if not exists created_at timestamptz default now();

-- 3. TABLA DE SUELDOS E INGRESOS (INCOMES) CON MOTOR DE PLANILLA PERUANA
create table if not exists public.incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  currency text default 'PEN',
  frequency text default 'mensual',
  gross_salary numeric default 0,
  regime text default 'planilla_general',
  pension_system_id text default 'afp_integra',
  has_suspension_4ta boolean default false,
  created_at timestamptz default now()
);

alter table public.incomes add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.incomes add column if not exists title text;
alter table public.incomes add column if not exists amount numeric default 0;
alter table public.incomes add column if not exists currency text default 'PEN';
alter table public.incomes add column if not exists frequency text default 'mensual';
alter table public.incomes add column if not exists gross_salary numeric default 0;
alter table public.incomes add column if not exists regime text default 'planilla_general';
alter table public.incomes add column if not exists pension_system_id text default 'afp_integra';
alter table public.incomes add column if not exists has_suspension_4ta boolean default false;
alter table public.incomes add column if not exists created_at timestamptz default now();

-- 4. TABLA DE GASTOS FIJOS DEL MES (FIXED_EXPENSES)
create table if not exists public.fixed_expenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  currency text default 'PEN',
  category text default 'servicios',
  due_day integer default 1,
  is_paid boolean default false,
  account_id text,
  created_at timestamptz default now()
);

alter table public.fixed_expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.fixed_expenses add column if not exists title text;
alter table public.fixed_expenses add column if not exists amount numeric default 0;
alter table public.fixed_expenses add column if not exists currency text default 'PEN';
alter table public.fixed_expenses add column if not exists category text default 'servicios';
alter table public.fixed_expenses add column if not exists due_day integer default 1;
alter table public.fixed_expenses add column if not exists is_paid boolean default false;
alter table public.fixed_expenses add column if not exists account_id text;
alter table public.fixed_expenses add column if not exists created_at timestamptz default now();

-- 5. TABLA DE CONFIGURACIÓN DE TARJETA DE CRÉDITO Y CICLO BANCARIO (CREDIT_CARD_CONFIGS)
create table if not exists public.credit_card_configs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text default 'Tarjeta de Crédito Principal',
  bank text default 'BCP',
  closing_day integer default 20,
  due_day integer default 5,
  billed_debt_pen numeric default 0,
  billed_debt_usd numeric default 0,
  payment_account_pen text,
  payment_account_usd text,
  is_billed_paid_this_month boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.credit_card_configs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.credit_card_configs add column if not exists name text default 'Tarjeta de Crédito Principal';
alter table public.credit_card_configs add column if not exists bank text default 'BCP';
alter table public.credit_card_configs add column if not exists closing_day integer default 20;
alter table public.credit_card_configs add column if not exists due_day integer default 5;
alter table public.credit_card_configs add column if not exists billed_debt_pen numeric default 0;
alter table public.credit_card_configs add column if not exists billed_debt_usd numeric default 0;
alter table public.credit_card_configs add column if not exists payment_account_pen text;
alter table public.credit_card_configs add column if not exists payment_account_usd text;
alter table public.credit_card_configs add column if not exists is_billed_paid_this_month boolean default false;
alter table public.credit_card_configs add column if not exists created_at timestamptz default now();
alter table public.credit_card_configs add column if not exists updated_at timestamptz default now();

-- 6. TABLA DE PLAN DE AHORRO MENSUAL PROGRAMADO (SAVINGS_GOALS)
create table if not exists public.savings_goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  amount_pen numeric default 0,
  amount_usd numeric default 0,
  source_income_id text,
  destination_account_id text,
  is_transferred_this_month boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.savings_goals add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.savings_goals add column if not exists amount_pen numeric default 0;
alter table public.savings_goals add column if not exists amount_usd numeric default 0;
alter table public.savings_goals add column if not exists source_income_id text;
alter table public.savings_goals add column if not exists destination_account_id text;
alter table public.savings_goals add column if not exists is_transferred_this_month boolean default false;
alter table public.savings_goals add column if not exists created_at timestamptz default now();
alter table public.savings_goals add column if not exists updated_at timestamptz default now();

-- 7. TABLA DE AJUSTES GENERALES DEL USUARIO (USER_SETTINGS)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  monthly_budget numeric default 1500,
  preferred_currency text default 'PEN',
  first_name text,
  last_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_settings add column if not exists monthly_budget numeric default 1500;
alter table public.user_settings add column if not exists preferred_currency text default 'PEN';
alter table public.user_settings add column if not exists first_name text;
alter table public.user_settings add column if not exists last_name text;
alter table public.user_settings add column if not exists created_at timestamptz default now();
alter table public.user_settings add column if not exists updated_at timestamptz default now();

-- PERMISOS Y SEGURIDAD ROW LEVEL SECURITY (RLS)
grant all on table public.expenses to anon, authenticated, service_role;
grant all on table public.accounts to anon, authenticated, service_role;
grant all on table public.incomes to anon, authenticated, service_role;
grant all on table public.fixed_expenses to anon, authenticated, service_role;
grant all on table public.credit_card_configs to anon, authenticated, service_role;
grant all on table public.savings_goals to anon, authenticated, service_role;
grant all on table public.user_settings to anon, authenticated, service_role;

alter table public.expenses enable row level security;
alter table public.accounts enable row level security;
alter table public.incomes enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.credit_card_configs enable row level security;
alter table public.savings_goals enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "User Expenses Policy" on public.expenses;
create policy "User Expenses Policy" on public.expenses for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Accounts Policy" on public.accounts;
create policy "User Accounts Policy" on public.accounts for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Incomes Policy" on public.incomes;
create policy "User Incomes Policy" on public.incomes for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Fixed Expenses Policy" on public.fixed_expenses;
create policy "User Fixed Expenses Policy" on public.fixed_expenses for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Credit Card Policy" on public.credit_card_configs;
create policy "User Credit Card Policy" on public.credit_card_configs for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Savings Goals Policy" on public.savings_goals;
create policy "User Savings Goals Policy" on public.savings_goals for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

drop policy if exists "User Settings Policy" on public.user_settings;
create policy "User Settings Policy" on public.user_settings for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);

-- RECARGAR CACHÉ DE ESQUEMA EN POSTGREST (SUPABASE)
notify pgrst, 'reload schema';`;

  const patchSqlScript = `-- =========================================================
-- SAVEAHORRO 🐜: FIX RÁPIDO DE COLUMNAS (EJECUTAR EN SUPABASE SQL EDITOR)
-- Agrega columnas faltantes como 'frequency' sin borrar tus datos existentes
-- =========================================================

-- 1. GASTOS (EXPENSES)
alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.expenses add column if not exists amount numeric default 0;
alter table public.expenses add column if not exists currency text default 'PEN';
alter table public.expenses add column if not exists category text default 'gastos-hormiga';
alter table public.expenses add column if not exists description text;
alter table public.expenses add column if not exists is_ant_expense boolean default false;
alter table public.expenses add column if not exists payment_method text;
alter table public.expenses add column if not exists account_id text;
alter table public.expenses add column if not exists bank text;
alter table public.expenses add column if not exists place text;
alter table public.expenses add column if not exists is_historical_already_billed boolean default false;
alter table public.expenses add column if not exists date timestamptz default now();
alter table public.expenses add column if not exists created_at timestamptz default now();

-- 2. CUENTAS BANCARIAS Y EFECTIVO (ACCOUNTS)
alter table public.accounts add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.accounts add column if not exists name text;
alter table public.accounts add column if not exists type text;
alter table public.accounts add column if not exists bank text;
alter table public.accounts add column if not exists currency text default 'PEN';
alter table public.accounts add column if not exists initial_balance numeric default 0;
alter table public.accounts add column if not exists current_balance numeric default 0;
alter table public.accounts add column if not exists is_operating boolean default true;
alter table public.accounts add column if not exists color text default '#3b82f6';
alter table public.accounts add column if not exists created_at timestamptz default now();

-- 3. SUELDOS E INGRESOS (INCOMES) - FIX FREQUENCY & PLANILLA
alter table public.incomes add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.incomes add column if not exists title text;
alter table public.incomes add column if not exists amount numeric default 0;
alter table public.incomes add column if not exists currency text default 'PEN';
alter table public.incomes add column if not exists frequency text default 'mensual';
alter table public.incomes add column if not exists gross_salary numeric default 0;
alter table public.incomes add column if not exists regime text default 'planilla_general';
alter table public.incomes add column if not exists pension_system_id text default 'afp_integra';
alter table public.incomes add column if not exists has_suspension_4ta boolean default false;
alter table public.incomes add column if not exists created_at timestamptz default now();

-- 4. GASTOS FIJOS (FIXED_EXPENSES)
alter table public.fixed_expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.fixed_expenses add column if not exists title text;
alter table public.fixed_expenses add column if not exists amount numeric default 0;
alter table public.fixed_expenses add column if not exists currency text default 'PEN';
alter table public.fixed_expenses add column if not exists category text default 'servicios';
alter table public.fixed_expenses add column if not exists due_day integer default 1;
alter table public.fixed_expenses add column if not exists is_paid boolean default false;
alter table public.fixed_expenses add column if not exists account_id text;
alter table public.fixed_expenses add column if not exists created_at timestamptz default now();

-- 5. TARJETA DE CRÉDITO (CREDIT_CARD_CONFIGS)
alter table public.credit_card_configs add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.credit_card_configs add column if not exists name text default 'Tarjeta de Crédito Principal';
alter table public.credit_card_configs add column if not exists bank text default 'BCP';
alter table public.credit_card_configs add column if not exists closing_day integer default 20;
alter table public.credit_card_configs add column if not exists due_day integer default 5;
alter table public.credit_card_configs add column if not exists billed_debt_pen numeric default 0;
alter table public.credit_card_configs add column if not exists billed_debt_usd numeric default 0;
alter table public.credit_card_configs add column if not exists payment_account_pen text;
alter table public.credit_card_configs add column if not exists payment_account_usd text;
alter table public.credit_card_configs add column if not exists is_billed_paid_this_month boolean default false;
alter table public.credit_card_configs add column if not exists created_at timestamptz default now();
alter table public.credit_card_configs add column if not exists updated_at timestamptz default now();

-- 6. AHORRO PROGRAMADO (SAVINGS_GOALS)
alter table public.savings_goals add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.savings_goals add column if not exists amount_pen numeric default 0;
alter table public.savings_goals add column if not exists amount_usd numeric default 0;
alter table public.savings_goals add column if not exists source_income_id text;
alter table public.savings_goals add column if not exists destination_account_id text;
alter table public.savings_goals add column if not exists is_transferred_this_month boolean default false;
alter table public.savings_goals add column if not exists created_at timestamptz default now();
alter table public.savings_goals add column if not exists updated_at timestamptz default now();

-- 7. AJUSTES (USER_SETTINGS)
alter table public.user_settings add column if not exists monthly_budget numeric default 1500;
alter table public.user_settings add column if not exists preferred_currency text default 'PEN';
alter table public.user_settings add column if not exists first_name text;
alter table public.user_settings add column if not exists last_name text;
alter table public.user_settings add column if not exists created_at timestamptz default now();
alter table public.user_settings add column if not exists updated_at timestamptz default now();

-- 8. RECARGAR CACHÉ DE ESQUEMA EN POSTGREST (OBLIGATORIO)
notify pgrst, 'reload schema';`;

  const handleCopySql = (scriptToCopy) => {
    navigator.clipboard.writeText(scriptToCopy || (activeSqlTab === 'patch' ? patchSqlScript : sqlScript));
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveCloudConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      isEnabled: isEnabled
    });
    resetSupabaseClient();
    onConfigSaved();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
            <Database size={24} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Conectar Base de Datos Nube (Supabase)</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Guarda tus gastos online para acceder desde tu celular y laptop gratis de por vida.
            </p>
          </div>
        </div>

        {/* Step by step guide */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ color: '#a5b4fc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} /> Guía de configuración y actualización en Supabase:
          </h4>
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
            <li>
              Abre tu proyecto en <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Supabase.com <ExternalLink size={12} /></a>.
            </li>
            <li>
              Ve al <strong>SQL Editor</strong>, pega el código según tu necesidad y presiona <strong>Run</strong>:
            </li>
          </ol>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveSqlTab('patch')}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: activeSqlTab === 'patch' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeSqlTab === 'patch' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: activeSqlTab === 'patch' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ⚡ Actualizar Columnas (Fix error 'frequency')
            </button>
            <button
              type="button"
              onClick={() => setActiveSqlTab('full')}
              style={{
                flex: 1,
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: activeSqlTab === 'full' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: activeSqlTab === 'full' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: activeSqlTab === 'full' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📦 Esquema Completo Nuevo
            </button>
          </div>

          {/* Code block with copy button */}
          <div style={{ position: 'relative', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <pre style={{
              background: '#0b0f19',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: '#818cf8',
              maxHeight: '180px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)'
            }}>
              {activeSqlTab === 'patch' ? patchSqlScript : sqlScript}
            </pre>
            <button
              type="button"
              onClick={() => handleCopySql(activeSqlTab === 'patch' ? patchSqlScript : sqlScript)}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(4px)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {copiedSql ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              <span>{copiedSql ? '¡Copiado!' : (activeSqlTab === 'patch' ? 'Copiar Fix SQL' : 'Copiar Todo')}</span>
            </button>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            3. Ve a <strong>Project Settings → API</strong> y copia tu <code>URL</code> y tu <code>anon public key</code>.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Project URL (Supabase)</label>
            <input
              type="url"
              placeholder="https://xxxxxxxxxxxxxx.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">API Key Pública (anon key)</label>
            <input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <input
              type="checkbox"
              id="enableCloud"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="enableCloud" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
              Activar sincronización con Supabase en este dispositivo
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Configuración
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
