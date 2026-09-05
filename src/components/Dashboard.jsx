import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { DEFAULT_CATEGORIES } from '../lib/supabaseClient';
import { Bug, DollarSign, PieChart, TrendingDown, Target, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export default function Dashboard({ expenses, monthlyBudget, setMonthlyBudget, categories = DEFAULT_CATEGORIES }) {
  const [timeFilter, setTimeFilter] = useState('this_month'); // 'this_month', 'last_30', 'all'
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  // Filter expenses by selected timeframe
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      if (timeFilter === 'this_month') {
        return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'last_30') {
        const diffDays = (now - expDate) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [expenses, timeFilter]);

  // Compute Metrics
  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [filteredExpenses]);

  const antExpensesTotal = useMemo(() => {
    return filteredExpenses
      .filter(e => e.is_ant_expense || e.category === 'gastos-hormiga')
      .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [filteredExpenses]);

  const antPercentage = totalSpent > 0 ? ((antExpensesTotal / totalSpent) * 100).toFixed(1) : 0;
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetUsagePercent = Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100);

  // Group by Category for Doughnut Chart
  const categoryDataMap = useMemo(() => {
    const map = {};
    categories.forEach(c => map[c.id] = 0);
    
    filteredExpenses.forEach(exp => {
      const catId = exp.category || 'otros';
      map[catId] = (map[catId] || 0) + (parseFloat(exp.amount) || 0);
    });
    return map;
  }, [filteredExpenses, categories]);

  const doughnutChartData = useMemo(() => {
    const labels = [];
    const data = [];
    const backgroundColor = [];

    categories.forEach(cat => {
      const val = categoryDataMap[cat.id] || 0;
      if (val > 0) {
        labels.push(cat.name);
        data.push(val);
        backgroundColor.push(cat.color || '#6366f1');
      }
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: '#131b2e',
          borderWidth: 2,
          hoverOffset: 8
        }
      ]
    };
  }, [categoryDataMap, categories]);

  // Group by Date for Bar Chart (Daily Spending Trend)
  const barChartData = useMemo(() => {
    const dateMap = {};
    
    // Sort expenses chronologically
    const sorted = [...filteredExpenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(exp => {
      const dateStr = new Date(exp.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { ant: 0, regular: 0 };
      }
      if (exp.is_ant_expense || exp.category === 'gastos-hormiga') {
        dateMap[dateStr].ant += parseFloat(exp.amount);
      } else {
        dateMap[dateStr].regular += parseFloat(exp.amount);
      }
    });

    const labels = Object.keys(dateMap);
    const antData = labels.map(l => dateMap[l].ant);
    const regularData = labels.map(l => dateMap[l].regular);

    return {
      labels,
      datasets: [
        {
          label: 'Gastos Hormiga 🐜',
          data: antData,
          backgroundColor: '#f59e0b',
          borderRadius: 6,
        },
        {
          label: 'Gastos Regulares 🛒',
          data: regularData,
          backgroundColor: '#6366f1',
          borderRadius: 6,
        }
      ]
    };
  }, [filteredExpenses]);

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
    }
    setEditingBudget(false);
  };

  return (
    <div className="animate-fade-in">
      
      {/* Time Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem' }}>Resumen & Analítica</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            className={`chip ${timeFilter === 'this_month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('this_month')}
          >
            Este Mes
          </button>
          <button
            className={`chip ${timeFilter === 'last_30' ? 'active' : ''}`}
            onClick={() => setTimeFilter('last_30')}
          >
            Últimos 30 días
          </button>
          <button
            className={`chip ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            Todo
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        
        {/* Total Spent Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Gastado</span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)' }}>
              <TrendingDown size={18} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            ${totalSpent.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            En {filteredExpenses.length} registro(s) de compra
          </p>
        </div>

        {/* Gastos Hormiga Highlight Card */}
        <div className="glass-card" style={{
          padding: '1.25rem',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.12), rgba(18, 24, 40, 0.75))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#fef08a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Bug size={16} color="#f59e0b" /> Gastos Hormiga 🐜
            </span>
            <span className="badge badge-ant">{antPercentage}% del Total</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fef08a' }}>
            ${antExpensesTotal.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#fde68a', marginTop: '0.35rem' }}>
            {antExpensesTotal > 50 ? '⚠️ Atención: Los micro-gastos están sumando una cifra considerable.' : '👍 Control de fugas de dinero bajo control.'}
          </p>
        </div>

        {/* Budget Remaining Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presupuesto Mensual</span>
            {!editingBudget ? (
              <button
                onClick={() => setEditingBudget(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                Editar
              </button>
            ) : (
              <button
                onClick={handleSaveBudget}
                style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Guardar
              </button>
            )}
          </div>

          {!editingBudget ? (
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: remainingBudget >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ${remainingBudget.toFixed(2)}
            </div>
          ) : (
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.2rem', padding: '0.3rem 0.6rem', marginTop: '0.2rem' }}
            />
          )}

          {/* Budget Progress Bar */}
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Usado: ${totalSpent.toFixed(0)}</span>
              <span>Límite: ${monthlyBudget.toFixed(0)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${budgetUsagePercent}%`,
                background: budgetUsagePercent > 90 ? 'var(--danger)' : budgetUsagePercent > 70 ? 'var(--accent-ant)' : 'var(--success)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid-2">
        
        {/* Doughnut Chart (Categories) */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Distribución por Categoría</span>
          </h3>

          {doughnutChartData.labels.length > 0 ? (
            <div style={{ height: '260px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 }, padding: 12 }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` $${ctx.raw.toFixed(2)} (${((ctx.raw / totalSpent) * 100).toFixed(1)}%)`
                      }
                    }
                  },
                  cutout: '68%'
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Aún no hay gastos registrados en este periodo.
            </div>
          )}
        </div>

        {/* Bar Chart (Daily Trend) */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Evolución Diaria de Gastos</span>
          </h3>

          {barChartData.labels.length > 0 ? (
            <div style={{ height: '260px', position: 'relative' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                      stacked: true,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => `$${v}` }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Registra tus gastos diarios para ver la gráfica de tendencias.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
