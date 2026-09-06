import React from 'react';
import { PiggyBank, Cloud, CloudOff, PlusCircle, LayoutDashboard, ListFilter, Settings, ArrowRightLeft, RefreshCw } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  cloudEnabled,
  onOpenCloudConfig,
  monthlyBudget,
  currentCurrency,
  onCurrencyChange,
  exchangeRate,
  onRefreshExchangeRate
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
              background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              flexShrink: 0
            }}>
              <PiggyBank size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', lineHeight: '1.1' }}>
                Control<span style={{ color: 'var(--primary)' }}>Ahorro</span>
              </h1>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Gastos Diarios & Hormiga 🐜
              </p>
            </div>
          </div>

          {/* Cloud button (on mobile fits nicely on the top right) */}
          <button
            onClick={onOpenCloudConfig}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              borderColor: cloudEnabled ? 'var(--success)' : 'var(--border-color)',
              flexShrink: 0
            }}
            title="Configurar sincronización en la nube (Supabase)"
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
