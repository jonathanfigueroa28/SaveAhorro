import React, { useState, useMemo } from 'react';
import { DEFAULT_CATEGORIES } from '../lib/supabaseClient';
import { Search, Download, Trash2, Bug, Filter, Calendar, FileSpreadsheet } from 'lucide-react';

export default function ExpenseList({ expenses, onDeleteExpense, categories = DEFAULT_CATEGORIES }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAnt, setOnlyAnt] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Search term filter
      const descMatch = (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = (exp.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = descMatch || catMatch;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;

      // Ant filter
      const matchesAnt = !onlyAnt || (exp.is_ant_expense || exp.category === 'gastos-hormiga');

      return matchesSearch && matchesCategory && matchesAnt;
    });
  }, [expenses, searchTerm, selectedCategory, onlyAnt]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = ['ID', 'Fecha', 'Categoria', 'Monto', 'Es Gasto Hormiga', 'Descripcion'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      new Date(exp.date).toLocaleString('es-ES'),
      categories.find(c => c.id === exp.category)?.name || exp.category,
      exp.amount.toFixed(2),
      exp.is_ant_expense ? 'SI' : 'NO',
      `"${(exp.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `control_ahorro_gastos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: catId, color: '#64748b' };
  };

  return (
    <div className="animate-fade-in">
      
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
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Historial de Gastos</span>
              <span className="badge badge-regular">{filteredExpenses.length} registros</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Busca, filtra y exporta todos tus movimientos.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            disabled={filteredExpenses.length === 0}
          >
            <FileSpreadsheet size={16} color="var(--success)" />
            <span>Exportar a Excel (CSV)</span>
          </button>
        </div>

        {/* Filters Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar gasto o nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.875rem' }}
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Toggle Only Ant Expenses */}
          <button
            className={`btn ${onlyAnt ? 'btn-ant' : 'btn-secondary'}`}
            onClick={() => setOnlyAnt(!onlyAnt)}
            style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            <Bug size={16} />
            <span>{onlyAnt ? 'Ver Todos los Gastos' : 'Filtrar Gastos Hormiga 🐜'}</span>
          </button>

        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {filteredExpenses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Fecha</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Categoría</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Descripción / Nota</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Monto</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => {
                  const catInfo = getCategoryInfo(exp.category);
                  const isAnt = exp.is_ant_expense || exp.category === 'gastos-hormiga';
                  const expDate = new Date(exp.date);
                  
                  return (
                    <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      
                      {/* Date Column */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {expDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {expDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Category Column */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: `${catInfo.color}20`,
                          color: catInfo.color,
                          border: `1px solid ${catInfo.color}40`
                        }}>
                          {catInfo.name}
                        </span>
                      </td>

                      {/* Description Column */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{exp.description || 'Sin nota'}</span>
                          {isAnt && (
                            <span className="badge badge-ant" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                              🐜 Hormiga
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: '700', fontSize: '1rem', color: isAnt ? '#fef08a' : '#fff' }}>
                        ${exp.amount.toFixed(2)}
                      </td>

                      {/* Actions Column */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}
                          title="Eliminar gasto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No se encontraron gastos</p>
            <p style={{ fontSize: '0.85rem' }}>Prueba cambiando los filtros de búsqueda o agrega un nuevo gasto.</p>
          </div>
        )}
      </div>

    </div>
  );
}
