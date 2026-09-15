import React, { useState, useEffect } from 'react';
import {
  DEFAULT_CATEGORIES,
  getLimaNowIso,
  ANT_PRESETS_BY_CURRENCY,
  PAYMENT_METHODS,
  PERU_BANKS
} from '../lib/supabaseClient';
import {
  Bug,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  MapPin,
  Sparkles,
  ArrowRight
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
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [bank, setBank] = useState('');
  const [place, setPlace] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Sync if parent currency changes
  useEffect(() => {
    setFormCurrency(currentCurrency);
  }, [currentCurrency]);

  // Auto-vincular cuenta según método por defecto
  useEffect(() => {
    if (paymentMethod) {
      bindAccountByMethod(paymentMethod);
    }
  }, [accounts]);

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

  const handleToggleAnt = () => {
    const next = !isAntExpense;
    setIsAntExpense(next);
    if (next) {
      setCategory('gastos-hormiga');
    } else if (category === 'gastos-hormiga') {
      setCategory('otros');
    }
  };

  const bindAccountByMethod = (pmId) => {
    if (!pmId) {
      setSelectedAccountId('');
      return;
    }
    if (pmId === 'yape') {
      const acc = accounts.find(a => a.type === 'billetera_digital' && (a.name.toLowerCase().includes('yape') || a.id.includes('yape')));
      if (acc) {
        setSelectedAccountId(acc.id);
        setBank(acc.bank || 'BCP');
      }
    } else if (pmId === 'plin') {
      const acc = accounts.find(a => a.name.toLowerCase().includes('plin') || a.id.includes('plin'));
      if (acc) {
        setSelectedAccountId(acc.id);
        setBank(acc.bank || 'Interbank');
      }
    } else if (pmId === 'efectivo') {
      const acc = accounts.find(a => a.type === 'efectivo' || a.id.includes('efectivo'));
      if (acc) {
        setSelectedAccountId(acc.id);
        setBank('Efectivo');
      }
    } else if (pmId === 'credito') {
      const acc = accounts.find(a => a.type === 'tarjeta_credito' || a.id.includes('tc'));
      if (acc) {
        setSelectedAccountId(acc.id);
        setBank(acc.bank || 'BCP');
      }
    } else if (pmId === 'debito') {
      const acc = accounts.find(a => a.type === 'banco' || a.id.includes('debito'));
      if (acc) {
        setSelectedAccountId(acc.id);
        setBank(acc.bank || 'BCP');
      }
    }
  };

  const handlePaymentMethodSelect = (pmId) => {
    const nextPm = paymentMethod === pmId ? '' : pmId;
    setPaymentMethod(nextPm);
    bindAccountByMethod(nextPm);
  };

  const currentPresets = ANT_PRESETS_BY_CURRENCY[formCurrency] || ANT_PRESETS_BY_CURRENCY.PEN;

  const handleApplyPreset = (preset) => {
    setAmount(preset.amount.toString());
    setDescription(preset.desc || preset.label);
    setCategory('gastos-hormiga');
    setIsAntExpense(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const res = await onAddExpense({
      amount: parseFloat(amount),
      currency: formCurrency,
      category,
      description: description.trim(),
      is_ant_expense: isAntExpense,
      payment_method: paymentMethod || null,
      account_id: selectedAccountId || null,
      bank: bank || null,
      place: place.trim() || null,
      date: new Date(date).toISOString()
    });

    // Reset fields
    setAmount('');
    setDescription('');
    setPlace('');
    setShowAdvanced(false);

    if (res?.cloudError) {
      setSubmitStatus({
        type: 'warning',
        message: `Guardado localmente. Supabase avisó: ${res.cloudError}`
      });
    } else {
      setSubmitStatus({
        type: 'success',
        message: 'Gasto registrado correctamente'
      });
    }

    setTimeout(() => setSubmitStatus(null), 4000);
  };

  const currencySymbol = formCurrency === 'USD' ? '$' : 'S/';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Top Header: Title + Minimalist Currency Segmented Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Nuevo Gasto
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Registra en segundos y controla a dónde va tu dinero
            </p>
          </div>

          {/* Segmented Control */}
          <div className="currency-toggle-group">
            <button
              type="button"
              onClick={() => handleCurrencySelect('PEN')}
              className={`currency-btn ${formCurrency === 'PEN' ? 'soles-active' : 'inactive'}`}
              style={{ padding: '0.32rem 0.75rem', fontSize: '0.78rem' }}
            >
              <span>🇵🇪</span>
              <span>S/ Soles</span>
            </button>
            <button
              type="button"
              onClick={() => handleCurrencySelect('USD')}
              className={`currency-btn ${formCurrency === 'USD' ? 'usd-active' : 'inactive'}`}
              style={{ padding: '0.32rem 0.75rem', fontSize: '0.78rem' }}
            >
              <span>💵</span>
              <span>$ Dólares</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Hero Amount Field */}
          <div id="tour-amount-section" style={{
            background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-card-hover) 100%)',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1rem',
            transition: 'border-color 0.2s ease',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Monto a registrar
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                {formCurrency === 'USD' ? 'Dólares Americanos' : 'Soles Peruanos'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: formCurrency === 'USD' ? 'var(--success)' : 'var(--primary)',
                lineHeight: 1
              }}>
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.5px'
                }}
              />
            </div>
          </div>

          {/* Quick Presets: Sleek Horizontal Scrollable Pills */}
          <div id="tour-quick-presets" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem' }}>
              <Sparkles size={13} color="var(--accent-ant)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Atajos frecuentes de 1 toque:
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {currentPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    flexShrink: 0,
                    padding: '0.38rem 0.65rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  <span>{preset.label}</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {currencySymbol}{preset.amount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Category & Description In 2 Columns */}
          <div className="grid-2" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-select"
                style={{ padding: '0.65rem 0.8rem', fontSize: '0.85rem' }}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                Detalle o Nota
              </label>
              <input
                type="text"
                placeholder="Ej. Almuerzo menú, café..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                style={{ padding: '0.65rem 0.8rem', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Payment Method Direct Pills */}
          <div id="tour-payment-methods" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CreditCard size={13} color="var(--primary)" />
              <span>¿Cómo lo pagaste?</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
              {[
                { id: 'yape', label: 'Yape / Plin', icon: '🟣' },
                { id: 'efectivo', label: 'Efectivo', icon: '💵' },
                { id: 'debito', label: 'Débito', icon: '💳' },
                { id: 'credito', label: 'Crédito', icon: '💳' }
              ].map(pm => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => handlePaymentMethodSelect(pm.id)}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Inline Switch: Gasto Hormiga */}
          <div
            onClick={handleToggleAnt}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: isAntExpense ? 'var(--accent-ant-light)' : 'var(--bg-card-hover)',
              border: `1px solid ${isAntExpense ? 'var(--accent-ant)' : 'var(--border-color)'}`,
              marginBottom: '1rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: isAntExpense ? 'var(--accent-ant)' : 'var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Bug size={14} />
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Gasto hormiga
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                  Micro-compra del día que resta sin darte cuenta
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAntExpense}
              onChange={handleToggleAnt}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-ant)', cursor: 'pointer' }}
            />
          </div>

          {/* Collapsible: Opciones Adicionales (Cuenta, Establecimiento, Fecha) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.35rem 0',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{showAdvanced ? 'Ocultar opciones adicionales' : '+ Más opciones (Cuenta, lugar, fecha)'}</span>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div className="animate-fade-in" style={{
                marginTop: '0.65rem',
                padding: '0.85rem',
                background: 'var(--bg-card-hover)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {accounts.length > 0 && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Building size={12} color="var(--primary)" />
                      <span>Cuenta a debitar</span>
                    </label>
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem' }}
                    >
                      <option value="">Selección automática según método</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.bank}) — {acc.currency === 'USD' ? '$' : 'S/'} {parseFloat(acc.current_balance ?? acc.initial_balance ?? 0).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid-2" style={{ gap: '0.65rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} color="var(--text-muted)" />
                      <span>Lugar / Establecimiento</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Tambo, Metro, Grifo..."
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} color="var(--text-muted)" />
                      <span>Fecha y hora</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>
              {amount && parseFloat(amount) > 0
                ? `Registrar ${currencySymbol} ${parseFloat(amount).toFixed(2)}`
                : 'Registrar Gasto'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Toast / Status */}
        {submitStatus && (
          <div className="animate-fade-in" style={{
            marginTop: '0.85rem',
            padding: '0.75rem 0.9rem',
            background: submitStatus.type === 'warning' ? 'var(--warning-light)' : 'var(--success-light)',
            border: `1px solid ${submitStatus.type === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
            borderRadius: 'var(--radius-md)',
            color: submitStatus.type === 'warning' ? 'var(--warning)' : 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 600
          }}>
            {submitStatus.type === 'warning' ? (
              <AlertTriangle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
