import React, { useState, useMemo, useEffect } from 'react';
import {
  formatMoney,
  formatLimaDate,
  PERU_BANKS,
  getLiquidityData,
  saveLiquidityData
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
  ChevronRight,
  X,
  Check
} from 'lucide-react';

export default function LiquidityManager({ expenses, exchangeRate = 3.75, currentCurrency = 'PEN' }) {
  const [liquidityConfig, setLiquidityConfig] = useState(getLiquidityData());
  const [editingSalary, setEditingSalary] = useState(false);
  const [tempSalary, setTempSalary] = useState('');
  const [editingCcDebt, setEditingCcDebt] = useState(false);
  const [tempCcDebt, setTempCcDebt] = useState('');
  
  // Modal for adding / editing bank account
  const [accountModal, setAccountModal] = useState(null); // null or account object

  // Save to local storage whenever config changes
  useEffect(() => {
    saveLiquidityData(liquidityConfig);
  }, [liquidityConfig]);

  // Current month expenses filter
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      const d = new Date(exp.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  // Real-time Credit Card expenses from the app this month
  const creditCardExpensesThisMonth = useMemo(() => {
    return currentMonthExpenses
      .filter(exp => exp.payment_method === 'credito')
      .reduce((sum, exp) => {
        const amt = parseFloat(exp.amount) || 0;
        const inSoles = exp.currency === 'USD' ? amt * exchangeRate : amt;
        return sum + inSoles;
      }, 0);
  }, [currentMonthExpenses, exchangeRate]);

  // Cash / Debit / Yape / Plin expenses this month (debited immediately from operating cash)
  const cashOperatingExpensesThisMonth = useMemo(() => {
    return currentMonthExpenses
      .filter(exp => exp.payment_method !== 'credito')
      .reduce((sum, exp) => {
        const amt = parseFloat(exp.amount) || 0;
        const inSoles = exp.currency === 'USD' ? amt * exchangeRate : amt;
        return sum + inSoles;
      }, 0);
  }, [currentMonthExpenses, exchangeRate]);

  // Calculate account balances
  const { operatingBalance, savingsPEN, savingsUSD, totalSavingsInPEN } = useMemo(() => {
    let opBalance = 0;
    let sPEN = 0;
    let sUSD = 0;

    (liquidityConfig.accounts || []).forEach(acc => {
      const bal = parseFloat(acc.balance) || 0;
      if (acc.isOperating) {
        opBalance += acc.currency === 'USD' ? bal * exchangeRate : bal;
      } else {
        if (acc.currency === 'USD') {
          sUSD += bal;
        } else {
          sPEN += bal;
        }
      }
    });

    return {
      operatingBalance: opBalance,
      savingsPEN: sPEN,
      savingsUSD: sUSD,
      totalSavingsInPEN: sPEN + (sUSD * exchangeRate)
    };
  }, [liquidityConfig.accounts, exchangeRate]);

  // Total credit card debt to be paid next month
  const totalCreditCardDebt = (parseFloat(liquidityConfig.creditCardInitialDebt) || 0) + creditCardExpensesThisMonth;

  // Expected salary / income
  const expectedSalary = parseFloat(liquidityConfig.expectedSalary) || 0;

  // Real Projected Operating Liquidity for Next Month
  // Formula: (Operating Balance + Salary) - (Cash/Debit Expenses) - (Credit Card Bill to pay next month)
  const projectedNetLiquidity = (operatingBalance + expectedSalary) - cashOperatingExpensesThisMonth - totalCreditCardDebt;

  // Total Real Net Worth (Liquidity + Untouchable Savings - Debts)
  const realNetWorth = (operatingBalance + totalSavingsInPEN + expectedSalary) - cashOperatingExpensesThisMonth - totalCreditCardDebt;

  // Handlers for quick edits
  const handleSaveSalary = () => {
    const val = parseFloat(tempSalary);
    if (!isNaN(val) && val >= 0) {
      setLiquidityConfig(prev => ({ ...prev, expectedSalary: val }));
    }
    setEditingSalary(false);
  };

  const handleSaveCcDebt = () => {
    const val = parseFloat(tempCcDebt);
    if (!isNaN(val) && val >= 0) {
      setLiquidityConfig(prev => ({ ...prev, creditCardInitialDebt: val }));
    }
    setEditingCcDebt(false);
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!accountModal) return;

    const updated = {
      ...accountModal,
      balance: parseFloat(accountModal.balance) || 0
    };

    setLiquidityConfig(prev => {
      const exists = prev.accounts.some(a => a.id === updated.id);
      let newAccounts;
      if (exists) {
        newAccounts = prev.accounts.map(a => a.id === updated.id ? updated : a);
      } else {
        newAccounts = [...prev.accounts, { ...updated, id: 'acc_' + Date.now() }];
      }
      return { ...prev, accounts: newAccounts };
    });

    setAccountModal(null);
  };

  const handleDeleteAccount = (id) => {
    if (liquidityConfig.accounts.length <= 1) {
      alert('Debes mantener al menos una cuenta registrada.');
      return;
    }
    setLiquidityConfig(prev => ({
      ...prev,
      accounts: prev.accounts.filter(a => a.id !== id)
    }));
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={24} color="var(--primary)" />
              <span>Control de Liquidez & Ahorro Real</span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Proyecta tu efectivo del próximo mes descontando tus gastos diarios y deudas en tarjeta de crédito, sin arriesgar tus ahorros de reserva.
            </p>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: '#e0e7ff'
          }}>
            <ArrowRightLeft size={13} color="var(--primary)" />
            <span>TC Mercado: <strong>1 USD = S/ {exchangeRate.toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      {/* HERO DIAGNOSTIC CARD: PROYECCIÓN DE LIQUIDEZ REAL DEL PRÓXIMO MES */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: projectedNetLiquidity >= 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
        background: projectedNetLiquidity >= 0 
          ? 'radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.12), rgba(18, 24, 40, 0.85))'
          : 'radial-gradient(ellipse at top right, rgba(239, 68, 68, 0.12), rgba(18, 24, 40, 0.85))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: projectedNetLiquidity >= 0 ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              {projectedNetLiquidity >= 0 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {projectedNetLiquidity >= 0 ? 'Liquidez Operativa Saludable' : 'Alerta: Déficit de Liquidez Próximo Mes'}
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 800, color: projectedNetLiquidity >= 0 ? '#fff' : '#fca5a5', marginTop: '0.25rem' }}>
              {formatMoney(projectedNetLiquidity, 'PEN')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Efectivo libre proyectado para el próximo mes (tras pagar sueldo, gastos corrientes y tarjeta de crédito).
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            textAlign: 'right',
            minWidth: '220px'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ahorros de Reserva Intactos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.2rem' }}>
              {formatMoney(totalSavingsInPEN, 'PEN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              S/ {savingsPEN.toFixed(2)} + $ {savingsUSD.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Diagnostic Explanation Banner */}
        <div style={{
          background: projectedNetLiquidity >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          borderLeft: `4px solid ${projectedNetLiquidity >= 0 ? 'var(--success)' : 'var(--danger)'}`,
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.45',
          color: '#e2e8f0'
        }}>
          {projectedNetLiquidity >= 0 ? (
            <span>
              🟢 <strong>¡Tus ahorros están protegidos!</strong> Tu sueldo y saldo operativo cubren todos tus gastos de este mes y el pago total de tu tarjeta de crédito. No necesitarás tocar tus fondos de ahorro de reserva (los S/ {savingsPEN.toFixed(2)} y $ {savingsUSD.toFixed(2)} permanecen a salvo).
            </span>
          ) : (
            <span>
              🔴 <strong>¡Atención!</strong> Tus gastos actuales y compras con tarjeta de crédito superan tus ingresos del mes por <strong>S/ {Math.abs(projectedNetLiquidity).toFixed(2)}</strong>. Para cancelar la tarjeta de crédito el próximo mes y evitar intereses, tendrías que retirar <strong>S/ {Math.abs(projectedNetLiquidity).toFixed(2)}</strong> de tus ahorros en soles o vender aprox. <strong>$ {Math.abs(projectedNetLiquidity / exchangeRate).toFixed(2)} USD</strong>.
            </span>
          )}
        </div>

        {/* Formula breakdown flow */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.8rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>1. Cuenta Principal (Hoy):</span>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>S/ {operatingBalance.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>2. Sueldo del Mes (+):</span>
            <strong style={{ color: 'var(--success)', fontSize: '0.95rem' }}>+ S/ {expectedSalary.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>3. Gastos Efectivo/Débito (-):</span>
            <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>- S/ {cashOperatingExpensesThisMonth.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>4. Tarjeta de Crédito (-):</span>
            <strong style={{ color: 'var(--danger)', fontSize: '0.95rem' }}>- S/ {totalCreditCardDebt.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* KPI CARDS: SUELDO & TARJETA DE CRÉDITO */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        
        {/* Sueldo / Ingresos del Mes */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <TrendingUp size={16} color="var(--success)" /> Sueldo Mensual Estimado
            </span>
            {!editingSalary ? (
              <button
                onClick={() => {
                  setTempSalary(expectedSalary.toString());
                  setEditingSalary(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
              >
                <Edit2 size={12} /> Editar
              </button>
            ) : (
              <button
                onClick={handleSaveSalary}
                className="btn btn-primary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                <Check size={12} /> Guardar
              </button>
            )}
          </div>

          {!editingSalary ? (
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--success)' }}>
              {formatMoney(expectedSalary, 'PEN')}
            </div>
          ) : (
            <input
              type="number"
              value={tempSalary}
              onChange={(e) => setTempSalary(e.target.value)}
              className="form-input"
              style={{ fontSize: '1.2rem', padding: '0.4rem 0.65rem', marginTop: '0.25rem' }}
              autoFocus
            />
          )}
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Ingreso que recibirás este mes para cubrir tus gastos y liquidar la tarjeta de crédito.
          </p>
        </div>

        {/* Deuda en Tarjeta de Crédito (Automática del mes + previa) */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CreditCard size={16} color="var(--danger)" /> Deuda Tarjeta de Crédito Próx. Mes
            </span>
            {!editingCcDebt ? (
              <button
                onClick={() => {
                  setTempCcDebt((liquidityConfig.creditCardInitialDebt || 0).toString());
                  setEditingCcDebt(true);
                }}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                title="Ajustar saldo inicial de corte"
              >
                <Edit2 size={12} /> Ajustar Base
              </button>
            ) : (
              <button
                onClick={handleSaveCcDebt}
                className="btn btn-primary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                <Check size={12} /> Guardar
              </button>
            )}
          </div>

          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--danger)' }}>
            {formatMoney(totalCreditCardDebt, 'PEN')}
          </div>

          {!editingCcDebt ? (
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              S/ {creditCardExpensesThisMonth.toFixed(2)} de gastos con TC este mes {liquidityConfig.creditCardInitialDebt > 0 && `+ S/ ${liquidityConfig.creditCardInitialDebt} de corte previo`}.
            </p>
          ) : (
            <div style={{ marginTop: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deuda base previa de tarjeta (S/):</label>
              <input
                type="number"
                value={tempCcDebt}
                onChange={(e) => setTempCcDebt(e.target.value)}
                className="form-input"
                style={{ fontSize: '1rem', padding: '0.3rem 0.6rem', marginTop: '0.2rem' }}
              />
            </div>
          )}
        </div>

      </div>

      {/* SECCIÓN DE CUENTAS BANCARIAS Y FONDOS DE AHORRO */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building size={18} color="var(--primary)" />
              <span>Mis Cuentas & Fondos de Reserva</span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Registra tus cuentas corrientes y tus ahorros a plazo o reserva en Soles y Dólares.
            </p>
          </div>

          <button
            onClick={() => setAccountModal({
              id: '',
              name: '',
              bank: 'BCP',
              currency: 'PEN',
              balance: '',
              isOperating: false
            })}
            className="btn btn-primary"
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem' }}
          >
            <Plus size={16} />
            <span>+ Agregar Cuenta</span>
          </button>
        </div>

        {/* Lista de Cuentas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {(liquidityConfig.accounts || []).map(acc => {
            const isUsd = acc.currency === 'USD';
            const bal = parseFloat(acc.balance) || 0;
            const balInSoles = isUsd ? bal * exchangeRate : bal;

            return (
              <div
                key={acc.id}
                style={{
                  background: acc.isOperating ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${acc.isOperating ? 'rgba(99, 102, 241, 0.3)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: acc.isOperating ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: '#fff'
                    }}>
                      {acc.isOperating ? 'Cuenta Principal (Día a día)' : 'Ahorro de Reserva'}
                    </span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', marginTop: '0.4rem' }}>
                      {acc.name || 'Cuenta Bancaria'}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Banco: {acc.bank} • {isUsd ? '💵 Dólares ($)' : '🇵🇪 Soles (S/)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => setAccountModal(acc)}
                      className="btn btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                      title="Editar cuenta"
                    >
                      <Edit2 size={13} color="var(--primary)" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                      title="Eliminar cuenta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isUsd ? '#10b981' : '#fff' }}>
                    {formatMoney(bal, acc.currency)}
                  </div>
                  {isUsd && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Equivalente: ~S/ {balInSoles.toFixed(2)} (TC {exchangeRate.toFixed(3)})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA AGREGAR O EDITAR CUENTA BANCARIA */}
      {accountModal && (
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
              <span>{accountModal.id ? 'Editar Cuenta' : 'Agregar Cuenta Bancaria'}</span>
            </h3>

            <form onSubmit={handleSaveAccount}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre / Identificador</label>
                <input
                  type="text"
                  value={accountModal.name}
                  onChange={(e) => setAccountModal({ ...accountModal, name: e.target.value })}
                  className="form-input"
                  placeholder="Ej: Ahorro BBVA, BCP Sueldo..."
                  required
                />
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Banco</label>
                  <select
                    value={accountModal.bank}
                    onChange={(e) => setAccountModal({ ...accountModal, bank: e.target.value })}
                    className="form-select"
                  >
                    {PERU_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Moneda</label>
                  <select
                    value={accountModal.currency}
                    onChange={(e) => setAccountModal({ ...accountModal, currency: e.target.value })}
                    className="form-select"
                  >
                    <option value="PEN">🇵🇪 Soles (S/)</option>
                    <option value="USD">💵 Dólares ($)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Saldo Actual Disponible</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={accountModal.balance}
                  onChange={(e) => setAccountModal({ ...accountModal, balance: e.target.value })}
                  className="form-input"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Tipo de Cuenta: Principal Operativa vs Reserva */}
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
              }} onClick={() => setAccountModal({ ...accountModal, isOperating: !accountModal.isOperating })}>
                <input
                  type="checkbox"
                  checked={Boolean(accountModal.isOperating)}
                  onChange={(e) => setAccountModal({ ...accountModal, isOperating: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Marcar como Cuenta Principal Operativa
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Es la cuenta con la que pagas el día a día. Si no la marcas, se considerará fondo de ahorro de reserva intocable.
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

    </div>
  );
}
