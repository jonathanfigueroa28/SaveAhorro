import React, { useState } from 'react';
import {
  PlusCircle,
  Wallet,
  LayoutDashboard,
  History,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function GuidedTutorialModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Paso 1 de 4: Registro Rápido',
      title: 'Registra tus gastos en 3 segundos',
      icon: <PlusCircle size={26} color="#b45309" />,
      color: '#b45309',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Los <strong>gastos hormiga</strong> son compras pequeñas diarias (café al paso, pasajes, golosinas, antojitos) que parecen invisibles pero pueden sumar más de <strong>S/ 400 a S/ 600 cada mes</strong>.
          </p>
          <div style={{
            background: 'var(--accent-ant-bg)',
            border: '1px solid var(--accent-ant-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <Zap size={15} color="#b45309" /> Cómo registrar sin complicaciones:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#78350f', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Atajos rápidos:</strong> Toca un atajo frecuente (Café, Emoliente, Menú, Pasaje) para rellenar monto y categoría de inmediato.</li>
              <li><strong>Forma de pago:</strong> Elige si pagaste con Yape, Plin o Efectivo y se descontará de tu cuenta correspondiente en tiempo real.</li>
              <li><strong>Gasto hormiga:</strong> Mantén la casilla marcada para saber qué porcentaje de tu sueldo se va en micro-compras.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      badge: 'Paso 2 de 4: Cuentas & Ahorro',
      title: 'Tu dinero disponible y liquidez real proyectada',
      icon: <Wallet size={26} color="#059669" />,
      color: '#059669',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem' }}>
            En esta pestaña administras tus cuentas bancarias, billeteras digitales y sueldos para responder la pregunta más importante: <strong>¿cuánto dinero me queda de verdad?</strong>
          </p>
          <div style={{
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <ShieldCheck size={15} color="#059669" /> Los 3 indicadores clave:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#14532d', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Dinero Disponible Hoy:</strong> Tu efectivo y saldos operativos actuales listos para gastar hoy.</li>
              <li><strong>Ahorros de Reserva:</strong> Fondos protegidos en Soles o Dólares que no se deben tocar para compras diarias.</li>
              <li><strong>Liquidez Libre Próximo Mes:</strong> Cálculo automático que resta deudas de tarjeta de crédito y gastos fijos de tu próximo sueldo.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      badge: 'Paso 3 de 4: Dashboard & Gráficas',
      title: 'Control visual de tu presupuesto mensual',
      icon: <LayoutDashboard size={26} color="#2563eb" />,
      color: '#2563eb',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Visualiza el avance de tus finanzas en segundos, sin hojas de cálculo complejas ni fórmulas difíciles.
          </p>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              Lo que encontrarás en tu Dashboard:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#1e3a8a', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Termómetro de Presupuesto:</strong> Barra de estado que te avisa si estás en ritmo saludable o si te estás excediendo.</li>
              <li><strong>Gastos por Categoría:</strong> Gráfica circular para identificar si la comida, transporte o antojitos consumen la mayor parte.</li>
              <li><strong>Filtro de Moneda:</strong> Alterna entre Soles, Dólares o consolidado con tipo de cambio actualizado.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      badge: 'Paso 4 de 4: Historial de Gastos',
      title: 'Audita, filtra y edita cualquier movimiento',
      icon: <History size={26} color="#475569" />,
      color: '#475569',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Ten un registro cronológico completo de cada movimiento. Si te equivocaste de monto o banco al registrar, puedes corregirlo en cualquier momento.
          </p>
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
              Funciones útiles del Historial:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Búsqueda y Filtros:</strong> Encuentra compras por descripción, categoría, o forma de pago (Yape, Tarjeta, etc.).</li>
              <li><strong>Edición Rápida:</strong> Modifica el monto o elimina un registro erróneo con un solo toque.</li>
              <li><strong>Identificación Clara:</strong> Distingue de inmediato qué gastos correspondieron a gastos hormiga.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1400,
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '1.75rem',
        position: 'relative',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Cerrar tutorial"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem', paddingRight: '2rem' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: step === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: step === i ? currentStep.color : '#e2e8f0',
                transition: 'all 0.25s ease',
                cursor: 'pointer'
              }}
            />
          ))}
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 700 }}>
            {currentStep.badge}
          </span>
        </div>

        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: `${currentStep.color}15`,
            border: `1px solid ${currentStep.color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {currentStep.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: '1.3', color: 'var(--text-main)', margin: 0 }}>
              {currentStep.title}
            </h3>
          </div>
        </div>

        {/* Step Content */}
        {currentStep.content}

        {/* Footer Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.82rem',
              opacity: step === 0 ? 0.4 : 1,
              cursor: step === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.3rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.3rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'var(--success)',
                borderColor: 'var(--success)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Empezar a Usar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
