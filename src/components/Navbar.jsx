import React from 'react';
import { PiggyBank, Cloud, CloudOff, PlusCircle, LayoutDashboard, ListFilter, Settings } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, cloudEnabled, onOpenCloudConfig, monthlyBudget }) {
  return (
    <header style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1rem'
      }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <PiggyBank size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', lineHeight: '1.1' }}>
              Control<span style={{ color: 'var(--primary)' }}>Ahorro</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Gastos Diarios & Hormiga 🐜
            </p>
          </div>
        </div>

        {/* Right Actions: Budget indicator & Cloud status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenCloudConfig}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.8rem',
              borderColor: cloudEnabled ? 'var(--success)' : 'var(--border-color)'
            }}
            title="Configurar sincronización en la nube (Supabase)"
          >
            {cloudEnabled ? (
              <>
                <Cloud size={16} color="var(--success)" />
                <span style={{ color: 'var(--success)', display: 'none' }}>Nube Activa</span>
              </>
            ) : (
              <>
                <CloudOff size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', display: 'none' }}>Sin Nube</span>
              </>
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {cloudEnabled ? 'Nube 🟢' : 'Conectar Nube'}
            </span>
          </button>
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
