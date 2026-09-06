import React, { useState } from 'react';
import { getCloudConfig, saveCloudConfig, resetSupabaseClient } from '../lib/supabaseClient';
import { Cloud, Check, Copy, ExternalLink, X, ShieldCheck, Database, Rocket } from 'lucide-react';

export default function CloudConfigModal({ isOpen, onClose, onConfigSaved }) {
  const currentConfig = getCloudConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.supabaseAnonKey || '');
  const [isEnabled, setIsEnabled] = useState(currentConfig.isEnabled || false);
  const [copiedSql, setCopiedSql] = useState(false);

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
  date timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.expenses add column if not exists currency text default 'PEN';
alter table public.expenses add column if not exists payment_method text;
alter table public.expenses add column if not exists account_id text;
alter table public.expenses add column if not exists bank text;
alter table public.expenses add column if not exists place text;

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

-- 3. TABLA DE MÚLTIPLES SUELDOS E INGRESOS (INCOMES)
create table if not exists public.incomes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  amount numeric not null default 0,
  currency text default 'PEN',
  frequency text default 'mensual',
  created_at timestamptz default now()
);

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

-- 5. TABLA DE DEUDAS Y TARJETAS (DEBTS)
create table if not exists public.debts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  type text default 'tarjeta_credito',
  total_debt numeric default 0,
  currency text default 'PEN',
  due_date text,
  created_at timestamptz default now()
);

-- PERMISOS Y SEGURIDAD ROW LEVEL SECURITY (RLS)
grant all on table public.expenses to anon, authenticated, service_role;
grant all on table public.accounts to anon, authenticated, service_role;
grant all on table public.incomes to anon, authenticated, service_role;
grant all on table public.fixed_expenses to anon, authenticated, service_role;
grant all on table public.debts to anon, authenticated, service_role;

alter table public.expenses enable row level security;
alter table public.accounts enable row level security;
alter table public.incomes enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.debts enable row level security;

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

drop policy if exists "User Debts Policy" on public.debts;
create policy "User Debts Policy" on public.debts for all to public
using (auth.uid() = user_id or auth.uid() is null or user_id is null)
with check (auth.uid() = user_id or auth.uid() is null or user_id is null);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
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
            <ShieldCheck size={16} /> Guía rápida de configuración (3 minutos):
          </h4>
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            <li>
              Crea un proyecto gratis en <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Supabase.com <ExternalLink size={12} /></a>.
            </li>
            <li>
              Ve al <strong>SQL Editor</strong> en Supabase y ejecuta este código SQL para crear tu tabla de gastos:
            </li>
          </ol>

          {/* Code block with copy button */}
          <div style={{ position: 'relative', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <pre style={{
              background: '#0b0f19',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: '#818cf8',
              overflowX: 'auto',
              border: '1px solid var(--border-color)'
            }}>
              {sqlScript}
            </pre>
            <button
              type="button"
              onClick={handleCopySql}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {copiedSql ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
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
