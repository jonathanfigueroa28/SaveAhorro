import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  CreditCard,
  LayoutDashboard,
  Smile,
  Wallet,
  Coins
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
  const [targetRect, setTargetRect] = useState(null);
  const popoverRef = useRef(null);

  const tourSteps = [
    {
      title: 'Registro Rápido y Atajos de 1 Toque',
      badge: 'Paso 1 de 4 • Registrar Gasto',
      icon: <Sparkles size={20} color="#b45309" />,
      highlightTab: 'form',
      targetId: 'tour-quick-presets',
      description: 'Toca cualquiera de los atajos frecuentes peruanos (Café, Emoliente, Metropolitano, Menú) para completar monto y categoría al instante.',
      actionHint: 'Toca cualquier atajo para ver cómo se completa de inmediato.'
    },
    {
      title: 'Liquidez Real y Ahorros de Reserva',
      badge: 'Paso 2 de 4 • Cuentas & Ahorro',
      icon: <Wallet size={20} color="#059669" />,
      highlightTab: 'accounts',
      targetId: 'tour-liquidity-heroes',
      description: 'Conoce tu dinero disponible en mano hoy, tus ahorros protegidos intocables y la liquidez que te sobrará el próximo mes descontando gastos fijos y tarjeta.',
      actionHint: 'Tus gastos diarios se descuentan en tiempo real de tus cuentas operativas.'
    },
    {
      title: 'Termómetro de Presupuesto Mensual',
      badge: 'Paso 3 de 4 • Dashboard',
      icon: <LayoutDashboard size={20} color="#2563eb" />,
      highlightTab: 'dashboard',
      targetId: 'tour-budget-card',
      description: 'Esta barra te avisa con colores si estás en zona verde (seguro) o roja (déficit) para que nunca te quedes corto a fin de mes.',
      actionHint: 'Puedes ajustar tu presupuesto en cualquier momento con el botón Editar.'
    },
    {
      title: 'Historial y Auditoría de Gastos',
      badge: 'Paso 4 de 4 • Historial',
      icon: <CreditCard size={20} color="#475569" />,
      highlightTab: 'history',
      targetId: 'tour-history-controls',
      description: 'Revisa cada movimiento registrado, filtra por fecha, cuenta o moneda, y edita o elimina fácilmente cualquier registro erróneo.',
      actionHint: 'Puedes exportar tus registros a Excel/CSV con un solo clic.'
    }
  ];

  const step = tourSteps[currentStep];

  // Auto navigate tab and calculate bounding box of the active target
  useEffect(() => {
    if (!isOpen) return;

    // Navigate to required tab if not already on it
    if (step.highlightTab && activeTab !== step.highlightTab && onNavigateTab) {
      onNavigateTab(step.highlightTab);
    }

    let retryTimer = null;
    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        // Scroll element smoothly into the viewport center
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait briefly for smooth scroll animation to settle
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right
          });
        }, 120);
      } else {
        // Retry shortly if view is still mounting
        retryTimer = setTimeout(updatePosition, 100);
      }
    };

    // Initial update with small grace period for tab mount
    const timer = setTimeout(updatePosition, 140);

    const handleScrollOrResize = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        });
      }
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });

    return () => {
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [currentStep, isOpen, activeTab, step.highlightTab, step.targetId]);

  if (!isOpen) return null;

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

  // Compute smart popover coordinates to never block the target element
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
  const isMobile = windowWidth < 640;

  let popoverTop = windowHeight - 260;
  let popoverLeft = Math.max(16, (windowWidth - 420) / 2);
  let showAbove = false;

  if (targetRect) {
    const spaceAbove = targetRect.top;
    const spaceBelow = windowHeight - targetRect.bottom;
    const estimatedPopoverHeight = 240;

    // Decide if popover should sit above or below the target box
    if (spaceAbove > estimatedPopoverHeight + 20) {
      showAbove = true;
      popoverTop = Math.max(16, targetRect.top - estimatedPopoverHeight - 16);
    } else {
      showAbove = false;
      popoverTop = Math.min(windowHeight - estimatedPopoverHeight - 16, targetRect.bottom + 16);
    }

    if (isMobile) {
      popoverLeft = 14;
    } else {
      const targetCenter = targetRect.left + (targetRect.width / 2);
      popoverLeft = Math.max(16, Math.min(windowWidth - 436, targetCenter - 210));
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'auto' }}>
      
      {/* 1. SPOTLIGHT GLOWING HIGHLIGHT FRAME (Surrounds target with dark backdrop) */}
      {targetRect && (
        <div
          className="tour-spotlight-box"
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: '14px',
            border: '2px solid #f59e0b',
            pointerEvents: 'none',
            zIndex: 2010,
            transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease'
          }}
        >
          {/* Animated Pin Marker: "👇 AQUÍ" */}
          <div style={{
            position: 'absolute',
            top: showAbove ? 'auto' : '-16px',
            bottom: showAbove ? '-16px' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#f59e0b',
            color: '#000',
            borderRadius: '999px',
            padding: '2px 9px',
            fontWeight: 900,
            fontSize: '0.72rem',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            whiteSpace: 'nowrap'
          }}>
            {showAbove ? '👆 AQUÍ' : '👇 AQUÍ'}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC FLOATING COACHMARK POPOVER */}
      <div
        ref={popoverRef}
        className="glass-card animate-fade-in"
        style={{
          position: 'fixed',
          top: `${popoverTop}px`,
          left: isMobile ? '14px' : `${popoverLeft}px`,
          right: isMobile ? '14px' : 'auto',
          maxWidth: isMobile ? 'calc(100vw - 28px)' : '420px',
          background: '#ffffff',
          border: '2px solid var(--primary)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          zIndex: 2020,
          transition: 'top 0.25s ease, left 0.25s ease'
        }}
      >
        {/* Floating Caret Arrow pointing to target */}
        {targetRect && (
          <div style={{
            position: 'absolute',
            left: isMobile ? '50%' : '30px',
            transform: 'translateX(-50%)',
            top: showAbove ? 'auto' : '-10px',
            bottom: showAbove ? '-10px' : 'auto',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: showAbove ? '10px solid var(--primary)' : 'none',
            borderBottom: showAbove ? 'none' : '10px solid var(--primary)'
          }} />
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: '#f1f5f9',
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
          aria-label="Cerrar tour"
        >
          <X size={15} />
        </button>

        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {step.icon}
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent-ant)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {step.badge}
            </span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, lineHeight: '1.2', color: 'var(--text-main)', margin: 0 }}>
              {step.title}
            </h4>
          </div>
        </div>

        {/* Body Description */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '0.65rem' }}>
          {step.description}
        </p>

        {/* Action Hint Banner */}
        <div style={{
          background: 'var(--accent-ant-bg)',
          borderLeft: '3px solid var(--accent-ant)',
          borderRadius: '4px',
          padding: '0.45rem 0.65rem',
          fontSize: '0.75rem',
          color: '#92400e',
          fontWeight: 500,
          marginBottom: '0.85rem'
        }}>
          {step.actionHint}
        </div>

        {/* Footer: Progress Dots & Next/Prev Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
                  background: currentStep === i ? '#f59e0b' : 'rgba(255,255,255,0.2)',
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
              Saltar
            </button>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                title="Paso anterior"
              >
                <ArrowLeft size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-ant"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{currentStep < tourSteps.length - 1 ? 'Siguiente' : '¡Comenzar!'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
