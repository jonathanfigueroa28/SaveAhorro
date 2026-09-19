import React, { useState, useMemo } from 'react';
import {
  formatMoney,
  PERU_BANKS,
  saveAccount,
  deleteAccount,
  saveIncome,
  deleteIncome,
  saveFixedExpense,
  deleteFixedExpense,
  fetchCreditCardConfig,
  saveCreditCardConfig,
  fetchMonthlySavingsGoal,
  saveMonthlySavingsGoal
} from '../lib/supabaseClient';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  ArrowRightLeft,
  Building,
  DollarSign,
  ShieldCheck,
  PiggyBank,
  Info,
  Calendar,
  X,
  Check,
  Home,
  CheckSquare,
  Square,
  Sparkles,
  Smartphone,
  Coins,
  Briefcase,
  Receipt,
  HelpCircle,
  Percent,
  Clock
} from 'lucide-react';
import {
  WORK_REGIMES,
  PENSION_SYSTEMS,
  PERU_UIT,
  calculatePeruPayroll
} from '../lib/peruPayroll';

export default function LiquidityManager({
  expenses = [],
  accounts = [],
  onAccountsChange,
  incomes = [],
  onIncomesChange,
  fixedExpenses = [],
  onFixedExpensesChange,
  exchangeRate = 3.75,
  currentCurrency = 'PEN'
}) {
  const [activeSection, setActiveSection] = useState('cuentas'); // 'cuentas', 'ingresos', 'fijos', 'tarjeta'
  
  // Modals state
  const [accountModal, setAccountModal] = useState(null);
  const [incomeModal, setIncomeModal] = useState(null);
  const [fixedModal, setFixedModal] = useState(null);
  
  // Tarjeta de Crédito y Ahorro Programado State
  const [tcConfig, setTcConfig] = useState(() => fetchCreditCardConfig());
  const [tcModal, setTcModal] = useState(null);
  const [savingsGoal, setSavingsGoal] = useState(() => fetchMonthlySavingsGoal());
  const [savingsModal, setSavingsModal] = useState(null);
  const [activeLiquidityView, setActiveLiquidityView] = useState('month1'); // 'month1' (próximo mes) | 'month2' (subsiguiente mes)
  const [fixedSubTab, setFixedSubTab] = useState('fijos'); // 'fijos' | 'ahorro'

  // 1. Current month expenses filter
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  // 2. Compute live balances debited per account
  const accountsWithComputedBalances = useMemo(() => {
    return accounts.map(acc => {
      const initial = parseFloat(acc.initial_balance) || 0;
      
      // Calculate expenses debited from this account this month
      const debitedThisMonth = currentMonthExpenses
        .filter(exp => {
          // Si el gasto fue marcado como histórico / ya facturado en saldo inicial, NO restar
          if (exp.is_historical_already_billed) return false;

          // If explicitly tagged with account_id
          if (exp.account_id) return exp.account_id === acc.id;
          
          // Auto-inference if not tagged:
          if (acc.type === 'efectivo' && exp.payment_method === 'efectivo') return true;
          if (acc.type === 'billetera_digital' && acc.name.toLowerCase().includes('yape') && exp.payment_method === 'yape') return true;
          if (acc.type === 'billetera_digital' && acc.name.toLowerCase().includes('plin') && exp.payment_method === 'plin') return true;
          if (acc.type === 'tarjeta_credito' && exp.payment_method === 'credito') return true;
          if (acc.type === 'banco' && exp.payment_method === 'debito') return true;
          return false;
        })
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      const computedBalance = acc.type === 'tarjeta_credito'
        ? initial + debitedThisMonth // For credit card, balance is debt
        : Math.max(0, initial - debitedThisMonth);

      return {
        ...acc,
        debitedThisMonth,
        computedBalance
      };
    });
  }, [accounts, currentMonthExpenses]);

  // 3. Totals by category
  const {
    availableCashTodayPEN,
    reserveSavingsPEN,
    reserveSavingsUSD,
    totalReserveSavingsInPEN
  } = useMemo(() => {
    let cashToday = 0;
    let sPEN = 0;
    let sUSD = 0;

    accountsWithComputedBalances.forEach(acc => {
      const bal = acc.computedBalance;
      if (acc.type === 'tarjeta_credito') return; // Exclude credit card from cash

      if (acc.is_operating) {
        cashToday += acc.currency === 'USD' ? bal * exchangeRate : bal;
      } else {
        if (acc.currency === 'USD') sUSD += bal;
        else sPEN += bal;
      }
    });

    return {
      availableCashTodayPEN: cashToday,
      reserveSavingsPEN: sPEN,
      reserveSavingsUSD: sUSD,
      totalReserveSavingsInPEN: sPEN + (sUSD * exchangeRate)
    };
  }, [accountsWithComputedBalances, exchangeRate]);

  // 4. Incomes total calculation (Soles + USD converted)
  const totalMonthlyIncomePEN = useMemo(() => {
    return incomes.reduce((sum, inc) => {
      const amt = parseFloat(inc.amount) || 0;
      return sum + (inc.currency === 'USD' ? amt * exchangeRate : amt);
    }, 0);
  }, [incomes, exchangeRate]);

  // 5. Fixed expenses calculations
  const { totalFixedExpensesPEN, pendingFixedExpensesPEN, paidFixedExpensesPEN } = useMemo(() => {
    let total = 0;
    let pending = 0;
    let paid = 0;

    fixedExpenses.forEach(f => {
      const amt = parseFloat(f.amount) || 0;
      const inSoles = f.currency === 'USD' ? amt * exchangeRate : amt;
      total += inSoles;
      if (f.is_paid) paid += inSoles;
      else pending += inSoles;
    });

    return {
      totalFixedExpensesPEN: total,
      pendingFixedExpensesPEN: pending,
      paidFixedExpensesPEN: paid
    };
  }, [fixedExpenses, exchangeRate]);

  // 6. Tarjeta de Crédito: Compras del Ciclo Actual en Curso (Lo que gastas HOY y vence el mes subsiguiente)
  const creditCardNewPurchases = useMemo(() => {
    let pen = 0;
    let usd = 0;
    const purchasesList = [];

    currentMonthExpenses
      .filter(exp => exp.payment_method === 'credito' && !exp.is_historical_already_billed)
      .forEach(exp => {
        const amt = parseFloat(exp.amount) || 0;
        if (exp.currency === 'USD') usd += amt;
        else pen += amt;
        purchasesList.push(exp);
      });

    return {
      purchasesPEN: pen,
      purchasesUSD: usd,
      totalPurchasesInPEN: pen + (usd * exchangeRate),
      purchasesList
    };
  }, [currentMonthExpenses, exchangeRate]);

  const creditCardExpensesThisMonth = creditCardNewPurchases.totalPurchasesInPEN;

  // Deuda Facturada del Último Estado de Cuenta (a pagar este ciclo)
  const billedDebtPEN = parseFloat(tcConfig.billedDebtPEN) || 0;
  const billedDebtUSD = parseFloat(tcConfig.billedDebtUSD) || 0;
  const totalBilledDebtInPEN = billedDebtPEN + (billedDebtUSD * exchangeRate);
  const pendingBilledDebtInPEN = tcConfig.isBilledPaidThisMonth ? 0 : totalBilledDebtInPEN;

  // 7. Plan de Ahorro Mensual Programado
  const savingsPlanPEN = parseFloat(savingsGoal.amountPEN) || 0;
  const savingsPlanUSD = parseFloat(savingsGoal.amountUSD) || 0;
  const totalPlannedSavingsInPEN = savingsPlanPEN + (savingsPlanUSD * exchangeRate);
  const pendingSavingsInPEN = savingsGoal.isTransferredThisMonth ? 0 : totalPlannedSavingsInPEN;

  // 8. PROYECCIÓN DUAL A 2 MESES VISTA
  // Mes 1 (Próximo Mes Inmediato / Ciclo Facturado):
  const projectedFreeLiquidityMonth1 = 
    (availableCashTodayPEN + totalMonthlyIncomePEN) 
    - pendingFixedExpensesPEN 
    - pendingBilledDebtInPEN 
    - pendingSavingsInPEN;

  // Mes 2 (Mes Subsiguiente / Próximo Ciclo con consumos de TC de HOY):
  const projectedFreeLiquidityMonth2 = 
    totalMonthlyIncomePEN 
    - totalFixedExpensesPEN 
    - creditCardNewPurchases.totalPurchasesInPEN 
    - totalPlannedSavingsInPEN;

  // Retrocompatibilidad
  const projectedFreeLiquidityNextMonth = projectedFreeLiquidityMonth1;
  const totalCreditCardBillNextMonth = pendingBilledDebtInPEN;

  // Helper de ciclo de facturación
  const cycleInfo = useMemo(() => {
    const today = new Date().getDate();
    const closing = parseInt(tcConfig.closingDay) || 20;
    const due = parseInt(tcConfig.dueDay) || 5;
    const isPastClosing = today > closing;
    const daysUntilClosing = isPastClosing ? null : (closing - today);
    return {
      today,
      closing,
      due,
      isPastClosing,
      daysUntilClosing
    };
  }, [tcConfig.closingDay, tcConfig.dueDay]);

  // Handlers for Accounts
  const handleSaveAccountModal = async (e) => {
    e.preventDefault();
    if (!accountModal) return;
    const saved = await saveAccount(accountModal);
    if (onAccountsChange) {
      onAccountsChange(prev => {
        const exists = prev.some(a => a.id === saved.id);
        return exists ? prev.map(a => a.id === saved.id ? saved : a) : [...prev, saved];
      });
    }
    setAccountModal(null);
  };

  const handleDeleteAccountAction = async (id) => {
    if (accounts.length <= 1) {
      alert('Debes mantener al menos una cuenta registrada.');
      return;
    }
    await deleteAccount(id);
    if (onAccountsChange) {
      onAccountsChange(prev => prev.filter(a => a.id !== id));
    }
  };

  // Real-time Peruvian Payroll Calculation preview in modal
  const payrollPreview = useMemo(() => {
    if (!incomeModal) return null;
    const gross = parseFloat(incomeModal.gross_salary || incomeModal.amount) || 0;
    return calculatePeruPayroll({
      grossSalary: gross,
      regime: incomeModal.regime || (incomeModal.currency === 'USD' ? 'neto_directo' : 'planilla_general'),
      pensionSystemId: incomeModal.pension_system_id || 'afp_integra',
      hasSuspension4ta: Boolean(incomeModal.has_suspension_4ta),
      currency: incomeModal.currency || 'PEN'
    });
  }, [incomeModal?.gross_salary, incomeModal?.amount, incomeModal?.regime, incomeModal?.pension_system_id, incomeModal?.has_suspension_4ta, incomeModal?.currency]);

  // Handlers for Incomes
  const handleSaveIncomeModal = async (e) => {
    e.preventDefault();
    if (!incomeModal) return;

    let finalAmount = parseFloat(incomeModal.amount) || 0;
    const regime = incomeModal.regime || (incomeModal.currency === 'USD' ? 'neto_directo' : 'planilla_general');

    if (regime !== 'neto_directo' && incomeModal.currency === 'PEN' && payrollPreview) {
      finalAmount = payrollPreview.netSalary;
    }

    const payload = {
      ...incomeModal,
      amount: finalAmount,
      gross_salary: incomeModal.gross_salary ? parseFloat(incomeModal.gross_salary) : finalAmount,
      regime: regime,
      pension_system_id: incomeModal.pension_system_id || 'afp_integra',
      has_suspension_4ta: Boolean(incomeModal.has_suspension_4ta)
    };

    const saved = await saveIncome(payload);
    if (onIncomesChange) {
      onIncomesChange(prev => {
        const exists = prev.some(i => i.id === saved.id);
        return exists ? prev.map(i => i.id === saved.id ? saved : i) : [...prev, saved];
      });
    }
    setIncomeModal(null);
  };

  const handleDeleteIncomeAction = async (id) => {
    await deleteIncome(id);
    if (onIncomesChange) {
      onIncomesChange(prev => prev.filter(i => i.id !== id));
    }
  };

  // Handlers for Fixed Expenses
  const handleSaveFixedModal = async (e) => {
    e.preventDefault();
    if (!fixedModal) return;
    const saved = await saveFixedExpense(fixedModal);
    if (onFixedExpensesChange) {
      onFixedExpensesChange(prev => {
        const exists = prev.some(f => f.id === saved.id);
        return exists ? prev.map(f => f.id === saved.id ? saved : f) : [...prev, saved];
      });
    }
    setFixedModal(null);
  };

  const handleToggleFixedPaid = async (item) => {
    const updated = { ...item, is_paid: !item.is_paid };
    await saveFixedExpense(updated);
    if (onFixedExpensesChange) {
      onFixedExpensesChange(prev => prev.map(f => f.id === item.id ? updated : f));
    }
  };

  const handleDeleteFixedAction = async (id) => {
    await deleteFixedExpense(id);
    if (onFixedExpensesChange) {
      onFixedExpensesChange(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleUpdateTcConfig = (updates) => {
    const updated = saveCreditCardConfig({ ...tcConfig, ...updates });
    setTcConfig(updated);
  };

  const handleToggleBilledPaid = () => {
    handleUpdateTcConfig({ isBilledPaidThisMonth: !tcConfig.isBilledPaidThisMonth });
  };

  const handleSaveTcModal = (e) => {
    e.preventDefault();
    if (!tcModal) return;
    const updated = saveCreditCardConfig({
      ...tcConfig,
      ...tcModal,
      closingDay: parseInt(tcModal.closingDay) || 20,
      dueDay: parseInt(tcModal.dueDay) || 5,
      billedDebtPEN: parseFloat(tcModal.billedDebtPEN) || 0,
      billedDebtUSD: parseFloat(tcModal.billedDebtUSD) || 0
    });
    setTcConfig(updated);
    setTcModal(null);
  };

  const handleUpdateSavingsGoal = (updates) => {
    const updated = saveMonthlySavingsGoal({ ...savingsGoal, ...updates });
    setSavingsGoal(updated);
  };

  const handleToggleSavingsTransferred = () => {
    handleUpdateSavingsGoal({ isTransferredThisMonth: !savingsGoal.isTransferredThisMonth });
  };

  const handleSaveSavingsModal = (e) => {
    e.preventDefault();
    if (!savingsModal) return;
    const updated = saveMonthlySavingsGoal({
      ...savingsGoal,
      ...savingsModal,
      amountPEN: parseFloat(savingsModal.amountPEN) || 0,
      amountUSD: parseFloat(savingsModal.amountUSD) || 0
    });
    setSavingsGoal(updated);
    setSavingsModal(null);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 3 HERO METRICS CARDS (Top Priority View - Pastel & High Contrast) */}
      <div id="tour-liquidity-heroes" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* HERO 1: Dinero Disponible Hoy */}
        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid #0284c7',
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Wallet size={15} color="#0284c7" /> Dinero Disponible Hoy
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd'
            }}>
              En Mano
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.4rem', letterSpacing: '-0.5px' }}>
            {formatMoney(availableCashTodayPEN, 'PEN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: '0.2rem 0 0 0' }}>
            Efectivo y cuentas operativas (Yape, Plin, BCP) con gastos ya restados.
          </p>
        </div>

        {/* HERO 2: Ahorros de Reserva Intocables */}
        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: '4px solid #15803d',
          background: '#ffffff',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <PiggyBank size={15} color="#15803d" /> Ahorros de Reserva
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0'
            }}>
              Intocables
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d', marginTop: '0.4rem', letterSpacing: '-0.5px' }}>
            {formatMoney(totalReserveSavingsInPEN, 'PEN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            S/ {reserveSavingsPEN.toFixed(2)} + $ {reserveSavingsUSD.toFixed(2)} USD protegidos
          </div>
        </div>

        {/* HERO 3: Liquidez Libre Proyectada (Dual: Mes 1 Inmediato vs Mes 2 Subsiguiente) */}
        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: `4px solid ${(activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#15803d' : '#be123c'}`,
          background: (activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#f0fdf4' : '#fff1f2',
          border: `1px solid ${(activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#bbf7d0' : '#fecdd3'}`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Selector Mes 1 vs Mes 2 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            <div style={{ display: 'inline-flex', background: '#ffffff', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setActiveLiquidityView('month1')}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeLiquidityView === 'month1' ? 'var(--primary)' : 'transparent',
                  color: activeLiquidityView === 'month1' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                1️⃣ Mes Inmediato
              </button>
              <button
                type="button"
                onClick={() => setActiveLiquidityView('month2')}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeLiquidityView === 'month2' ? '#be123c' : 'transparent',
                  color: activeLiquidityView === 'month2' ? '#ffffff' : 'var(--text-muted)'
                }}
                title="Impacto de lo que vas gastando hoy en la tarjeta de crédito"
              >
                2️⃣ Subsiguiente (TC)
              </button>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: (activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#dcfce7' : '#ffe4e6',
              color: (activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#15803d' : '#9f1239',
              border: `1px solid ${(activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#bbf7d0' : '#fecdd3'}`
            }}>
              {(activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>

          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: (activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#15803d' : '#be123c',
            marginTop: '0.2rem',
            letterSpacing: '-0.5px'
          }}>
            {formatMoney(activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2, 'PEN')}
          </div>

          <p style={{ fontSize: '0.74rem', color: (activeLiquidityView === 'month1' ? projectedFreeLiquidityMonth1 : projectedFreeLiquidityMonth2) >= 0 ? '#166534' : '#9f1239', marginTop: '0.25rem', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
            {activeLiquidityView === 'month1'
              ? 'Dinero real libre tras cobrar sueldos y pagar TC facturada, fijos y ahorro.'
              : `Alerta anticipada: Con tus compras de tarjeta acumuladas hoy (${formatMoney(creditCardNewPurchases.totalPurchasesInPEN, 'PEN')}), este será tu saldo libre en 2 meses.`}
          </p>
        </div>

      </div>

      {/* Summary Formula Bar (Dinámica según Mes 1 o Mes 2) */}
      <div className="card" style={{
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem 1.25rem',
        background: '#ffffff',
        border: '1px solid var(--border-color)'
      }}>
        {activeLiquidityView === 'month1' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem 1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>1. Saldo Hoy: </span>
              <strong style={{ color: 'var(--text-main)' }}>S/ {availableCashTodayPEN.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>2. Sueldos (+): </span>
              <strong style={{ color: '#15803d' }}>+ S/ {totalMonthlyIncomePEN.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>3. Fijos Pendientes (-): </span>
              <strong style={{ color: '#b45309' }}>- S/ {pendingFixedExpensesPEN.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>4. Deuda TC Facturada (-): </span>
              <strong style={{ color: tcConfig.isBilledPaidThisMonth ? '#15803d' : '#be123c' }}>
                {tcConfig.isBilledPaidThisMonth ? 'S/ 0.00 (Pagada ✓)' : `- S/ ${pendingBilledDebtInPEN.toFixed(2)}`}
              </strong>
            </div>
            {pendingSavingsInPEN > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>5. Ahorro Programado (-): </span>
                <strong style={{ color: '#0369a1' }}>- S/ {pendingSavingsInPEN.toFixed(2)}</strong>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem 1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>1. Sueldos Mes 2 (+): </span>
              <strong style={{ color: '#15803d' }}>+ S/ {totalMonthlyIncomePEN.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>2. Fijos Recurrentes (-): </span>
              <strong style={{ color: '#b45309' }}>- S/ {totalFixedExpensesPEN.toFixed(2)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>3. Compras TC de HOY (-): </span>
              <strong style={{ color: '#be123c' }}>- S/ {creditCardNewPurchases.totalPurchasesInPEN.toFixed(2)}</strong>
            </div>
            {totalPlannedSavingsInPEN > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>4. Ahorro Programado (-): </span>
                <strong style={{ color: '#0369a1' }}>- S/ {totalPlannedSavingsInPEN.toFixed(2)}</strong>
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          TC Ref: <strong style={{ color: 'var(--text-main)' }}>1 USD = S/ {exchangeRate.toFixed(3)}</strong>
        </div>
      </div>

      {/* SECTION TABS (Organized breakdown below hero numbers) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveSection('cuentas')}
          className={`tab-btn ${activeSection === 'cuentas' ? 'active' : ''}`}
          style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
        >
          <Coins size={16} />
          <span>Cuentas & Efectivo ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('ingresos')}
          className={`tab-btn ${activeSection === 'ingresos' ? 'active' : ''}`}
          style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
        >
          <TrendingUp size={16} />
          <span>Mis Sueldos ({incomes.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('fijos')}
          className={`tab-btn ${activeSection === 'fijos' ? 'active' : ''}`}
          style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
        >
          <Home size={16} />
          <span>Gastos Fijos & Ahorro ({fixedExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('tarjeta')}
          className={`tab-btn ${activeSection === 'tarjeta' ? 'active' : ''}`}
          style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
        >
          <CreditCard size={16} />
          <span>Tarjeta de Crédito & Deudas</span>
        </button>
      </div>

      {/* TAB 1: CUENTAS & EFECTIVO */}
      {activeSection === 'cuentas' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Building size={18} color="var(--primary)" />
                <span>Mis Cuentas, Billeteras y Efectivo</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Tus gastos diarios en Yape, Plin o Efectivo se descuentan de aquí en tiempo real.
              </p>
            </div>

            <button
              onClick={() => setAccountModal({
                id: '',
                name: '',
                type: 'banco',
                bank: 'BCP',
                currency: 'PEN',
                initial_balance: '',
                is_operating: true
              })}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} />
              <span>+ Agregar Cuenta / Fondo</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {accountsWithComputedBalances.map(acc => {
              const isUsd = acc.currency === 'USD';
              const isOperating = acc.is_operating;

              return (
                <div
                  key={acc.id}
                  className="card"
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: acc.type === 'tarjeta_credito' ? '#ffe4e6' : (isOperating ? '#e0f2fe' : '#dcfce7'),
                        color: acc.type === 'tarjeta_credito' ? '#9f1239' : (isOperating ? '#0369a1' : '#15803d'),
                        border: `1px solid ${acc.type === 'tarjeta_credito' ? '#fecdd3' : (isOperating ? '#bae6fd' : '#bbf7d0')}`
                      }}>
                        {acc.type === 'tarjeta_credito' ? 'Tarjeta de Crédito' : (isOperating ? 'Operativa (Día a día)' : 'Ahorro Reserva')}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.4rem 0 0.15rem 0' }}>
                        {acc.name}
                      </h4>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {acc.bank} • {isUsd ? 'Dólares ($)' : 'Soles (S/)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => setAccountModal(acc)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="Editar cuenta"
                      >
                        <Edit2 size={13} color="var(--primary)" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccountAction(acc.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.5rem' }}
                        title="Eliminar cuenta"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: acc.type === 'tarjeta_credito' ? '#be123c' : (isOperating ? 'var(--text-main)' : '#15803d'),
                        letterSpacing: '-0.5px'
                      }}>
                        {formatMoney(acc.computedBalance, acc.currency)}
                      </div>
                      {acc.debitedThisMonth > 0 && (
                        <span style={{
                          fontSize: '0.72rem',
                          color: '#b45309',
                          background: '#fffbeb',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #fde68a',
                          fontWeight: 700
                        }}>
                          - S/ {acc.debitedThisMonth.toFixed(2)} gastados
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Saldo base inicial: {formatMoney(acc.initial_balance, acc.currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MIS SUELDOS E INGRESOS */}
      {activeSection === 'ingresos' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0, fontWeight: 800 }}>
                <TrendingUp size={18} color="var(--success)" />
                <span>Mis Sueldos e Ingresos del Mes</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Configura tu sueldo en planilla, MYPE, honorarios o ingresos extra con cálculo de SUNAT y AFP.
              </p>
            </div>

            <button
              onClick={() => setIncomeModal({
                id: '',
                title: 'Sueldo Principal',
                currency: 'PEN',
                frequency: 'mensual',
                regime: 'planilla_general',
                pension_system_id: 'afp_integra',
                gross_salary: '3000',
                has_suspension_4ta: false,
                amount: '2619.30'
              })}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} />
              <span>+ Añadir Sueldo / Ingreso</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {incomes.map(inc => {
              const amt = parseFloat(inc.amount) || 0;
              const inSoles = inc.currency === 'USD' ? amt * exchangeRate : amt;
              const regime = inc.regime || (inc.currency === 'USD' ? 'neto_directo' : 'planilla_general');
              
              let regimeLabel = 'Planilla General (728)';
              let regimeColor = 'var(--primary)';
              let regimeBg = 'var(--primary-light)';

              if (regime === 'planilla_mype_pequena') {
                regimeLabel = 'MYPE Pequeña Empresa';
                regimeColor = '#7c3aed';
                regimeBg = 'rgba(124, 58, 237, 0.08)';
              } else if (regime === 'planilla_mype_micro') {
                regimeLabel = 'MYPE Microempresa';
                regimeColor = 'var(--accent-ant)';
                regimeBg = 'var(--accent-ant-light)';
              } else if (regime === 'honorarios') {
                regimeLabel = 'Honorarios (4ta)';
                regimeColor = 'var(--success)';
                regimeBg = 'var(--success-light)';
              } else if (regime === 'neto_directo') {
                regimeLabel = 'Neto Directo';
                regimeColor = 'var(--text-muted)';
                regimeBg = 'var(--bg-card-hover)';
              }

              return (
                <div key={inc.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                            {inc.title}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            background: regimeBg,
                            color: regimeColor
                          }}>
                            {regimeLabel}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {inc.currency === 'USD' ? '💵 Dólares ($)' : '🇵🇪 Soles (S/)'} • Frecuencia: {inc.frequency}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => setIncomeModal({
                            ...inc,
                            gross_salary: inc.gross_salary || inc.amount,
                            regime: inc.regime || (inc.currency === 'USD' ? 'neto_directo' : 'planilla_general'),
                            pension_system_id: inc.pension_system_id || 'afp_integra',
                            has_suspension_4ta: Boolean(inc.has_suspension_4ta)
                          })}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Editar sueldo / ingreso"
                        >
                          <Edit2 size={13} color="var(--primary)" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncomeAction(inc.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Eliminar ingreso"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                        Sueldo Neto Líquido en Cuenta:
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1.2 }}>
                        {formatMoney(amt, inc.currency)}
                      </div>
                      {inc.currency === 'USD' && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Equivalente en soles: ~S/ {inSoles.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {inc.gross_salary && inc.gross_salary > amt && (
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '0.55rem 0.75rem',
                      background: 'var(--bg-card-hover)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}>
                      <div>
                        <strong>Sueldo Bruto:</strong> S/ {parseFloat(inc.gross_salary).toFixed(2)}
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        Deducidos aportes de AFP/ONP y retención de SUNAT.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#a7f3d0' }}>
              Total Ingresos Estimados del Mes:
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
              {formatMoney(totalMonthlyIncomePEN, 'PEN')}
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: GASTOS FIJOS & AHORRO PLANIFICADO */}
      {activeSection === 'fijos' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Sub-pestañas: Gastos Fijos vs Ahorro Programado */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setFixedSubTab('fijos')}
              className={`chip ${fixedSubTab === 'fijos' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Home size={15} />
              <span>Gastos Fijos del Mes ({fixedExpenses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFixedSubTab('ahorro')}
              className={`chip ${fixedSubTab === 'ahorro' ? 'active' : ''}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <PiggyBank size={15} />
              <span>Plan de Ahorro Mensual {totalPlannedSavingsInPEN > 0 ? `(S/ ${totalPlannedSavingsInPEN.toFixed(0)})` : ''}</span>
            </button>
          </div>

          {fixedSubTab === 'fijos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0, fontWeight: 800 }}>
                    <Home size={18} color="var(--primary)" />
                    <span>Gastos Fijos del Mes (Proyectados)</span>
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Gastos fijos que pagas todos los meses (Alquiler, Luz, Agua, Internet, Suscripciones).
                  </p>
                </div>

                <button
                  onClick={() => setFixedModal({
                    id: '',
                    title: '',
                    amount: '',
                    currency: 'PEN',
                    due_day: 15,
                    is_paid: false
                  })}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem' }}
                >
                  <Plus size={15} />
                  <span>+ Añadir Gasto Fijo</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {fixedExpenses.map(fixed => {
                  const amt = parseFloat(fixed.amount) || 0;

                  return (
                    <div
                      key={fixed.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        background: fixed.is_paid ? '#f8fafc' : '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleFixedPaid(fixed)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: fixed.is_paid ? 'var(--success)' : 'var(--text-muted)',
                            padding: 0
                          }}
                          title={fixed.is_paid ? 'Marcar como pendiente' : 'Marcar como ya pagado este mes'}
                        >
                          {fixed.is_paid ? <CheckSquare size={22} color="#15803d" /> : <Square size={22} />}
                        </button>
                        <div>
                          <h4 style={{
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: fixed.is_paid ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: fixed.is_paid ? 'line-through' : 'none',
                            margin: 0
                          }}>
                            {fixed.title}
                          </h4>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Vence el día {fixed.due_day} • {fixed.is_paid ? 'Ya pagado este mes' : 'Pendiente de pago'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: fixed.is_paid ? 'var(--text-muted)' : 'var(--text-main)' }}>
                          {formatMoney(amt, fixed.currency)}
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => setFixedModal(fixed)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.5rem' }}
                            title="Editar gasto fijo"
                          >
                            <Edit2 size={13} color="var(--primary)" />
                          </button>
                          <button
                            onClick={() => handleDeleteFixedAction(fixed.id)}
                            className="btn btn-danger"
                            style={{ padding: '0.3rem 0.5rem' }}
                            title="Eliminar gasto fijo"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Total compromisos fijos: </span>
                  <strong style={{ color: 'var(--text-main)' }}>S/ {totalFixedExpensesPEN.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ color: '#15803d' }}>Ya pagado: </span>
                  <strong style={{ color: '#15803d' }}>S/ {paidFixedExpensesPEN.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ color: '#b45309' }}>Aún pendiente de pagar: </span>
                  <strong style={{ color: '#b45309' }}>S/ {pendingFixedExpensesPEN.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          {fixedSubTab === 'ahorro' && (
            <div className="animate-fade-in">
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <PiggyBank size={18} color="#15803d" />
                      Plan de Ahorro Mensual Programado
                    </span>
                    <h3 style={{ fontSize: '1.5rem', color: '#15803d', margin: '0.35rem 0 0 0', fontWeight: 800 }}>
                      {savingsPlanPEN > 0 ? `S/ ${savingsPlanPEN.toFixed(2)}` : ''}
                      {savingsPlanPEN > 0 && savingsPlanUSD > 0 ? ' + ' : ''}
                      {savingsPlanUSD > 0 ? `$ ${savingsPlanUSD.toFixed(2)} USD` : ''}
                      {savingsPlanPEN === 0 && savingsPlanUSD === 0 ? 'Sin meta programada aún' : ''}
                    </h3>
                    {totalPlannedSavingsInPEN > 0 && savingsPlanUSD > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#166534' }}>
                        Equivalente total consolidado: ~S/ {totalPlannedSavingsInPEN.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleToggleSavingsTransferred}
                      style={{
                        padding: '0.45rem 0.85rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: savingsGoal.isTransferredThisMonth ? '#bbf7d0' : '#86efac',
                        background: savingsGoal.isTransferredThisMonth ? '#dcfce7' : '#ffffff',
                        color: savingsGoal.isTransferredThisMonth ? '#15803d' : '#166534',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {savingsGoal.isTransferredThisMonth ? <Check size={14} color="#15803d" /> : <Clock size={14} color="#166534" />}
                      <span>{savingsGoal.isTransferredThisMonth ? 'Transferido a Reserva este mes ✓' : 'Pendiente de Transferir'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSavingsModal({
                        amountPEN: savingsGoal.amountPEN || '',
                        amountUSD: savingsGoal.amountUSD || '',
                        sourceIncomeId: savingsGoal.sourceIncomeId || '',
                        destinationAccountId: savingsGoal.destinationAccountId || ''
                      })}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      <Edit2 size={13} />
                      <span>Configurar Plan de Ahorro</span>
                    </button>
                  </div>
                </div>

                {/* Detalle de origen y destino */}
                <div className="grid-2" style={{ gap: '0.85rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bbf7d0' }}>
                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                      💼 Sueldo / Ingreso de Origen:
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.2rem', display: 'block' }}>
                      {incomes.find(i => i.id === savingsGoal.sourceIncomeId)?.title || 'Ingresos generales del mes'}
                    </strong>
                    {savingsPlanUSD > 0 && (
                      <span style={{ fontSize: '0.72rem', color: '#166534', marginTop: '0.15rem', display: 'block' }}>
                        💵 Los dólares se extraen directamente de tus ingresos en USD sin conversiones intermedias.
                      </span>
                    )}
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #dcfce7' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                      🏦 Cuenta de Destino (Reserva Intocable):
                    </span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '0.2rem', display: 'block' }}>
                      {accounts.find(a => a.id === savingsGoal.destinationAccountId)?.name || 'Ahorros de Reserva Intocables'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'block' }}>
                      {savingsGoal.isTransferredThisMonth ? '✓ Ya sumado a tus saldos protegidos.' : '⏳ Se sumará a tus reservas al transferirlo.'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.15rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                border: '1px solid var(--border-color)'
              }}>
                💡 <strong>Regla Financiera de Oro:</strong> El dinero que programas para ahorro no es un gasto, pero tampoco es liquidez libre para gastar en el día a día. Al registrarlo aquí, la aplicación lo aparta automáticamente de tu <strong>Liquidez Libre del Mes</strong>, protegiéndolo de compras impulsivas.
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: TARJETA DE CRÉDITO & DEUDAS */}
      {activeSection === 'tarjeta' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Encabezado y resumen de tarjeta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                <CreditCard size={18} color="#dc2626" />
                <span>Tarjeta de Crédito: Ciclo, Deuda y Consumos</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Distingue con total claridad lo que debes pagar este mes según tu estado de cuenta vs lo que vas gastando hoy para el mes subsiguiente.
              </p>
            </div>

            <button
              onClick={() => setTcModal({
                name: tcConfig.name || 'Tarjeta de Crédito Principal',
                bank: tcConfig.bank || 'BCP',
                closingDay: tcConfig.closingDay || 20,
                dueDay: tcConfig.dueDay || 5,
                billedDebtPEN: tcConfig.billedDebtPEN || '',
                billedDebtUSD: tcConfig.billedDebtUSD || '',
                paymentAccountPEN: tcConfig.paymentAccountPEN || '',
                paymentAccountUSD: tcConfig.paymentAccountUSD || ''
              })}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Edit2 size={13} />
              <span>⚙️ Configurar Tarjeta & Fechas</span>
            </button>
          </div>

          {/* Banner del Ciclo de Facturación en Vivo */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {tcConfig.name} ({tcConfig.bank}) • Corte: día {tcConfig.closingDay} | Último día de Pago: día {tcConfig.dueDay}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {!cycleInfo.isPastClosing
                    ? `📅 Ciclo actual en curso: Cierra en ${cycleInfo.daysUntilClosing} día(s) (el ${tcConfig.closingDay}). Vencerá el día ${tcConfig.dueDay} del próximo mes.`
                    : `📅 Ya cerró el corte del día ${tcConfig.closingDay}. Las compras que hagas hoy vencerán el día ${tcConfig.dueDay} del MES SUBSIGUIENTE.`}
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: !cycleInfo.isPastClosing ? '#e0f2fe' : '#fef3c7',
              color: !cycleInfo.isPastClosing ? '#0369a1' : '#92400e',
              border: `1px solid ${!cycleInfo.isPastClosing ? '#bae6fd' : '#fde68a'}`
            }}>
              {!cycleInfo.isPastClosing ? 'Antes del Corte' : 'Post-Corte (Próx. Ciclo)'}
            </span>
          </div>

          {/* 2 BLOQUES: DEUDA FACTURADA A PAGAR vs CONSUMOS NUEVOS DE HOY */}
          <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
            
            {/* BLOQUE A: Deuda del Último Estado de Cuenta (A pagar este mes) */}
            <div style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase' }}>
                    1. Deuda Facturada a Pagar (Mes Inmediato)
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: tcConfig.isBilledPaidThisMonth ? '#dcfce7' : '#ffe4e6',
                    color: tcConfig.isBilledPaidThisMonth ? '#15803d' : '#9f1239',
                    border: `1px solid ${tcConfig.isBilledPaidThisMonth ? '#bbf7d0' : '#fecdd3'}`
                  }}>
                    {tcConfig.isBilledPaidThisMonth ? 'Pagada este mes ✓' : `Vence el día ${tcConfig.dueDay}`}
                  </span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#be123c', letterSpacing: '-0.5px' }}>
                  {formatMoney(totalBilledDebtInPEN, 'PEN')}
                </div>
                {(billedDebtPEN > 0 || billedDebtUSD > 0) && (
                  <div style={{ fontSize: '0.78rem', color: '#9f1239', marginTop: '0.2rem', fontWeight: 600 }}>
                    S/ {billedDebtPEN.toFixed(2)} Soles {billedDebtUSD > 0 ? `+ $ ${billedDebtUSD.toFixed(2)} USD` : ''}
                  </div>
                )}

                {/* Cuentas de donde saldrá el pago */}
                <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid #fecdd3' }}>
                  <div style={{ fontSize: '0.74rem', color: '#9f1239', fontWeight: 600, marginBottom: '0.35rem' }}>
                    💳 Cuentas para Pagar esta Deuda:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.76rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Pago en Soles: </span>
                      <strong style={{ color: 'var(--text-main)' }}>
                        {accounts.find(a => a.id === tcConfig.paymentAccountPEN)?.name || 'Sin cuenta asignada'}
                      </strong>
                    </div>
                    {billedDebtUSD > 0 && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Pago en Dólares: </span>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {accounts.find(a => a.id === tcConfig.paymentAccountUSD)?.name || 'Sin cuenta asignada'}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de acción rápido */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleBilledPaid}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: tcConfig.isBilledPaidThisMonth ? '#bbf7d0' : '#fecdd3',
                    background: tcConfig.isBilledPaidThisMonth ? '#dcfce7' : '#ffffff',
                    color: tcConfig.isBilledPaidThisMonth ? '#15803d' : '#be123c',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {tcConfig.isBilledPaidThisMonth ? <Check size={14} color="#15803d" /> : <Clock size={14} color="#be123c" />}
                  <span>{tcConfig.isBilledPaidThisMonth ? '✓ Deuda Pagada este mes' : 'Marcar como Pagada este mes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTcModal({
                    name: tcConfig.name,
                    bank: tcConfig.bank,
                    closingDay: tcConfig.closingDay,
                    dueDay: tcConfig.dueDay,
                    billedDebtPEN: tcConfig.billedDebtPEN,
                    billedDebtUSD: tcConfig.billedDebtUSD,
                    paymentAccountPEN: tcConfig.paymentAccountPEN,
                    paymentAccountUSD: tcConfig.paymentAccountUSD
                  })}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 0.75rem', fontSize: '0.8rem' }}
                  title="Editar montos de estado de cuenta"
                >
                  <Edit2 size={13} />
                </button>
              </div>
            </div>

            {/* BLOQUE B: Consumos del Ciclo Actual en Curso (Lo que gastas HOY) */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                    2. Consumos Acumulados HOY (Ciclo en Curso)
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#dbeafe',
                    color: '#1e40af',
                    border: '1px solid #bfdbfe'
                  }}>
                    A pagar el Mes Subsiguiente
                  </span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.5px' }}>
                  {formatMoney(creditCardNewPurchases.totalPurchasesInPEN, 'PEN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e40af', marginTop: '0.2rem', fontWeight: 600 }}>
                  S/ {creditCardNewPurchases.purchasesPEN.toFixed(2)} Soles {creditCardNewPurchases.purchasesUSD > 0 ? `+ $ ${creditCardNewPurchases.purchasesUSD.toFixed(2)} USD` : ''}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  Compras registradas con "Tarjeta Crédito" este mes. Cerrarán el corte del día {tcConfig.closingDay} y <strong>afectarán tu liquidez en el mes subsiguiente</strong>.
                </p>
              </div>

              {/* Lista breve de compras */}
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Compras recientes del ciclo ({creditCardNewPurchases.purchasesList.length}):
                </div>
                {creditCardNewPurchases.purchasesList.length === 0 ? (
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay compras nuevas en este ciclo.
                  </div>
                ) : (
                  <div style={{ maxHeight: '90px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {creditCardNewPurchases.purchasesList.slice(0, 5).map(exp => (
                      <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                          {exp.description || exp.category}
                        </span>
                        <strong style={{ color: '#1d4ed8' }}>
                          {formatMoney(exp.amount, exp.currency)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
            border: '1px solid var(--border-color)'
          }}>
            💡 <strong>Consejo Financiero para no confundirte:</strong>
            <br />
            1. En <strong>"Deuda Facturada"</strong> anotas el monto que te llegó en tu último estado de cuenta y eliges con qué cuenta pagarlo.
            <br />
            2. Si luego registras boletas pasadas que ya estaban dentro de ese recibo, activa la casilla <strong>"📋 Gasto histórico"</strong> al registrar para que no se sumen dos veces.
            <br />
            3. Todo gasto nuevo que hagas con la tarjeta irá automáticamente a <strong>"Consumos Acumulados HOY"</strong> y lo pagarás en el mes subsiguiente.
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR O EDITAR CUENTA BANCARIA / EFECTIVO */}
      {accountModal && (
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
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '1.5rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setAccountModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
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

            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building size={18} color="var(--primary)" />
              <span>{accountModal.id ? 'Editar Cuenta' : 'Nueva Cuenta / Billetera / Efectivo'}</span>
            </h3>

            <form onSubmit={handleSaveAccountModal}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre / Identificador</label>
                <input
                  type="text"
                  value={accountModal.name}
                  onChange={(e) => setAccountModal({ ...accountModal, name: e.target.value })}
                  className="form-input"
                  placeholder="Ej: Yape BCP, Efectivo Billetera, Ahorro Soles..."
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Tipo de Cuenta</label>
                  <select
                    value={accountModal.type || 'banco'}
                    onChange={(e) => setAccountModal({ ...accountModal, type: e.target.value })}
                    className="form-select"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="billetera_digital">🟣 Billetera (Yape / Plin)</option>
                    <option value="banco">🏦 Cuenta Bancaria (Débito)</option>
                    <option value="ahorros">💰 Fondo de Ahorro</option>
                    <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Banco / Origen</label>
                  <select
                    value={accountModal.bank || 'BCP'}
                    onChange={(e) => setAccountModal({ ...accountModal, bank: e.target.value })}
                    className="form-select"
                  >
                    <option value="Efectivo">Efectivo</option>
                    {PERU_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Moneda</label>
                  <select
                    value={accountModal.currency || 'PEN'}
                    onChange={(e) => setAccountModal({ ...accountModal, currency: e.target.value })}
                    className="form-select"
                  >
                    <option value="PEN">🇵🇪 Soles (S/)</option>
                    <option value="USD">💵 Dólares ($)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Saldo Base Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountModal.initial_balance}
                    onChange={(e) => setAccountModal({ ...accountModal, initial_balance: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Cuenta operativa toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                cursor: 'pointer'
              }} onClick={() => setAccountModal({ ...accountModal, is_operating: !accountModal.is_operating })}>
                <input
                  type="checkbox"
                  checked={Boolean(accountModal.is_operating)}
                  onChange={(e) => setAccountModal({ ...accountModal, is_operating: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Cuenta Operativa (Día a día)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Actívalo para cuentas que usas frecuentemente (Yape, Efectivo, BCP). Desactívalo para tus Ahorros de reserva intocables.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAccountModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR O EDITAR SUELDO / INGRESO CON MOTOR PERUANO */}
      {incomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '540px',
            padding: '1.5rem',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <button
              onClick={() => setIncomeModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--bg-card-hover)',
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
              <X size={16} />
            </button>

            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800 }}>
                <Briefcase size={20} color="var(--primary)" />
                <span>{incomeModal.id ? 'Editar Sueldo / Ingreso' : 'Configurar Sueldo o Ingreso'}</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Cálculo automático y transparente de AFP/ONP y retención de SUNAT en Perú
              </p>
            </div>

            <form onSubmit={handleSaveIncomeModal}>
              
              {/* Concepto y Moneda */}
              <div className="grid-2" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    Concepto o Nombre
                  </label>
                  <input
                    type="text"
                    value={incomeModal.title}
                    onChange={(e) => setIncomeModal({ ...incomeModal, title: e.target.value })}
                    className="form-input"
                    placeholder="Ej: Sueldo Principal BCP, Freelance..."
                    required
                    style={{ fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    Moneda
                  </label>
                  <select
                    value={incomeModal.currency || 'PEN'}
                    onChange={(e) => setIncomeModal({ ...incomeModal, currency: e.target.value })}
                    className="form-select"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="PEN">🇵🇪 Soles (S/)</option>
                    <option value="USD">💵 Dólares ($)</option>
                  </select>
                </div>
              </div>

              {/* Modalidad Laboral / Régimen */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Receipt size={13} color="var(--primary)" />
                  <span>Modalidad Laboral / Régimen</span>
                </label>
                <select
                  value={incomeModal.regime || (incomeModal.currency === 'USD' ? 'neto_directo' : 'planilla_general')}
                  onChange={(e) => setIncomeModal({ ...incomeModal, regime: e.target.value })}
                  className="form-select"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="planilla_general">🏢 Planilla Régimen General (728) — Grati completa + CTS + AFP/ONP</option>
                  <option value="planilla_mype_pequena">🏬 Planilla Régimen MYPE (Pequeña Empresa) — Media Grati + Media CTS</option>
                  <option value="planilla_mype_micro">🏪 Planilla Régimen MYPE (Microempresa) — Solo AFP/ONP (Sin Grati/CTS)</option>
                  <option value="honorarios">📄 Recibos por Honorarios (4ta Categoría) — Retención 8% SUNAT</option>
                  <option value="neto_directo">💵 Monto Neto Directo — Sin retenciones calculadas (Remoto/Informal)</option>
                </select>
              </div>

              {/* Sueldo Bruto y Sistema de Pensión según régimen */}
              {incomeModal.regime !== 'neto_directo' && incomeModal.currency === 'PEN' ? (
                <>
                  <div className="grid-2" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                        {incomeModal.regime === 'honorarios' ? 'Monto Bruto del Recibo' : 'Sueldo Bruto Contratado'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          S/
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={incomeModal.gross_salary ?? incomeModal.amount ?? ''}
                          onChange={(e) => setIncomeModal({ ...incomeModal, gross_salary: e.target.value, amount: e.target.value })}
                          className="form-input"
                          placeholder="3000.00"
                          required
                          style={{ paddingLeft: '2.2rem', fontSize: '0.95rem', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    {incomeModal.regime !== 'honorarios' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                          Fondo de Pensión (AFP / ONP)
                        </label>
                        <select
                          value={incomeModal.pension_system_id || 'afp_integra'}
                          onChange={(e) => setIncomeModal({ ...incomeModal, pension_system_id: e.target.value })}
                          className="form-select"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <option value="afp_integra">AFP Integra (~12.7%)</option>
                          <option value="afp_prima">AFP Prima (~12.8%)</option>
                          <option value="afp_profuturo">AFP Profuturo (~13.0%)</option>
                          <option value="afp_habitat">AFP Habitat (~12.8%)</option>
                          <option value="onp">ONP - Sistema Nacional (13.0%)</option>
                          <option value="none">Sin Fondo de Pensión (0%)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Si es honorarios: Checkbox de Suspensión de 4ta */}
                  {incomeModal.regime === 'honorarios' && (
                    <div
                      onClick={() => setIncomeModal({ ...incomeModal, has_suspension_4ta: !incomeModal.has_suspension_4ta })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(incomeModal.has_suspension_4ta)}
                        onChange={(e) => setIncomeModal({ ...incomeModal, has_suspension_4ta: e.target.checked })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Cuento con Suspensión de 4ta Categoría de SUNAT (Form. 1609 - retención 0%)
                      </span>
                    </div>
                  )}

                  {/* DESGLOSE EN VIVO (Cálculo Perú) */}
                  {payrollPreview && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>🇵🇪 Desglose de tu Sueldo en Mano</span>
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          UIT S/ {PERU_UIT.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Sueldo Bruto:</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            S/ {payrollPreview.grossSalary.toFixed(2)}
                          </span>
                        </div>

                        {payrollPreview.pensionDeduction > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>
                              (-) Descuento Pensión ({payrollPreview.pensionName}):
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                              - S/ {payrollPreview.pensionDeduction.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            (-) {payrollPreview.taxName}:
                          </span>
                          <span style={{ fontWeight: 700, color: payrollPreview.taxDeduction > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {payrollPreview.taxDeduction > 0 ? `- S/ ${payrollPreview.taxDeduction.toFixed(2)}` : 'S/ 0.00'}
                          </span>
                        </div>

                        <div style={{
                          marginTop: '0.5rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline'
                        }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                            (=) Tu Sueldo Neto en Cuenta:
                          </span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--success)' }}>
                            S/ {payrollPreview.netSalary.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Beneficios adicionales si aplican */}
                      {payrollPreview.gratiEstimatedMonthly > 0 && (
                        <div style={{
                          marginTop: '0.65rem',
                          padding: '0.5rem 0.65rem',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                            🎁 Beneficios anuales por ley proyectados:
                          </div>
                          <div>
                            • Gratificaciones (Julio y Diciembre): ~S/ {((payrollPreview.grossSalary * (incomeModal.regime === 'planilla_general' ? 1.09 : 0.545))).toFixed(2)} cada una
                          </div>
                          <div>
                            • CTS (Mayo y Noviembre): ~S/ {(payrollPreview.ctsEstimatedMonthly * 12).toFixed(2)} al año
                          </div>
                        </div>
                      )}

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.45rem', fontStyle: 'italic' }}>
                        💡 {payrollPreview.summaryText}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Monto directo cuando es neto o dólares */
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                    Monto Neto Mensual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={incomeModal.amount}
                    onChange={(e) => setIncomeModal({ ...incomeModal, amount: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    required
                    style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Ingreso neto sin deducciones previsionales o tributarias de planilla peruana.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIncomeModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Sueldo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR O EDITAR GASTO FIJO */}
      {fixedModal && (
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
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div className="glass-card animate-fade-in" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '1.5rem',
            position: 'relative'
          }}>
            <button
              onClick={() => setFixedModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
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

            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Home size={18} color="var(--primary)" />
              <span>{fixedModal.id ? 'Editar Gasto Fijo' : 'Añadir Gasto Fijo Mensual'}</span>
            </h3>

            <form onSubmit={handleSaveFixedModal}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre del Servicio / Gasto</label>
                <input
                  type="text"
                  value={fixedModal.title}
                  onChange={(e) => setFixedModal({ ...fixedModal, title: e.target.value })}
                  className="form-input"
                  placeholder="Ej: Alquiler, Luz, Agua, Internet, Netflix..."
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Monto Mensual</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fixedModal.amount}
                    onChange={(e) => setFixedModal({ ...fixedModal, amount: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Día de Vencimiento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={fixedModal.due_day || 15}
                    onChange={(e) => setFixedModal({ ...fixedModal, due_day: e.target.value })}
                    className="form-input"
                    placeholder="Ej: 15"
                    required
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                cursor: 'pointer'
              }} onClick={() => setFixedModal({ ...fixedModal, is_paid: !fixedModal.is_paid })}>
                <input
                  type="checkbox"
                  checked={Boolean(fixedModal.is_paid)}
                  onChange={(e) => setFixedModal({ ...fixedModal, is_paid: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--success)' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Marcar como ya pagado en este mes
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFixedModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Gasto Fijo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN DE TARJETA DE CRÉDITO Y ESTADO DE CUENTA */}
      {tcModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '1.5rem',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setTcModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--bg-card-hover)',
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
              <X size={15} />
            </button>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <CreditCard size={18} color="#be123c" />
              <span>Configurar Tarjeta & Estado de Cuenta</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Define tu fecha de corte, fecha de pago y el saldo facturado exacto a cancelar este mes según tu banco.
            </p>

            <form onSubmit={handleSaveTcModal}>
              {/* Nombre y Banco */}
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Nombre de la Tarjeta</label>
                  <input
                    type="text"
                    value={tcModal.name}
                    onChange={(e) => setTcModal({ ...tcModal, name: e.target.value })}
                    className="form-input"
                    placeholder="Ej: BCP Visa Signature"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Banco Emisor</label>
                  <input
                    type="text"
                    value={tcModal.bank}
                    onChange={(e) => setTcModal({ ...tcModal, bank: e.target.value })}
                    className="form-input"
                    placeholder="Ej: BCP, BBVA, Interbank"
                    required
                  />
                </div>
              </div>

              {/* Días de Corte y Pago */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="var(--primary)" />
                  <span>Fechas Clave del Ciclo Bancario</span>
                </div>
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Día de Corte mensual</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={tcModal.closingDay}
                      onChange={(e) => setTcModal({ ...tcModal, closingDay: e.target.value })}
                      className="form-input"
                      placeholder="Ej: 20"
                      required
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                      Día que el banco cierra y emite tu recibo.
                    </span>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.74rem', marginBottom: '0.2rem' }}>Día Límite de Pago mensual</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={tcModal.dueDay}
                      onChange={(e) => setTcModal({ ...tcModal, dueDay: e.target.value })}
                      className="form-input"
                      placeholder="Ej: 5"
                      required
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                      Fecha límite para pagar sin intereses.
                    </span>
                  </div>
                </div>
              </div>

              {/* Deuda Facturada a Pagar (Mes Inmediato) */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9f1239', marginBottom: '0.35rem' }}>
                  Deuda Facturada según tu Estado de Cuenta (A pagar este mes)
                </div>
                <p style={{ fontSize: '0.72rem', color: '#881337', margin: '0 0 0.65rem 0', lineHeight: '1.35' }}>
                  Anota el monto total facturado a pagar este ciclo. <em>(Tus consumos nuevos posteriores al corte se computan aparte automáticamente para el mes subsiguiente)</em>.
                </p>

                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.74rem', color: '#9f1239' }}>Deuda en Soles (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tcModal.billedDebtPEN}
                      onChange={(e) => setTcModal({ ...tcModal, billedDebtPEN: e.target.value })}
                      className="form-input"
                      placeholder="0.00"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.74rem', color: '#9f1239' }}>Deuda en Dólares ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tcModal.billedDebtUSD}
                      onChange={(e) => setTcModal({ ...tcModal, billedDebtUSD: e.target.value })}
                      className="form-input"
                      placeholder="0.00"
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>

              {/* Cuenta de débito con que se pagará */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  ¿Con qué cuenta operativa pagarás la deuda de la tarjeta?
                </label>
                <select
                  value={tcModal.paymentAccountPEN || ''}
                  onChange={(e) => setTcModal({ ...tcModal, paymentAccountPEN: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">Seleccionar cuenta para pagar soles...</option>
                  {accountsWithComputedBalances.filter(a => a.is_operating && a.currency === 'PEN').map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bank}) - Saldo: S/ {((parseFloat(acc.computedBalance ?? acc.initial_balance)) || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Indica la cuenta de sueldo o débito de donde saldrá el dinero para cancelar este recibo.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTcModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Configuración</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN PLAN DE AHORRO MENSUAL */}
      {savingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem',
          overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-xl)',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setSavingsModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--bg-card-hover)',
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
              <X size={15} />
            </button>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <PiggyBank size={18} color="#15803d" />
              <span>Configurar Plan de Ahorro Mensual</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Define cuánto dinero separarás de tus ingresos hacia tu reserva intocable. Se descuenta de tu liquidez libre para no gastarlo.
            </p>

            <form onSubmit={handleSaveSavingsModal}>
              {/* Montos a ahorrar */}
              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', color: '#15803d' }}>
                    Ahorro en Soles (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={savingsModal.amountPEN}
                    onChange={(e) => setSavingsModal({ ...savingsModal, amountPEN: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    style={{ fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    Monto mensual a transferir a reserva.
                  </span>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', color: '#15803d' }}>
                    Ahorro en Dólares ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={savingsModal.amountUSD}
                    onChange={(e) => setSavingsModal({ ...savingsModal, amountUSD: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    style={{ fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    Directo sin conversión si tienes sueldo en USD.
                  </span>
                </div>
              </div>

              {/* Origen de los fondos */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  ¿De qué ingreso / sueldo se descontará este ahorro?
                </label>
                <select
                  value={savingsModal.sourceIncomeId || ''}
                  onChange={(e) => setSavingsModal({ ...savingsModal, sourceIncomeId: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">Cualquier ingreso disponible (general)</option>
                  {incomes.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      {inc.title} - {inc.currency === 'USD' ? `$ ${inc.amount} USD` : `S/ ${inc.amount}`} ({inc.regime || 'General'})
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  💡 Si seleccionas un sueldo en dólares, el ahorro se extrae directamente de esos dólares sin conversión forzada.
                </span>
              </div>

              {/* Destino de los fondos */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  ¿A qué cuenta de ahorro / reserva irá destinado?
                </label>
                <select
                  value={savingsModal.destinationAccountId || ''}
                  onChange={(e) => setSavingsModal({ ...savingsModal, destinationAccountId: e.target.value })}
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">Seleccionar cuenta de reserva...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.bank} • {acc.currency}) - {!acc.is_operating ? '🛡️ Reserva' : 'Operativa'}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Cuenta donde guardarás este dinero para que quede intocable.
                </span>
              </div>

              {/* Explicación de Liquidez */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                marginBottom: '1.25rem',
                fontSize: '0.74rem',
                color: '#166534',
                lineHeight: '1.4'
              }}>
                🔒 <strong>Impacto en tu liquidez:</strong> Como este dinero va a tu fondo de reserva, se resta de tu "Liquidez Libre para Gastar" del próximo mes. Así garantizas que no contarás con él para el día a día.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSavingsModal(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <Check size={16} />
                  <span>Guardar Plan de Ahorro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
