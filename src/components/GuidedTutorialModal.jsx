import React, { useState } from 'react';
import { Bug, Zap, LayoutDashboard, CreditCard, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, X, Sparkles } from 'lucide-react';

export default function GuidedTutorialModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Paso 1 de 3: Registro en 3 Segundos',
      title: 'Atrapa a los "Gastos Hormiga" antes de que se coman tu sueldo 🐜',
      icon: <Zap size={28} color="#f59e0b" />,
      color: '#f59e0b',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '1rem' }}>
            Los <strong>gastos hormiga</strong> son esas moneditas diarias que casi ni sientes: el café de la esquina, el pasaje en combi, la gaseosa o el antojito de media tarde. Aunque parecen insignificantes, <strong>pueden quitarte entre S/ 300 y S/ 600 cada mes</strong>.
          </p>
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Sparkles size={15} color="#f59e0b" /> ¿Cómo registrarlos sin aburrirte?
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              <li>Toca cualquiera de los <strong>Atajos Rápidos</strong> (☕ Café, 🍵 Emoliente, 🚊 Metropolitano, 🚕 Taxi).</li>
              <li>Elige si pagaste con <strong>Yape</strong>, <strong>Plin</strong> o <strong>Efectivo</strong>.</li>
              <li>Presiona <strong>"Registrar Gasto"</strong> y listo en 3 segundos. ¡Se descuenta de tu saldo al instante!</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      badge: 'Paso 2 de 3: El Dashboard en Cristiano',
      title: 'Mira a dónde va tu plata sin enredos ni hojas de Excel 📊',
      icon: <LayoutDashboard size={28} color="#3b82f6" />,
      color: '#3b82f6',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '1rem' }}>
            No necesitas saber nada de contabilidad. SaveAhorro te muestra de forma 100% visual cómo va tu mes con un <strong>termómetro de presupuesto</strong>.
          </p>
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              🎯 Lo que verás en tu Dashboard:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              <li><strong>Barra de Progreso:</strong> Si está en <span style={{ color: '#10b981', fontWeight: 'bold' }}>verde</span>, vas a buen ritmo. Si pasa a <span style={{ color: '#ef4444', fontWeight: 'bold' }}>rojo</span>, te avisa que estás gastando más de la cuenta.</li>
              <li><strong>Gráfica de Pastel:</strong> Descubre al instante si estás gastando más en comida, transporte o antojitos.</li>
              <li><strong>Soles y Dólares:</strong> Cambia de moneda con 1 clic con la tasa de cambio Google en vivo.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      badge: 'Paso 3 de 3: El Ahorro Protegido',
      title: 'Cero sorpresas con la Tarjeta de Crédito y tus Ahorros 🛡️',
      icon: <CreditCard size={28} color="#10b981" />,
      color: '#10b981',
      content: (
        <div>
          <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '1rem' }}>
            El mayor error al usar tarjeta de crédito es gastar creyendo que es dinero gratis, y al mes siguiente no tener cómo pagar el estado de cuenta.
          </p>
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem',
            marginBottom: '0.75rem'
          }}>
            <strong style={{ fontSize: '0.85rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              💡 Tu tranquilidad financiera:
            </strong>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.5' }}>
              <li>Cada compra con <strong>Tarjeta Crédito</strong> se acumula automáticamente en una bolsa aparte para que sepas exactamente cuánto te cobrará el banco el próximo mes.</li>
              <li>Tus <strong>Ahorros de Reserva</strong> (plazo fijo, emergencias en Soles o Dólares) quedan bloqueados y protegidos para que nunca los toques sin darte cuenta.</li>
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
      backgroundColor: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1400,
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '1.75rem',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
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
          <X size={16} />
        </button>

        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: step === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: step === i ? currentStep.color : 'rgba(255,255,255,0.15)',
                transition: 'all 0.25s ease',
                cursor: 'pointer'
              }}
            />
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>
            {currentStep.badge}
          </span>
        </div>

        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${currentStep.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {currentStep.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: '1.3' }}>
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
              padding: '0.55rem 0.95rem',
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
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ant"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <CheckCircle2 size={16} />
              <span>¡Entendido, a ahorrar! 🐜</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
