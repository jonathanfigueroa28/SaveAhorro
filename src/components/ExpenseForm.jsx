import React, { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../lib/supabaseClient';
import { Bug, DollarSign, Calendar, FileText, CheckCircle2, Sparkles, AlertTriangle, Cloud } from 'lucide-react';

const ANT_PRESETS = [
  { label: 'Café / Té ☕', amount: '2.50', desc: 'Café matutino / expreso' },
  { label: 'Snack / Galletas 🍪', amount: '1.80', desc: 'Snack / galletas' },
  { label: 'Agua / Soda 🥤', amount: '1.50', desc: 'Botella de agua / bebida' },
  { label: 'Pasaje corto 🚌', amount: '1.20', desc: 'Pasaje urbano / pasaje corto' },
  { label: 'Propina 🪙', amount: '1.00', desc: 'Propina o cambio' },
  { label: 'Chicles / Dulces 🍬', amount: '0.80', desc: 'Golosinas o dulces' },
];

export default function ExpenseForm({ onAddExpense, categories = DEFAULT_CATEGORIES }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('gastos-hormiga');
  const [description, setDescription] = useState('');
  const [isAntExpense, setIsAntExpense] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const res = await onAddExpense({
      amount: parseFloat(amount),
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
    <div className="animate-fade-in" style={{ maxWidth: '650px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '1.5rem 1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Nuevo Gasto</span>
              {isAntExpense && (
                <span className="badge badge-ant">
                  <Bug size={14} /> Gasto Hormiga
                </span>
              )}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Registra cualquier compra por pequeña que sea para controlar tu presupuesto.
            </p>
          </div>
        </div>

        {/* Quick Presets for "Gastos Hormiga" */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Acceso Rápido (Gastos Hormiga Frecuentes)</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.4rem' }}>
            {ANT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                className="chip chip-ant"
                onClick={() => handleApplyPreset(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field (Highlighted) */}
          <div className="form-group">
            <label className="form-label">Monto del Gasto ($)</label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary)',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                <DollarSign size={22} />
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
                  paddingLeft: '2.8rem',
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
