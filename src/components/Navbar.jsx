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
              <h1 style={{ fontSize: '1.3rem', lineHeight: '1.1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>Save<span style={{ color: 'var(--primary)' }}>Ahorro</span></span>
                <span style={{ fontSize: '1.1rem' }}>🐜</span>
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Gastos Hormiga & Liquidez Real
              </p>
            </div>
          </div>

          {/* User Profile & Cloud status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {/* Friendly Greeting & Name editor with Logout */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.28)',
              borderRadius: 'var(--radius-md)',
              padding: '0.2rem 0.4rem',
              gap: '0.25rem'
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
                  color: '#fff',
                  padding: '0.15rem 0.35rem'
                }}
                title="Haz clic para editar tu nombre y apellidos"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : 'J'}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e0e7ff' }}>
                  Hola, {userProfile?.firstName || 'Jonathan'} 👋
                </span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: '6px',
                    color: '#fca5a5',
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
                  <LogOut size={14} color="#fca5a5" />
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
                <Sparkles size={14} color="#f59e0b" />
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
                <span>🎭 Demos</span>
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
                {cloudEnabled ? 'Nube 🟢' : 'Nube'}
              </span>
            </button>
          </div>
        </div>

        {/* Currency Switcher & Live Exchange Rate Row */}
        <div className="header-actions">
          <div className="currency-toggle-group">
            <button
              onClick={() => onCurrencyChange && onCurrencyChange('PEN')}
              className="currency-btn"
              style={{
                background: currentCurrency === 'PEN' ? 'var(--primary)' : 'transparent',
                color: currentCurrency === 'PEN' ? '#fff' : 'var(--text-muted)'
              }}
              title="Moneda principal: Soles peruanos (PEN)"
            >
              🇵🇪 Soles (S/)
            </button>
            <button
              onClick={() => onCurrencyChange && onCurrencyChange('USD')}
              className="currency-btn"
              style={{
                background: currentCurrency === 'USD' ? 'var(--primary)' : 'transparent',
                color: currentCurrency === 'USD' ? '#fff' : 'var(--text-muted)'
              }}
              title="Moneda principal: Dólares americanos (USD)"
            >
              💵 Dólares ($)
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
              <strong style={{ fontSize: '0.8rem', color: '#e0e7ff' }}>S/ {exchangeRate.toFixed(3)}</strong>
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
