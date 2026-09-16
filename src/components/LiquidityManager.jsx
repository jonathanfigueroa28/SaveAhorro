import React, { useState, useMemo } from 'react';
import {
  formatMoney,
  PERU_BANKS,
  saveAccount,
  deleteAccount,
  saveIncome,
  deleteIncome,
  saveFixedExpense,
  deleteFixedExpense
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
  Percent
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
  const [creditCardBaseDebt, setCreditCardBaseDebt] = useState(() => {
    return parseFloat(localStorage.getItem('saveahorro_tc_base_debt') || '0');
  });
  const [editingTcBase, setEditingTcBase] = useState(false);
  const [tempTcBase, setTempTcBase] = useState('');

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

  // 6. Credit Card Debts calculation
  const creditCardExpensesThisMonth = useMemo(() => {
    return currentMonthExpenses
      .filter(exp => exp.payment_method === 'credito')
      .reduce((sum, exp) => {
        const amt = parseFloat(exp.amount) || 0;
        return sum + (exp.currency === 'USD' ? amt * exchangeRate : amt);
      }, 0);
  }, [currentMonthExpenses, exchangeRate]);

  const totalCreditCardBillNextMonth = creditCardBaseDebt + creditCardExpensesThisMonth;

  // 7. HERO NUMBER: Projected Net Free Operating Liquidity for Next Month
  // Formula: (Dinero Disponible Hoy + Sueldos del Mes) - (Gastos Fijos Pendientes) - (Tarjeta de Crédito a pagar)
  const projectedFreeLiquidityNextMonth = (availableCashTodayPEN + totalMonthlyIncomePEN) - pendingFixedExpensesPEN - totalCreditCardBillNextMonth;

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

  const handleSaveTcBase = () => {
    const val = parseFloat(tempTcBase) || 0;
    setCreditCardBaseDebt(val);
    localStorage.setItem('saveahorro_tc_base_debt', val.toString());
    setEditingTcBase(false);
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 3 HERO METRICS CARDS (Top Priority View - Pastel & High Contrast) */}
      <div id="tour-liquidity-heroes" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
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

        {/* HERO 3: Liquidez Libre Proyectada del Próximo Mes (Pastel Suave, sin degradado oscuro) */}
        <div className="card" style={{
          padding: '1.25rem',
          borderLeft: `4px solid ${projectedFreeLiquidityNextMonth >= 0 ? '#15803d' : '#be123c'}`,
          background: projectedFreeLiquidityNextMonth >= 0 ? '#f0fdf4' : '#fff1f2',
          border: `1px solid ${projectedFreeLiquidityNextMonth >= 0 ? '#bbf7d0' : '#fecdd3'}`,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: projectedFreeLiquidityNextMonth >= 0 ? '#166534' : '#9f1239',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              {projectedFreeLiquidityNextMonth >= 0 ? <CheckCircle2 size={15} color="#15803d" /> : <AlertTriangle size={15} color="#be123c" />}
              Liquidez Libre Próx. Mes
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              background: projectedFreeLiquidityNextMonth >= 0 ? '#dcfce7' : '#ffe4e6',
              color: projectedFreeLiquidityNextMonth >= 0 ? '#15803d' : '#9f1239',
              border: `1px solid ${projectedFreeLiquidityNextMonth >= 0 ? '#bbf7d0' : '#fecdd3'}`
            }}>
              {projectedFreeLiquidityNextMonth >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: projectedFreeLiquidityNextMonth >= 0 ? '#15803d' : '#be123c',
            marginTop: '0.4rem',
            letterSpacing: '-0.5px'
          }}>
            {formatMoney(projectedFreeLiquidityNextMonth, 'PEN')}
          </div>
          <p style={{ fontSize: '0.75rem', color: projectedFreeLiquidityNextMonth >= 0 ? '#166534' : '#9f1239', marginTop: '0.2rem', margin: '0.2rem 0 0 0' }}>
            Dinero real que te sobrará tras cobrar sueldos y pagar TC y gastos fijos.
          </p>
        </div>

      </div>

      {/* Summary Formula Bar (Pastel Claro y Legible) */}
      <div className="card" style={{
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        fontSize: '0.82rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: '#ffffff',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>1. Saldo Hoy: </span>
            <strong style={{ color: 'var(--text-main)' }}>S/ {availableCashTodayPEN.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>2. Sueldos (+): </span>
            <strong style={{ color: '#15803d' }}>+ S/ {totalMonthlyIncomePEN.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>3. Gastos Fijos Pendientes (-): </span>
            <strong style={{ color: '#b45309' }}>- S/ {pendingFixedExpensesPEN.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>4. Tarjeta Crédito (-): </span>
            <strong style={{ color: '#be123c' }}>- S/ {totalCreditCardBillNextMonth.toFixed(2)}</strong>
          </div>
        </div>

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
          <span>Gastos Fijos del Mes ({fixedExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('tarjeta')}
          className={`tab-btn ${activeSection === 'tarjeta' ? 'active' : ''}`}
          style={{ padding: '0.55rem 1rem', fontSize: '0.84rem' }}
        >
          <CreditCard size={16} />
          <span>Tarjeta de Crédito</span>
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

      {/* TAB 3: GASTOS FIJOS DEL MES */}
      {activeSection === 'fijos' && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Home size={18} color="var(--primary)" />
                <span>Gastos Fijos del Mes (Proyectados)</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                    border: `1px solid ${fixed.is_paid ? 'var(--border-color)' : 'var(--border-color)'}`,
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
                      >
                        <Edit2 size={13} color="var(--primary)" />
                      </button>
                      <button
                        onClick={() => handleDeleteFixedAction(fixed.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.5rem' }}
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

      {/* TAB 4: TARJETA DE CRÉDITO & DEUDAS (Pastel Coral/Rose) */}
      {activeSection === 'tarjeta' && (
        <div className="card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>
                <CreditCard size={18} color="#dc2626" />
                <span>Tarjeta de Crédito a Pagar el Próximo Mes</span>
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Se calcula automáticamente sumando todos los gastos que registraste con "Tarjeta Crédito" este mes.
              </p>
            </div>

            {!editingTcBase ? (
              <button
                onClick={() => {
                  setTempTcBase(creditCardBaseDebt.toString());
                  setEditingTcBase(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
              >
                <Edit2 size={13} />
                <span>Ajustar Deuda de Corte Previa</span>
              </button>
            ) : (
              <button
                onClick={handleSaveTcBase}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem' }}
              >
                <Check size={13} />
                <span>Guardar Saldo</span>
              </button>
            )}
          </div>

          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#9f1239', fontWeight: 700 }}>
              Total Deuda Tarjeta de Crédito Próx. Mes:
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#be123c', marginTop: '0.25rem', letterSpacing: '-0.5px' }}>
              {formatMoney(totalCreditCardBillNextMonth, 'PEN')}
            </div>

            {editingTcBase ? (
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Saldo previo de tu último estado de cuenta de la tarjeta (S/):
                </label>
                <input
                  type="number"
                  value={tempTcBase}
                  onChange={(e) => setTempTcBase(e.target.value)}
                  className="form-input"
                  style={{ maxWidth: '240px', marginTop: '0.25rem', fontSize: '0.95rem' }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Desglose: S/ {creditCardExpensesThisMonth.toFixed(2)} compras del mes {creditCardBaseDebt > 0 && `+ S/ ${creditCardBaseDebt.toFixed(2)} corte anterior`}.
              </div>
            )}
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
            💡 <strong>Consejo de Ahorro:</strong> Cada vez que registras un gasto eligiendo "Tarjeta Crédito", se acumula automáticamente en esta cuenta para que nunca te sorprenda el recibo del banco ni pagues intereses.
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

    </div>
  );
}
