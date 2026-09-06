import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Zap,
  CreditCard,
  LayoutDashboard,
  Smile,
  Compass
} from 'lucide-react';

export default function InteractiveTour({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  onSwitchDemoProfile,
  currentDemoProfile
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '¡Bienvenido a la Demo de SaveAhorro! 🐜✨',
      badge: 'Paso 1 de 5 • Registro Rápido',
      icon: <Zap size={22} color="#f59e0b" />,
      highlightTab: 'form',
      description: 'Te guiaremos paso a paso para que veas lo fácil y rápido que es registrar tus gastos y tener el control total de tu dinero.',
      actionHint: '👇 Mira abajo los atajos rápidos de gastos hormiga peruanos (café, emoliente, combi, menú).'
    },
    {
      title: 'Atajos de 1 Clic para Gastos Hormiga ☕🍵',
      badge: 'Paso 2 de 5 • Atajos Peruanos',
      icon: <Sparkles size={22} color="#f59e0b" />,
      highlightTab: 'form',
      description: 'En lugar de escribir todo a mano, puedes tocar "☕ Café pasado (S/ 3.50)" o "🍵 Emoliente (S/ 2.00)" y el formulario se llenará al instante.',
      actionHint: '💡 ¡Pruébalo tocando cualquier atajo en la pantalla!'
    },
    {
      title: 'Vinculado a tu Yape o Efectivo 🟣💵',
      badge: 'Paso 3 de 5 • Cuentas Reales',
      icon: <CreditCard size={22} color="#3b82f6" />,
      highlightTab: 'form',
      description: 'En "Más detalles", elige si pagaste con Yape, Plin, Efectivo o Tarjeta. Se descontará directamente de esa cuenta en tiempo real sin enredos.',
      actionHint: '💳 Si usas Tarjeta de Crédito, se sumará a la deuda del próximo mes para que nunca te cobren intereses.'
    },
    {
      title: 'El Dashboard: Tu Termómetro Financiero 📊',
      badge: 'Paso 4 de 5 • Dashboard',
      icon: <LayoutDashboard size={22} color="#10b981" />,
      highlightTab: 'dashboard',
      description: 'Mira la barra de presupuesto mensual y la gráfica de pastel. Te muestra exactamente en qué se va tu plata y si estás en zona segura (verde) o en peligro (rojo).',
      actionHint: '🔄 Puedes alternar entre Soles (S/) y Dólares ($) con la tasa de cambio Google en vivo arriba.'
    },
    {
      title: 'El Gran Contraste: Carlos vs. Pepe 🎭',
      badge: 'Paso 5 de 5 • Conductas Opuestas',
      icon: <Smile size={22} color="#8b5cf6" />,
      highlightTab: 'dashboard',
      description: 'En la barra superior de la demo puedes alternar entre "🐜 Carlos" (controla sus gastos, le sobran S/ 1,850) y "💸 Pepe" (gasta sin control, déficit de S/ 950).',
      actionHint: '✨ ¡Toca "💸 Pepe" arriba para ver la diferencia de impacto!'
    }
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (tourSteps[next].highlightTab && onNavigateTab) {
        onNavigateTab(tourSteps[next].highlightTab);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (tourSteps[prev].highlightTab && onNavigateTab) {
        onNavigateTab(tourSteps[prev].highlightTab);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      left: '1.5rem',
      maxWidth: '460px',
      margin: '0 auto',
      zIndex: 1500
    }}>
      <div className="glass-card animate-fade-in" style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid var(--primary)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        position: 'relative'
      }}>
        {/* Close / Skip button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Saltar tutorial"
        >
          <X size={15} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {step.icon}
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {step.badge}
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: '1.2', color: '#fff' }}>
              {step.title}
            </h4>
          </div>
        </div>

        {/* Body */}
        <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: '1.45', marginBottom: '0.65rem' }}>
          {step.description}
        </p>

        {/* Action hint banner */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          borderLeft: '3px solid #f59e0b',
          borderRadius: '4px',
          padding: '0.45rem 0.65rem',
          fontSize: '0.76rem',
          color: '#fef08a',
          marginBottom: '1rem'
        }}>
          {step.actionHint}
        </div>

        {/* Dots + Navigation Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {tourSteps.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentStep(i);
                  if (tourSteps[i].highlightTab && onNavigateTab) {
                    onNavigateTab(tourSteps[i].highlightTab);
                  }
                }}
                style={{
                  width: currentStep === i ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: currentStep === i ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.35rem 0.55rem'
              }}
            >
              Saltar tour
            </button>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              >
                <ArrowLeft size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', fontWeight: 700 }}
            >
              <span>{currentStep < tourSteps.length - 1 ? 'Siguiente' : '¡Listo!'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
