import React, { useState, useMemo, useEffect } from 'react';
import {
  DEFAULT_CATEGORIES,
  formatMoney,
  formatLimaDate,
  PAYMENT_METHODS,
  PERU_BANKS,
  getLimaNowIso
} from '../lib/supabaseClient';
import {
  Search,
  Download,
  Trash2,
  Bug,
  Filter,
  Calendar,
  FileSpreadsheet,
  Edit3,
  X,
  Check,
  CreditCard,
  Building,
  MapPin,
  Clock,
  Layers,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';

export default function ExpenseList({
  expenses,
  onDeleteExpense,
  onUpdateExpense,
  categories = DEFAULT_CATEGORIES,
  currentCurrency = 'PEN',
  onCurrencyChange,
  exchangeRate = 3.75
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency || 'all');
  const [onlyAnt, setOnlyAnt] = useState(false);
  const [groupBy, setGroupBy] = useState('month'); // 'month', 'week', 'year', 'none'
  const [unifyToSoles, setUnifyToSoles] = useState(true); // Unificar USD -> PEN al TC Google/Mercado
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Sync currency filter if top currency changes
  useEffect(() => {
    if (currentCurrency && currentCurrency !== 'all') {
      setSelectedCurrency(currentCurrency);
    }
  }, [currentCurrency]);

  const handleCurrencyFilterChange = (cur) => {
    setSelectedCurrency(cur);
    if (onCurrencyChange && (cur === 'PEN' || cur === 'USD')) {
      onCurrencyChange(cur);
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Search term filter (includes description, category, bank, place, payment_method)
      const term = searchTerm.toLowerCase();
      const descMatch = (exp.description || '').toLowerCase().includes(term);
      const catMatch = (exp.category || '').toLowerCase().includes(term);
      const bankMatch = (exp.bank || '').toLowerCase().includes(term);
      const placeMatch = (exp.place || '').toLowerCase().includes(term);
      const methodMatch = (exp.payment_method || '').toLowerCase().includes(term);
      const matchesSearch = descMatch || catMatch || bankMatch || placeMatch || methodMatch;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;

      // Currency filter
      const expCurrency = exp.currency || 'PEN';
      const matchesCurrency = selectedCurrency === 'all' || expCurrency === selectedCurrency;

      // Ant filter
      const matchesAnt = !onlyAnt || (exp.is_ant_expense || exp.category === 'gastos-hormiga');

      return matchesSearch && matchesCategory && matchesCurrency && matchesAnt;
    });
  }, [expenses, searchTerm, selectedCategory, selectedCurrency, onlyAnt]);

  // Overall totals of filtered expenses
  const { totalFilteredPEN, totalFilteredUSD, totalFilteredUnified } = useMemo(() => {
    let pen = 0;
    let usd = 0;
    filteredExpenses.forEach(exp => {
      const amt = parseFloat(exp.amount) || 0;
      if (exp.currency === 'USD') {
        usd += amt;
      } else {
        pen += amt;
      }
    });
    return {
      totalFilteredPEN: pen,
      totalFilteredUSD: usd,
      totalFilteredUnified: pen + (usd * exchangeRate)
    };
  }, [filteredExpenses, exchangeRate]);

  // Grouping logic (Semanas, Meses, Años o Todos)
  const groupedData = useMemo(() => {
    // Sort all expenses newest to oldest
    const sorted = [...filteredExpenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (groupBy === 'none') {
      const pen = sorted.filter(e => (e.currency || 'PEN') === 'PEN').reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
      const usd = sorted.filter(e => e.currency === 'USD').reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
      return [{
        key: 'all',
        title: 'Todos los Registros',
        totalPEN: pen,
        totalUSD: usd,
        items: sorted
      }];
    }

    const groups = {};

    sorted.forEach(exp => {
      const d = new Date(exp.date);
      let groupKey = '';
      let groupTitle = '';

      if (groupBy === 'year') {
        groupKey = formatLimaDate(d, { year: 'numeric' });
        groupTitle = `Año ${groupKey}`;
      } else if (groupBy === 'week') {
        // Compute Monday of current week in Lima time
        const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
        const diffToMonday = (dayOfWeek + 6) % 7;
        const monday = new Date(d.getTime() - diffToMonday * 24 * 3600 * 1000);
        const sunday = new Date(monday.getTime() + 6 * 24 * 3600 * 1000);
        
        groupKey = monday.toISOString().slice(0, 10);
        groupTitle = `Semana: ${formatLimaDate(monday, { day: '2-digit', month: 'short' })} - ${formatLimaDate(sunday, { day: '2-digit', month: 'short', year: 'numeric' })}`;
      } else {
        // 'month' by default
        groupKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        const monthName = formatLimaDate(d, { month: 'long', year: 'numeric' });
        groupTitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          title: groupTitle,
          totalPEN: 0,
          totalUSD: 0,
          items: []
        };
      }

      const amt = parseFloat(exp.amount) || 0;
      if (exp.currency === 'USD') {
        groups[groupKey].totalUSD += amt;
      } else {
        groups[groupKey].totalPEN += amt;
      }
      groups[groupKey].items.push(exp);
    });

    return Object.values(groups);
  }, [filteredExpenses, groupBy]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['ID', 'Fecha (Lima UTC-5)', 'Moneda', 'Monto', 'Categoria', 'Es Gasto Hormiga', 'Metodo de Pago', 'Banco', 'Lugar', 'Descripcion'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      formatLimaDate(exp.date, { dateStyle: 'short', timeStyle: 'short' }),
      exp.currency || 'PEN',
      exp.amount.toFixed(2),
      categories.find(c => c.id === exp.category)?.name || exp.category,
      exp.is_ant_expense ? 'SI' : 'NO',
      exp.payment_method || 'No especificado',
      exp.bank || '',
      exp.place || '',
      `"${(exp.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `control_ahorro_gastos_lima_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: catId, color: '#64748b' };
  };

  const getPaymentMethodBadge = (methodId) => {
    const pm = PAYMENT_METHODS.find(m => m.id === methodId);
    if (!pm) return null;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.15rem 0.45rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: 'rgba(255, 255, 255, 0.08)',
        color: '#e2e8f0',
        border: '1px solid var(--border-color)',
        whiteSpace: 'nowrap'
      }}>
        {pm.name}
      </span>
    );
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingExpense || !onUpdateExpense) return;
    onUpdateExpense(editingExpense.id, {
      amount: parseFloat(editingExpense.amount),
      currency: editingExpense.currency || 'PEN',
      category: editingExpense.category,
      description: editingExpense.description,
      is_ant_expense: Boolean(editingExpense.is_ant_expense),
      payment_method: editingExpense.payment_method || null,
      bank: editingExpense.bank || null,
      place: editingExpense.place || null,
      date: new Date(editingExpense.date).toISOString()
    });
    setEditingExpense(null);
  };

  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    onDeleteExpense(expenseToDelete.id);
    setExpenseToDelete(null);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Header and Search Filters */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Historial de Gastos</span>
              <span className="badge badge-regular">{filteredExpenses.length} registros</span>
              {unifyToSoles ? (
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginLeft: '0.25rem' }}>
                  Total: {formatMoney(totalFilteredUnified, 'PEN')}
                </span>
              ) : (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                  S/ {totalFilteredPEN.toFixed(2)} | $ {totalFilteredUSD.toFixed(2)}
                </span>
              )}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Segmenta por semanas, meses o años y edita o elimina tus movimientos fácilmente.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '0.55rem 0.9rem', fontSize: '0.82rem' }}
            disabled={filteredExpenses.length === 0}
          >
            <FileSpreadsheet size={16} color="var(--success)" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Controls Row: Segmentation and Currency Unification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          
          {/* Segmentation Selector */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Layers size={14} color="var(--primary)" /> Segmentar por:
            </span>
            <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setGroupBy('month')}
                className={`chip ${groupBy === 'month' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                🗓️ Por Meses
              </button>
              <button
                onClick={() => setGroupBy('week')}
                className={`chip ${groupBy === 'week' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                📅 Por Semanas
              </button>
              <button
                onClick={() => setGroupBy('year')}
                className={`chip ${groupBy === 'year' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                📆 Por Años
              </button>
              <button
                onClick={() => setGroupBy('none')}
                className={`chip ${groupBy === 'none' ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                📋 Todo Consolidado
              </button>
            </div>
          </div>

          {/* Currency Unification Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ArrowRightLeft size={14} color="var(--primary)" /> Conversión:
            </span>
            <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setUnifyToSoles(true)}
                className={`chip ${unifyToSoles ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                🔄 Unificar todo a Soles (TC S/ {exchangeRate.toFixed(3)})
              </button>
              <button
                onClick={() => setUnifyToSoles(false)}
                className={`chip ${!unifyToSoles ? 'active' : ''}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                📊 Monedas Separadas
              </button>
            </div>
          </div>

        </div>

        {/* Filters Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar gasto, banco, lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem', padding: '0.65rem 0.65rem 0.65rem 2.5rem' }}
            />
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.85rem', padding: '0.65rem' }}
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Currency Dropdown Filter */}
          <div>
            <select
              value={selectedCurrency}
              onChange={(e) => handleCurrencyFilterChange(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.85rem', padding: '0.65rem' }}
            >
              <option value="all">Todas las Monedas</option>
              <option value="PEN">🇵🇪 Solo Soles (S/)</option>
              <option value="USD">💵 Solo Dólares ($)</option>
            </select>
          </div>

          {/* Toggle Only Ant Expenses */}
          <button
            className={`btn ${onlyAnt ? 'btn-ant' : 'btn-secondary'}`}
            onClick={() => setOnlyAnt(!onlyAnt)}
            style={{ fontSize: '0.82rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}
          >
            <Bug size={15} />
            <span>{onlyAnt ? 'Ver Todos' : 'Solo Hormiga 🐜'}</span>
          </button>

        </div>
      </div>

      {/* Segmented Expenses List */}
      {groupedData.length > 0 && filteredExpenses.length > 0 ? (
        groupedData.map(group => {
          const groupUnifiedPEN = group.totalPEN + (group.totalUSD * exchangeRate);

          return (
            <div key={group.key} className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
              
              {/* Group Header with Subtotals */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    {group.title}
                  </span>
                  <span className="badge badge-regular" style={{ fontSize: '0.7rem' }}>
                    {group.items.length} gastos
                  </span>
                </div>

                {/* Group Subtotals */}
                {unifyToSoles ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '0.92rem', fontWeight: 800 }}>
                      Subtotal: {formatMoney(groupUnifiedPEN, 'PEN')}
                    </span>
                    {group.totalUSD > 0 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        (S/ {group.totalPEN.toFixed(2)} + $ {group.totalUSD.toFixed(2)} a TC {exchangeRate.toFixed(3)})
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    {group.totalPEN > 0 && (
                      <span style={{ color: 'var(--primary)' }}>
                        Soles: {formatMoney(group.totalPEN, 'PEN')}
                      </span>
                    )}
                    {group.totalUSD > 0 && (
                      <span style={{ color: '#10b981' }}>
                        Dólares: {formatMoney(group.totalUSD, 'USD')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Expenses Table in this group */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Fecha</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Detalle / Categoría</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Método / Banco</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Monto</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map(exp => {
                      const catInfo = getCategoryInfo(exp.category);
                      const isAnt = exp.is_ant_expense || exp.category === 'gastos-hormiga';
                      
                      return (
                        <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                          
                          {/* Date Column */}
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>
                              {formatLimaDate(exp.date, { day: '2-digit', month: 'short' })}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {formatLimaDate(exp.date, { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </td>

                          {/* Description & Category Column */}
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <span>{exp.description || catInfo.name}</span>
                              {isAnt && (
                                <span className="badge badge-ant" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                                  🐜 Hormiga
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.7rem',
                                color: catInfo.color,
                                background: `${catInfo.color}15`,
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px'
                              }}>
                                {catInfo.name}
                              </span>
                              {exp.place && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <MapPin size={11} /> {exp.place}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payment Method & Bank */}
                          <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {getPaymentMethodBadge(exp.payment_method) || (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                              )}
                              {exp.bank && (
                                <span style={{ fontSize: '0.7rem', color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                  {exp.bank}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Amount Column */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '0.98rem', color: isAnt ? '#fef08a' : '#fff' }}>
                              {formatMoney(exp.amount, exp.currency || 'PEN')}
                            </div>
                            {unifyToSoles && exp.currency === 'USD' && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                                ~S/ {(parseFloat(exp.amount) * exchangeRate).toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Actions: Edit & Delete */}
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => setEditingExpense({
                                  ...exp,
                                  date: exp.date ? new Date(exp.date).toISOString().slice(0, 16) : getLimaNowIso()
                                })}
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-sm)' }}
                                title="Editar gasto"
                              >
                                <Edit3 size={14} color="var(--primary)" />
                              </button>
                              <button
                                onClick={() => setExpenseToDelete(exp)}
                                className="btn btn-danger"
                                style={{ padding: '0.35rem 0.55rem', borderRadius: 'var(--radius-sm)' }}
                                title="Eliminar gasto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No se encontraron gastos</p>
          <p style={{ fontSize: '0.85rem' }}>Prueba cambiando los filtros de búsqueda o registra un gasto nuevo.</p>
        </div>
      )}

      {/* MODAL DE EDICIÓN SENCILLA (AJUSTADO: ENCABEZADO Y BOTONES FIJOS SIEMPRE VISIBLES) */}
      {editingExpense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)'
          }}>
            
            {/* Encabezado Fijo del Modal */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.03)',
              flexShrink: 0
            }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
                <Edit3 size={18} color="var(--primary)" />
                <span>Editar Gasto</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Formulario con cuerpo scrollable */}
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                
                {/* Selector de Moneda tipo switch limpio */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Moneda del Gasto</label>
                  <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setEditingExpense({ ...editingExpense, currency: 'PEN' })}
                      className="currency-btn"
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        background: (editingExpense.currency || 'PEN') === 'PEN' ? 'var(--primary)' : 'transparent',
                        color: (editingExpense.currency || 'PEN') === 'PEN' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      🇵🇪 Soles (S/)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingExpense({ ...editingExpense, currency: 'USD' })}
                      className="currency-btn"
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        background: editingExpense.currency === 'USD' ? 'var(--primary)' : 'transparent',
                        color: editingExpense.currency === 'USD' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      💵 Dólares ($)
                    </button>
                  </div>
                </div>

                {/* Monto */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Monto</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: editingExpense.currency === 'USD' ? '#10b981' : 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {editingExpense.currency === 'USD' ? '$' : 'S/'}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editingExpense.amount}
                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                      className="form-input"
                      style={{ paddingLeft: '2.4rem', fontSize: '1.25rem', fontWeight: '700' }}
                      required
                    />
                  </div>
                </div>

                {/* Detalle / Descripción */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Detalle / Descripción</label>
                  <input
                    type="text"
                    value={editingExpense.description || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                    className="form-input"
                    placeholder="Ej: Almuerzo, Taxi, Café..."
                  />
                </div>

                {/* Categoría y Fecha */}
                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Categoría</label>
                    <select
                      value={editingExpense.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setEditingExpense({
                          ...editingExpense,
                          category: newCat,
                          is_ant_expense: newCat === 'gastos-hormiga'
                        });
                      }}
                      className="form-select"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Fecha y Hora (Lima)</label>
                    <input
                      type="datetime-local"
                      value={editingExpense.date}
                      onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Gasto Hormiga Checkbox con sincronización */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: editingExpense.is_ant_expense ? 'var(--accent-ant-light)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${editingExpense.is_ant_expense ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }} onClick={() => {
                  const nextChecked = !editingExpense.is_ant_expense;
                  setEditingExpense({
                    ...editingExpense,
                    is_ant_expense: nextChecked,
                    category: nextChecked ? 'gastos-hormiga' : (editingExpense.category === 'gastos-hormiga' ? 'otros' : editingExpense.category)
                  });
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingExpense.is_ant_expense)}
                    onChange={(e) => {
                      const nextChecked = e.target.checked;
                      setEditingExpense({
                        ...editingExpense,
                        is_ant_expense: nextChecked,
                        category: nextChecked ? 'gastos-hormiga' : (editingExpense.category === 'gastos-hormiga' ? 'otros' : editingExpense.category)
                      });
                    }}
                    style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: editingExpense.is_ant_expense ? '#fef08a' : 'inherit' }}>
                    Marcar como Gasto Hormiga 🐜
                  </span>
                </div>

                {/* Método de pago */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Método de Pago</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setEditingExpense({ ...editingExpense, payment_method: editingExpense.payment_method === pm.id ? '' : pm.id })}
                        className={`chip ${editingExpense.payment_method === pm.id ? 'active' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
                      >
                        {pm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banco y Lugar */}
                <div className="grid-2" style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Banco (Opcional)</label>
                    <select
                      value={editingExpense.bank || ''}
                      onChange={(e) => setEditingExpense({ ...editingExpense, bank: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Ninguno / No aplica</option>
                      {PERU_BANKS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Lugar / Establecimiento</label>
                    <input
                      type="text"
                      value={editingExpense.place || ''}
                      onChange={(e) => setEditingExpense({ ...editingExpense, place: e.target.value })}
                      className="form-input"
                      placeholder="Ej: Tambo, Metro, Grifo..."
                    />
                  </div>
                </div>

              </div>

              {/* Pie Fijo del Modal (Botones siempre visibles) */}
              <div style={{
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(11, 15, 25, 0.95)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.65rem',
                flexShrink: 0
              }}>
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.35rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN (SIN ALERTAS NATIVAS DEL NAVEGADOR) */}
      {expenseToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '1.5rem',
            position: 'relative',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)'
          }}>
            <button
              onClick={() => setExpenseToDelete(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={15} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={20} color="var(--danger)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>¿Eliminar este gasto?</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Esta acción es permanente y no se puede deshacer.</p>
              </div>
            </div>

            {/* Expense details summary card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                  {expenseToDelete.description || getCategoryInfo(expenseToDelete.category).name}
                </span>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: expenseToDelete.is_ant_expense ? '#fef08a' : '#fff'
                }}>
                  {formatMoney(expenseToDelete.amount, expenseToDelete.currency || 'PEN')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>📅 {formatLimaDate(expenseToDelete.date, { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span>• 🏷️ {getCategoryInfo(expenseToDelete.category).name}</span>
                {expenseToDelete.payment_method && <span>• 💳 {expenseToDelete.payment_method}</span>}
                {expenseToDelete.bank && <span>• 🏦 {expenseToDelete.bank}</span>}
                {expenseToDelete.place && <span>• 📍 {expenseToDelete.place}</span>}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Trash2 size={15} />
                <span>Sí, Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
