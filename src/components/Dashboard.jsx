import React, { useMemo, useState, useEffect } from 'react';
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
import {
  DEFAULT_CATEGORIES,
  formatMoney,
  formatLimaDate,
  fetchLiveExchangeRate
} from '../lib/supabaseClient';
import {
  Bug,
  DollarSign,
  PieChart,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  ArrowRightLeft,
  Coins,
  Layers
} from 'lucide-react';

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

export default function Dashboard({
  expenses,
  monthlyBudget,
  setMonthlyBudget,
  categories = DEFAULT_CATEGORIES,
  currentCurrency = 'PEN',
  onCurrencyChange,
  exchangeRate = 3.75,
  exchangeUpdatedAt = '',
  onRefreshExchangeRate
}) {
  const [timeFilter, setTimeFilter] = useState('this_month'); // 'this_month', 'last_30', 'all'
  const [currencyMode, setCurrencyMode] = useState('consolidated'); // 'PEN', 'USD', 'consolidated'
  const [convertUsdToPen, setConvertUsdToPen] = useState(true); // En consolidado, convertir USD -> PEN a tasa mercado
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  // Tipo de cambio en tiempo real (Google / Mercado Interbancario sin SUNAT)
  const [exchangeData, setExchangeData] = useState({
    rate: exchangeRate || 3.75,
    updatedAt: exchangeUpdatedAt || '',
    loading: false
  });

  useEffect(() => {
    if (exchangeRate) {
      setExchangeData(prev => ({
        ...prev,
        rate: exchangeRate,
        updatedAt: exchangeUpdatedAt || prev.updatedAt
      }));
    }
  }, [exchangeRate, exchangeUpdatedAt]);

  const loadExchangeRate = async (forceRefresh = false) => {
    if (onRefreshExchangeRate) {
      setExchangeData(prev => ({ ...prev, loading: true }));
      await onRefreshExchangeRate();
      setExchangeData(prev => ({ ...prev, loading: false }));
      return;
    }
    if (forceRefresh) {
      localStorage.removeItem('control_ahorro_exchange_rate_v1');
    }
    setExchangeData(prev => ({ ...prev, loading: true }));
    try {
      const data = await fetchLiveExchangeRate();
      setExchangeData({
        rate: data?.rate || 3.75,
        updatedAt: data?.updatedAt || 'Reciente',
        loading: false
      });
    } catch (e) {
      console.error('Error al cargar tasa de cambio:', e);
      setExchangeData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!exchangeRate) {
      loadExchangeRate();
    }
  }, [exchangeRate]);

  const handleCurrencyModeSelect = (mode) => {
    setCurrencyMode(mode);
    if (onCurrencyChange && (mode === 'PEN' || mode === 'USD')) {
      onCurrencyChange(mode);
    }
  };

  // Filter expenses by timeframe
  const timeFilteredExpenses = useMemo(() => {
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

  // Totals calculations
  const {
    totalPEN,
    totalUSD,
    antPEN,
    antUSD,
    expensesInView,
    activeSymbol,
    primaryTotal,
    primaryAntTotal
  } = useMemo(() => {
    const rate = exchangeData.rate || 3.75;
    let penSum = 0;
    let usdSum = 0;
    let antPenSum = 0;
    let antUsdSum = 0;

    timeFilteredExpenses.forEach(exp => {
      const amt = parseFloat(exp.amount) || 0;
      const isAnt = exp.is_ant_expense || exp.category === 'gastos-hormiga';
      const cur = exp.currency || 'PEN';

      if (cur === 'USD') {
        usdSum += amt;
        if (isAnt) antUsdSum += amt;
      } else {
        penSum += amt;
        if (isAnt) antPenSum += amt;
      }
    });

    let inView = [];
    let sym = 'S/';
    let mainTotal = 0;
    let mainAntTotal = 0;

    if (currencyMode === 'PEN') {
      inView = timeFilteredExpenses.filter(e => (e.currency || 'PEN') === 'PEN');
      sym = 'S/';
      mainTotal = penSum;
      mainAntTotal = antPenSum;
    } else if (currencyMode === 'USD') {
      inView = timeFilteredExpenses.filter(e => e.currency === 'USD');
      sym = '$';
      mainTotal = usdSum;
      mainAntTotal = antUsdSum;
    } else {
      // Consolidado
      inView = timeFilteredExpenses;
      if (convertUsdToPen) {
        sym = 'S/';
        mainTotal = penSum + (usdSum * rate);
        mainAntTotal = antPenSum + (antUsdSum * rate);
      } else {
        sym = 'S/ & $';
        mainTotal = penSum;
        mainAntTotal = antPenSum;
      }
    }

    return {
      totalPEN: penSum,
      totalUSD: usdSum,
      antPEN: antPenSum,
      antUSD: antUsdSum,
      expensesInView: inView,
      activeSymbol: sym,
      primaryTotal: mainTotal,
      primaryAntTotal: mainAntTotal
    };
  }, [timeFilteredExpenses, currencyMode, convertUsdToPen, exchangeData.rate]);

  // Ant Percentage & Budget
  const antPercentage = primaryTotal > 0 ? ((primaryAntTotal / primaryTotal) * 100).toFixed(1) : 0;
  const remainingBudget = monthlyBudget - primaryTotal;
  const budgetUsagePercent = Math.min(Math.round((primaryTotal / monthlyBudget) * 100), 100);

  // Group by Category for Doughnut Chart
  const categoryDataMap = useMemo(() => {
    const map = {};
    categories.forEach(c => map[c.id] = 0);
    const rate = exchangeData.rate || 3.75;

    expensesInView.forEach(exp => {
      const catId = exp.category || 'otros';
      let amt = parseFloat(exp.amount) || 0;

      if (currencyMode === 'consolidated' && convertUsdToPen && exp.currency === 'USD') {
        amt = amt * rate;
      }
      map[catId] = (map[catId] || 0) + amt;
    });

    return map;
  }, [expensesInView, categories, currencyMode, convertUsdToPen, exchangeData.rate]);

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
    const rate = exchangeData.rate || 3.75;
    const sorted = [...expensesInView].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(exp => {
      const dateStr = formatLimaDate(exp.date, { day: '2-digit', month: 'short' });
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { ant: 0, regular: 0 };
      }

      let amt = parseFloat(exp.amount) || 0;
      if (currencyMode === 'consolidated' && convertUsdToPen && exp.currency === 'USD') {
        amt = amt * rate;
      }

      const isAnt = exp.is_ant_expense || exp.category === 'gastos-hormiga';
      if (isAnt) {
        dateMap[dateStr].ant += amt;
      } else {
        dateMap[dateStr].regular += amt;
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
  }, [expensesInView, currencyMode, convertUsdToPen, exchangeData.rate]);

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
    }
    setEditingBudget(false);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Time & Currency Control Bar */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem' }}>Resumen Financiero</h2>
          </div>

          {/* Currency Selector (Soles, Dolares, Consolidado) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Coins size={14} color="var(--primary)" /> Moneda:
            </span>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <button
                className={`chip ${currencyMode === 'consolidated' ? 'active' : ''}`}
                onClick={() => handleCurrencyModeSelect('consolidated')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                🌐 Consolidado
              </button>
              <button
                className={`chip ${currencyMode === 'PEN' ? 'active' : ''}`}
                onClick={() => handleCurrencyModeSelect('PEN')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                🇵🇪 Soles (S/)
              </button>
              <button
                className={`chip ${currencyMode === 'USD' ? 'active' : ''}`}
                onClick={() => handleCurrencyModeSelect('USD')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                💵 Dólares ($)
              </button>
            </div>
          </div>

          {/* Timeframe Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} color="var(--primary)" /> Periodo:
            </span>
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <button
                className={`chip ${timeFilter === 'this_month' ? 'active' : ''}`}
                onClick={() => setTimeFilter('this_month')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                Este Mes
              </button>
              <button
                className={`chip ${timeFilter === 'last_30' ? 'active' : ''}`}
                onClick={() => setTimeFilter('last_30')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                Últimos 30d
              </button>
              <button
                className={`chip ${timeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimeFilter('all')}
                style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}
              >
                Todo
              </button>
            </div>
          </div>

        </div>

        {/* Live Exchange Rate & Conversion Options in Consolidated Mode */}
        {currencyMode === 'consolidated' && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#e0e7ff'
              }}>
                <ArrowRightLeft size={13} color="var(--primary)" />
                <span>TC Google/Mercado: <strong>1 USD = S/ {exchangeData.rate.toFixed(3)}</strong></span>
                {exchangeData.updatedAt && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({exchangeData.updatedAt})</span>
                )}
                <button
                  onClick={() => loadExchangeRate(true)}
                  disabled={exchangeData.loading}
                  title="Actualizar tasa de cambio en vivo"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 2px'
                  }}
                >
                  <RefreshCw size={12} className={exchangeData.loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Tasa de cambio interbancaria en tiempo real (sin SUNAT)
              </span>
            </div>

            {/* Toggle Conversion: Convert USD to PEN vs Separated */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => setConvertUsdToPen(true)}
                className={`chip ${convertUsdToPen ? 'active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '0.28rem 0.6rem' }}
              >
                🔄 Unificar todo a Soles (S/)
              </button>
              <button
                onClick={() => setConvertUsdToPen(false)}
                className={`chip ${!convertUsdToPen ? 'active' : ''}`}
                style={{ fontSize: '0.74rem', padding: '0.28rem 0.6rem' }}
              >
                📊 Separar S/ y $
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metric KPI Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        
        {/* Total Spent Card */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Gastado</span>
            <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)' }}>
              <TrendingDown size={17} color="var(--primary)" />
            </div>
          </div>

          {currencyMode === 'consolidated' && !convertUsdToPen ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                {formatMoney(totalPEN, 'PEN')}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981', marginTop: '0.2rem' }}>
                + {formatMoney(totalUSD, 'USD')}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              {formatMoney(primaryTotal, currencyMode === 'USD' ? 'USD' : 'PEN')}
            </div>
          )}

          {currencyMode === 'consolidated' && convertUsdToPen && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.45rem', lineHeight: '1.3' }}>
              <span>🇵🇪 S/ {totalPEN.toFixed(2)}</span>
              {totalUSD > 0 && (
                <span> + 💵 $ {totalUSD.toFixed(2)} (~S/ {(totalUSD * exchangeData.rate).toFixed(2)})</span>
              )}
            </div>
          )}

          {currencyMode !== 'consolidated' && (
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              En {expensesInView.length} registro(s) ({currencyMode === 'USD' ? 'Dólares' : 'Soles'})
            </p>
          )}
        </div>

        {/* Gastos Hormiga Highlight Card */}
        <div className="glass-card" style={{
          padding: '1.15rem',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          background: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.12), rgba(18, 24, 40, 0.75))'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#fef08a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Bug size={16} color="#f59e0b" /> Gastos Hormiga 🐜
            </span>
            <span className="badge badge-ant">{antPercentage}% del Total</span>
          </div>

          {currencyMode === 'consolidated' && !convertUsdToPen ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fef08a' }}>
                {formatMoney(antPEN, 'PEN')}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fef08a', marginTop: '0.2rem' }}>
                + {formatMoney(antUSD, 'USD')}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fef08a' }}>
              {formatMoney(primaryAntTotal, currencyMode === 'USD' ? 'USD' : 'PEN')}
            </div>
          )}

          <p style={{ fontSize: '0.74rem', color: '#fde68a', marginTop: '0.45rem' }}>
            {primaryAntTotal > 50
              ? '⚠️ Atención: Micro-gastos diarios acumulando una suma considerable.'
              : '👍 Buen control de fugas de dinero hormiga.'}
          </p>
        </div>

        {/* Budget Remaining Card */}
        <div className="glass-card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Presupuesto Mensual (S/)
            </span>
            {!editingBudget ? (
              <button
                onClick={() => setEditingBudget(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.74rem', textDecoration: 'underline' }}
              >
                Editar
              </button>
            ) : (
              <button
                onClick={handleSaveBudget}
                style={{ background: 'var(--primary)', border: 'none', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.74rem' }}
              >
                Guardar
              </button>
            )}
          </div>

          {!editingBudget ? (
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: remainingBudget >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoney(remainingBudget, 'PEN')}
            </div>
          ) : (
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.15rem', padding: '0.3rem 0.6rem', marginTop: '0.2rem' }}
            />
          )}

          {/* Budget Progress Bar */}
          <div style={{ marginTop: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Usado: S/ {primaryTotal.toFixed(0)}</span>
              <span>Límite: S/ {monthlyBudget.toFixed(0)}</span>
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

      {/* Charts Responsive Grid (Stacks vertically on mobile) */}
      <div className="grid-2" style={{ marginBottom: '1rem', width: '100%', minWidth: 0 }}>
        
        {/* Doughnut Chart (Categories) */}
        <div className="glass-card chart-card-container" style={{ padding: '1.25rem', width: '100%', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.02rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Distribución por Categoría ({activeSymbol})</span>
          </h3>

          {doughnutChartData.labels.length > 0 ? (
            <div style={{ height: '260px', width: '100%', minWidth: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 }, padding: 10 }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${activeSymbol} ${ctx.raw.toFixed(2)} (${primaryTotal > 0 ? ((ctx.raw / primaryTotal) * 100).toFixed(1) : 0}%)`
                      }
                    }
                  },
                  cutout: '68%'
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Aún no hay gastos registrados en este periodo.
            </div>
          )}
        </div>

        {/* Bar Chart (Daily Trend) */}
        <div className="glass-card chart-card-container" style={{ padding: '1.25rem', width: '100%', minWidth: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.02rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Evolución Diaria de Gastos ({activeSymbol})</span>
          </h3>

          {barChartData.labels.length > 0 ? (
            <div style={{ height: '260px', width: '100%', minWidth: 0, position: 'relative' }}>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 9 } }
                    },
                    y: {
                      stacked: true,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#94a3b8', font: { size: 9 }, callback: (v) => `${activeSymbol} ${v}` }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Registra tus gastos diarios para ver la gráfica de tendencias.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
