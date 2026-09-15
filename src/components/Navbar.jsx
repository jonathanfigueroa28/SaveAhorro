import React from 'react';
import { Bug, Cloud, CloudOff, PlusCircle, LayoutDashboard, ListFilter, Settings, ArrowRightLeft, RefreshCw, Wallet, User, LogIn, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  cloudEnabled,
  onOpenCloudConfig,
  monthlyBudget,
  currentCurrency,
  onCurrencyChange,
  exchangeRate,
  onRefreshExchangeRate,
  userProfile,
  onOpenProfileModal,
  onOpenTutorial,
  onShowLanding,
  onLogout
}) {
  const rawFirst = userProfile?.firstName || 'Jonathan';
  const cleanFirst = (rawFirst.includes('.') || rawFirst.includes('@'))
    ? (rawFirst.split(/[.@]/)[0].charAt(0).toUpperCase() + rawFirst.split(/[.@]/)[0].slice(1))
    : rawFirst;

  return (
    <header style={{ marginBottom: '1.25rem' }}>
      <div className="header-bar">
        {/* Top Row / Brand */}
        <div className="header-top-row">
          <div className="header-brand">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, var(--primary) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              flexShrink: 0
            }}>
              <Bug size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', lineHeight: '1.1', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}>
                <span>Save<span style={{ color: 'var(--primary)' }}>Ahorro</span></span>
              </h1>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                Gastos Hormiga & Liquidez Real
              </p>
            </div>
          </div>

          {/* Quick User Greeting & Action Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {/* Friendly Greeting & Name editor with Logout */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#f1f5f9',
              border: '1px solid var(--border-color)',
              padding: '0.2rem 0.45rem',
              borderRadius: 'var(--radius-full)'
            }}>
              <button
                onClick={onOpenProfileModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  padding: '0.15rem 0.35rem'
                }}
                title="Haz clic para editar tu nombre y apellidos"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {cleanFirst.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Hola, {cleanFirst}
                </span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    background: 'var(--danger-light)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    padding: 0,
                    transition: 'all 0.2s ease'
                  }}
                  title="Cerrar sesión / Salir a la portada"
                  aria-label="Cerrar sesión"
                >
                  <LogOut size={14} color="var(--danger)" />
                </button>
              )}
            </div>

            {/* Tutorial Button */}
            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Ver el tutorial guiado de 3 pasos"
              >
                <Sparkles size={14} color="var(--accent-ant)" />
                <span className="hide-mobile">Tutorial</span>
              </button>
            )}

            {/* Landing / Demo toggle button */}
            {onShowLanding && (
              <button
                onClick={onShowLanding}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Ver presentación y demos interactivas"
              >
                <span>Demos</span>
              </button>
            )}

            {/* Cloud config button */}
            <button
              onClick={onOpenCloudConfig}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                borderColor: cloudEnabled ? 'var(--success)' : 'var(--border-color)',
                flexShrink: 0
              }}
              title="Configurar conexión con Supabase"
            >
              {cloudEnabled ? (
                <Cloud size={16} color="var(--success)" />
              ) : (
                <CloudOff size={16} color="var(--text-muted)" />
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Nube
              </span>
            </button>
          </div>
        </div>

        {/* Currency Switcher & Live Exchange Rate Row */}
        <div className="header-actions">
          <div className="currency-toggle-group">
            <button
              onClick={() => onCurrencyChange && onCurrencyChange('PEN')}
              className={`currency-btn ${currentCurrency === 'PEN' ? 'soles-active' : 'inactive'}`}
              title="Moneda principal: Soles peruanos (PEN)"
            >
              <span>🇵🇪</span>
              <span>S/ Soles</span>
            </button>
            <button
              onClick={() => onCurrencyChange && onCurrencyChange('USD')}
              className={`currency-btn ${currentCurrency === 'USD' ? 'usd-active' : 'inactive'}`}
              title="Moneda principal: Dólares americanos (USD)"
            >
              <span>💵</span>
              <span>$ Dólares</span>
            </button>
          </div>

          {/* Live Google/Market Exchange Rate Badge */}
          {exchangeRate && (
            <div
              className="header-exchange-badge"
              title="Tasa de cambio Google / Mercado en tiempo real (Clic para refrescar)"
              onClick={onRefreshExchangeRate}
              style={{ cursor: 'pointer' }}
            >
              <ArrowRightLeft size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TC:</span>
              <strong style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>S/ {exchangeRate.toFixed(3)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Desktop) */}
      <div className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <PlusCircle size={18} />
          <span>+ Registrar Gasto</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'liquidity' ? 'active' : ''}`}
          onClick={() => setActiveTab('liquidity')}
        >
          <Wallet size={18} />
          <span>Cuentas & Ahorro</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard & Gráficas</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <ListFilter size={18} />
          <span>Historial de Gastos</span>
        </button>
      </div>
    </header>
  );
}
