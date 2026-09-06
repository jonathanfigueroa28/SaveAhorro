import React, { useState, useEffect } from 'react';
import {
  DEFAULT_CATEGORIES,
  getLimaNowIso,
  ANT_PRESETS_BY_CURRENCY,
  CURRENCIES,
  PAYMENT_METHODS,
  PERU_BANKS
} from '../lib/supabaseClient';
import {
  Bug,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Cloud,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  MapPin
} from 'lucide-react';

export default function ExpenseForm({
  onAddExpense,
  categories = DEFAULT_CATEGORIES,
  currentCurrency = 'PEN',
  onCurrencyChange,
  accounts = []
}) {
  const [formCurrency, setFormCurrency] = useState(currentCurrency);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('gastos-hormiga');
  const [description, setDescription] = useState('');
  const [isAntExpense, setIsAntExpense] = useState(true);
  const [date, setDate] = useState(getLimaNowIso());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [bank, setBank] = useState('');
  const [place, setPlace] = useState('');
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showQuickPresets, setShowQuickPresets] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Sync if parent currency changes
  useEffect(() => {
    setFormCurrency(currentCurrency);
  }, [currentCurrency]);

  const handleCurrencySelect = (cur) => {
    setFormCurrency(cur);
    if (onCurrencyChange) {
      onCurrencyChange(cur);
    }
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (newCat === 'gastos-hormiga') {
      setIsAntExpense(true);
    } else {
      setIsAntExpense(false);
    }
  };

  const handleToggleAntExpense = (newChecked) => {
    setIsAntExpense(newChecked);
    if (newChecked) {
      setCategory('gastos-hormiga');
    } else {
      if (category === 'gastos-hormiga') {
        setCategory('otros');
      }
    }
  };

  const handlePaymentMethodSelect = (pmId) => {
    const nextPm = paymentMethod === pmId ? '' : pmId;
    setPaymentMethod(nextPm);

    if (!nextPm) {
      setSelectedAccountId('');
      return;
    }

    // Auto-vincular cuenta según método
    if (nextPm === 'yape') {
      const yapeAcc = accounts.find(a => a.type === 'billetera_digital' && (a.name.toLowerCase().includes('yape') || a.id.includes('yape')));
      if (yapeAcc) {
        setSelectedAccountId(yapeAcc.id);
        setBank(yapeAcc.bank || 'BCP');
      }
    } else if (nextPm === 'plin') {
      const plinAcc = accounts.find(a => a.name.toLowerCase().includes('plin') || a.id.includes('plin'));
      if (plinAcc) {
        setSelectedAccountId(plinAcc.id);
        setBank(plinAcc.bank || 'Interbank');
      }
    } else if (nextPm === 'efectivo') {
      const cashAcc = accounts.find(a => a.type === 'efectivo' || a.id.includes('efectivo'));
      if (cashAcc) {
        setSelectedAccountId(cashAcc.id);
        setBank('Efectivo');
      }
    } else if (nextPm === 'credito') {
      const tcAcc = accounts.find(a => a.type === 'tarjeta_credito' || a.id.includes('tc'));
      if (tcAcc) {
        setSelectedAccountId(tcAcc.id);
        setBank(tcAcc.bank || 'BCP');
      }
    } else if (nextPm === 'debito') {
      const debAcc = accounts.find(a => a.type === 'banco' || a.id.includes('debito'));
      if (debAcc) {
        setSelectedAccountId(debAcc.id);
        setBank(debAcc.bank || 'BCP');
      }
    }
  };

  const currentPresets = ANT_PRESETS_BY_CURRENCY[formCurrency] || ANT_PRESETS_BY_CURRENCY.PEN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const res = await onAddExpense({
      amount: parseFloat(amount),
      currency: formCurrency,
      category,
      description,
      is_ant_expense: isAntExpense,
      payment_method: paymentMethod || null,
      account_id: selectedAccountId || null,
      bank: bank || null,
      place: place || null,
      date: new Date(date).toISOString()
    });

    // Reset form fields
    setAmount('');
    setDescription('');
    setPaymentMethod('');
    setSelectedAccountId('');
    setBank('');
    setPlace('');
    setShowMoreDetails(false);

    if (res?.cloudError) {
      setSubmitStatus({
        type: 'warning',
        message: `Guardado en tu navegador, pero Supabase reportó: "${res.cloudError}". Recuerda ejecutar el script de permisos en Supabase SQL Editor.`
      });
    } else if (res?.isCloudEnabled) {
      setSubmitStatus({
        type: 'success',
        message: '¡Gasto guardado en tu base de datos de Supabase en la nube con éxito! ☁️✅'
      });
    } else {
      setSubmitStatus({
        type: 'success',
        message: '¡Gasto registrado localmente con éxito!'
      });
    }

    setTimeout(() => setSubmitStatus(null), 5000);
  };

  const handleApplyPreset = (preset) => {
    setAmount(preset.amount);
    setDescription(preset.desc);
    setCategory('gastos-hormiga');
    setIsAntExpense(true);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Registro Rápido</span>
              {isAntExpense && (
                <span className="badge badge-ant">
                  <Bug size={14} /> Gasto Hormiga
                </span>
              )}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <Clock size={13} color="var(--primary)" />
              <span>Hora de Lima, Perú (UTC-5)</span>
            </p>
          </div>

          {/* Currency Switcher in Form */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => handleCurrencySelect('PEN')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: formCurrency === 'PEN' ? 'var(--primary)' : 'transparent',
                color: formCurrency === 'PEN' ? '#fff' : 'var(--text-muted)'
              }}
            >
              🇵🇪 Soles (S/)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencySelect('USD')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                background: formCurrency === 'USD' ? 'var(--primary)' : 'transparent',
                color: formCurrency === 'USD' ? '#fff' : 'var(--text-muted)'
              }}
            >
              💵 Dólares ($)
            </button>
          </div>
        </div>

        {/* Quick Presets for "Gastos Hormiga" (Desplegable / Colapsable) */}
        <div style={{
          marginBottom: '1rem',
          background: 'rgba(245, 158, 11, 0.04)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(245, 158, 11, 0.18)',
          overflow: 'hidden'
        }}>
          <button
            type="button"
            onClick={() => setShowQuickPresets(!showQuickPresets)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#fef08a',
              fontFamily: 'inherit'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Atajos Rápidos de Gastos Hormiga 🐜</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(254, 240, 138, 0.7)' }}>({currentPresets.length} opciones)</span>
            </div>
            {showQuickPresets ? <ChevronUp size={16} color="#f59e0b" /> : <ChevronDown size={16} color="#f59e0b" />}
          </button>

          {showQuickPresets && (
            <div className="animate-fade-in" style={{ padding: '0.4rem 0.85rem 0.85rem 0.85rem', borderTop: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {currentPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chip chip-ant"
                    onClick={() => {
                      handleApplyPreset(preset);
                      setShowQuickPresets(false);
                    }}
                    style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.65rem' }}
                  >
                    <span>{preset.label}</span>
                    <span style={{ fontWeight: '700', color: '#fef08a' }}>
                      ({formCurrency === 'USD' ? '$' : 'S/'} {preset.amount})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field (Highlighted) */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Monto ({formCurrency === 'USD' ? '$ USD' : 'S/ PEN'})</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                Moneda: {formCurrency === 'USD' ? 'USD ($)' : 'PEN (S/)'}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: formCurrency === 'USD' ? '#10b981' : 'var(--primary)',
                fontWeight: '800',
                fontSize: '1.25rem'
              }}>
                {formCurrency === 'USD' ? '$' : 'S/'}
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: formCurrency === 'USD' ? '2.5rem' : '3.2rem',
                  fontSize: '1.6rem',
                  fontWeight: '700',
                  color: '#fff',
                  letterSpacing: '0.5px'
                }}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Description & Category in 1 row for ultra-fast entry */}
          <div className="grid-2" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Categoría</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
                style={{ padding: '0.75rem 0.9rem' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.82rem' }}>Detalle / Nota rápida</label>
              <input
                type="text"
                placeholder="Ej: Emoliente con pan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{ padding: '0.75rem 0.9rem' }}
              />
            </div>
          </div>

          {/* Gasto Hormiga Switch */}
          <div style={{
            background: isAntExpense ? 'var(--accent-ant-light)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isAntExpense ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => handleToggleAntExpense(!isAntExpense)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isAntExpense ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Bug size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: isAntExpense ? '#fef08a' : 'var(--text-main)' }}>
                  ¿Es un Gasto Hormiga? 🐜
                </strong>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Micro-gastos diarios (café, pasajes, golosinas, propinas)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAntExpense}
              onChange={(e) => handleToggleAntExpense(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          {/* Collapsible Button: "Más detalles (Opcional)" */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              style={{
                width: '100%',
                background: showMoreDetails ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 1rem',
                color: showMoreDetails ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{showMoreDetails ? '➖ Ocultar detalles adicionales' : '➕ Añadir más detalles opcionales (Método de pago, banco, lugar)'}</span>
              {showMoreDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Collapsible Details Content */}
            {showMoreDetails && (
              <div className="animate-fade-in" style={{
                marginTop: '0.75rem',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                {/* Método de Pago */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CreditCard size={14} color="var(--primary)" />
                    <span>Método de Pago (Auto-selecciona tu cuenta)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => handlePaymentMethodSelect(pm.id)}
                        className={`chip ${paymentMethod === pm.id ? 'active' : ''}`}
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        {pm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuenta o Fondo a debitar */}
                {accounts.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={14} color="var(--primary)" />
                      <span>Cuenta / Fondo a Debitar</span>
                    </label>
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.85rem', padding: '0.65rem' }}
                    >
                      <option value="">Seleccionar cuenta asociada (Opcional)</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bank}) — {acc.currency === 'USD' ? '$' : 'S/'} {parseFloat(acc.current_balance ?? acc.initial_balance ?? 0).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      💡 Si pagas con Yape o Efectivo, se descontará automáticamente de este saldo.
                    </span>
                  </div>
                )}

                {/* Banco (si es tarjeta o transferencia o elegido) */}
                {(paymentMethod === 'debito' || paymentMethod === 'credito' || paymentMethod === 'transferencia' || paymentMethod === 'otro') && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={14} color="#3b82f6" />
                      <span>Banco / Entidad Financiera</span>
                    </label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.85rem', padding: '0.65rem' }}
                    >
                      <option value="">Selecciona el banco (Opcional)</option>
                      {PERU_BANKS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Lugar / Comercio */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="#10b981" />
                    <span>Lugar / Establecimiento (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Tambo, Oxxo, Metro, Plaza Vea, Grifo Primax..."
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.65rem' }}
                  />
                </div>

                {/* Fecha y hora */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>Fecha y Hora (Hora de Lima UTC-5)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.85rem', padding: '0.65rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn ${isAntExpense ? 'btn-ant' : 'btn-primary'}`}
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', fontWeight: 700 }}
          >
            {isAntExpense ? '🐜 Registrar Gasto Hormiga' : '💾 Guardar Gasto'}
          </button>
        </form>

        {/* Toast Notification */}
        {submitStatus && (
          <div className="animate-fade-in" style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            background: submitStatus.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'var(--success-light)',
            border: `1px solid ${submitStatus.type === 'warning' ? '#f59e0b' : 'var(--success)'}`,
            borderRadius: 'var(--radius-md)',
            color: submitStatus.type === 'warning' ? '#fef08a' : '#a7f3d0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            fontSize: '0.875rem',
            lineHeight: '1.4'
          }}>
            {submitStatus.type === 'warning' ? (
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
