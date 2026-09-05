import React, { useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES, getLimaNowIso, ANT_PRESETS_BY_CURRENCY, CURRENCIES } from '../lib/supabaseClient';
import { Bug, DollarSign, Calendar, FileText, CheckCircle2, Sparkles, AlertTriangle, Cloud, Clock } from 'lucide-react';

export default function ExpenseForm({ onAddExpense, categories = DEFAULT_CATEGORIES, currentCurrency = 'PEN' }) {
  const [formCurrency, setFormCurrency] = useState(currentCurrency);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('gastos-hormiga');
  const [description, setDescription] = useState('');
  const [isAntExpense, setIsAntExpense] = useState(true);
  const [date, setDate] = useState(getLimaNowIso());
  const [submitStatus, setSubmitStatus] = useState(null);

  // Sync if parent currency changes
  useEffect(() => {
    setFormCurrency(currentCurrency);
  }, [currentCurrency]);

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
      date: new Date(date).toISOString()
    });

    // Reset form fields
    setAmount('');
    setDescription('');

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
      <div className="glass-card" style={{ padding: '1.5rem 1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Nuevo Gasto</span>
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
              onClick={() => setFormCurrency('PEN')}
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
              onClick={() => setFormCurrency('USD')}
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

        {/* Quick Presets for "Gastos Hormiga" */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fef08a', marginBottom: '0.5rem' }}>
            <Sparkles size={15} color="#f59e0b" />
            <span>Accesos Rápidos Populares ({formCurrency === 'PEN' ? 'Soles S/' : 'Dólares $'})</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {currentPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="chip chip-ant"
                onClick={() => handleApplyPreset(preset)}
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <span>{preset.label}</span>
                <span style={{ fontWeight: '700', color: '#fef08a' }}>
                  ({formCurrency === 'USD' ? '$' : 'S/'} {preset.amount})
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field (Highlighted) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Monto del Gasto en {formCurrency === 'USD' ? 'Dólares ($ USD)' : 'Soles (S/ PEN)'}</span>
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
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#fff',
                  letterSpacing: '0.5px'
                }}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Gasto Hormiga Switch */}
          <div style={{
            background: isAntExpense ? 'var(--accent-ant-light)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isAntExpense ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }} onClick={() => setIsAntExpense(!isAntExpense)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isAntExpense ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Bug size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: isAntExpense ? '#fef08a' : 'var(--text-main)' }}>
                  ¿Es un Gasto Hormiga? 🐜
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Micro-gastos diarios (café, antojitos, propinas, comisiones)
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAntExpense}
              onChange={(e) => setIsAntExpense(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Category Field */}
            <div>
              <label className="form-label">Categoría</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value === 'gastos-hormiga') {
                    setIsAntExpense(true);
                  }
                }}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Field */}
            <div>
              <label className="form-label">Fecha y Hora</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label className="form-label">Descripción / Nota (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Cafe con empanada en la esquina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn ${isAntExpense ? 'btn-ant' : 'btn-primary'}`}
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
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
