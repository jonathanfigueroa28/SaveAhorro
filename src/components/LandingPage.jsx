import React from 'react';
import {
  Bug,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  PlayCircle,
  HelpCircle,
  Coins,
  Smile,
  Frown,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onStartDemo, onEnterApp, onOpenTutorial, isLoggedIn }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1080px', margin: '0 auto', padding: '1rem 0.5rem 4rem 0.5rem' }}>
      
      {/* TOP HEADER */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, var(--primary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
          }}>
            <Bug size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: '1.1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Save<span style={{ color: 'var(--primary)' }}>Ahorro</span></span>
              <span style={{ fontSize: '1.1rem' }}>🐜</span>
            </h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Finanzas personales en 3 segundos al día
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={onOpenTutorial}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <PlayCircle size={15} color="var(--primary)" />
            <span className="hide-mobile">Ver Tutorial</span>
          </button>

          <button
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <span>{isLoggedIn ? 'Ir a Mi Cuenta' : 'Iniciar Sesión'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO BANNER */}
      <section style={{ textAlign: 'center', padding: '2rem 1rem 3rem 1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#fef08a',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={15} color="#f59e0b" />
          <span>¡Dile adiós a quedarte sin plata a fin de mes!</span>
        </div>

        <h2 style={{
          fontSize: 'clamp(1.9rem, 5vw, 3.2rem)',
          fontWeight: 900,
          lineHeight: '1.15',
          maxWidth: '850px',
          margin: '0 auto 1.25rem auto',
          letterSpacing: '-0.5px'
        }}>
          ¿A dónde se fue tu sueldo? <br />
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Descúbrelo y ahorra en 3 segundos al día.
          </span>
        </h2>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2rem auto',
          lineHeight: '1.6'
        }}>
          Sin hojas de Excel confusas, sin términos bancarios difíciles. Diseñado para jóvenes que gastan en antojitos y adultos que solo quieren tener paz mental con sus cuentas.
        </p>

        {/* CTA BUTTONS */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => onStartDemo('carlos')}
            className="btn btn-ant"
            style={{
              padding: '0.85rem 1.6rem',
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span>🚀 Probar Demo Interactiva Gratis</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onEnterApp}
            className="btn btn-secondary"
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            <span>Empezar con mis datos</span>
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          ✅ 100% Gratis • No requiere tarjeta de crédito • Funciona en celular y PC
        </div>
      </section>

      {/* EL PROBLEMA DE LOS GASTOS HORMIGA: INTERACTIVE EYE-OPENER */}
      <section className="glass-card" style={{ padding: '2rem 1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
            La Fuga Silenciosa de Dinero
          </span>
          <h3 style={{ fontSize: '1.55rem', fontWeight: 800, marginTop: '0.3rem' }}>
            ¿Cuánto te quitan los "Gastos Hormiga" al mes sin que te des cuenta? 🐜💸
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Crees que estás ahorrando porque no compraste nada caro, pero mira esta cuenta real:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>☕</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Café o Emoliente diario</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>S/ 3.50 al paso x 30 días</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>= S/ 105.00 / mes</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🚕</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Taxis por apuro o flojera</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>2 taxis semanales de S/ 15</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>= S/ 120.00 / mes</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🍪</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Snacks, golosinas y agua</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>S/ 3.00 cada tarde x 25 días</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>= S/ 75.00 / mes</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🍔</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Delivery nocturno impulsivo</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>3 deliveries de S/ 35 al mes</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>= S/ 105.00 / mes</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <strong style={{ fontSize: '1.05rem', color: '#fca5a5' }}>
              ¡Total que se fuga sin que lo notes: S/ 405.00 cada mes!
            </strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              En un año son casi S/ 5,000 que podrías haber ahorrado o usado para viajar.
            </p>
          </div>
          <button
            onClick={() => onStartDemo('pepe')}
            className="btn btn-danger"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            Ver qué le pasa a Pepe 💸
          </button>
        </div>
      </section>

      {/* SECCIÓN DEMO: ELIGE TU CASO (CARLOS VS PEPE) */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Demostración en Vivo
          </span>
          <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.3rem' }}>
            Prueba la app con 2 Conductas Financieras Opuestas 🎭
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0.25rem auto 0 auto' }}>
            Toca cualquiera de los dos personajes y experimenta en vivo cómo se ve el Dashboard, la liquidez y las alertas de SaveAhorro:
          </p>
        </div>

        <div className="grid-2" style={{ gap: '1.5rem' }}>
          
          {/* PERSONAJE 1: CARLOS */}
          <div className="glass-card animate-fade-in" style={{
            padding: '1.5rem',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            background: 'radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.12), rgba(18, 24, 40, 0.85))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                  Caso 1: Buena Conducta Financiera 🟢
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Carlos Mendoza</span>
                  <span style={{ fontSize: '1.1rem' }}>🐜👑</span>
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                  "El Hormigón Ahorrador"
                </p>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Smile size={24} color="#10b981" />
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
              Anota sus cafecitos y compras al paso en 3 segundos. Disfruta la vida pero sabe cuánto le queda en Yape y en efectivo.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sueldo mensual:</span>
                <strong style={{ color: '#fff' }}>S/ 3,200 + $ 200</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gastos hormiga del mes:</span>
                <strong style={{ color: 'var(--success)' }}>S/ 140 (bajo control)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tarjeta de crédito a pagar:</span>
                <strong style={{ color: '#fff' }}>S/ 380 (sin deudas moras)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>Proyección próximo mes:</span>
                <strong style={{ color: 'var(--success)', fontSize: '0.95rem' }}>+ S/ 1,850 libres 🎉</strong>
              </div>
            </div>

            <button
              onClick={() => onStartDemo('carlos')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}
            >
              <span>Explorar Demo como Carlos 🐜</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* PERSONAJE 2: PEPE */}
          <div className="glass-card animate-fade-in" style={{
            padding: '1.5rem',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            background: 'radial-gradient(ellipse at top left, rgba(239, 68, 68, 0.12), rgba(18, 24, 40, 0.85))'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>
                  Caso 2: En Peligro Financiero 🔴
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Pepe Gastatodo</span>
                  <span style={{ fontSize: '1.1rem' }}>💸🏃💨</span>
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>
                  "El Gastador Fugitivo"
                </p>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Frown size={24} color="#ef4444" />
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
              Pide delivery casi todas las noches, toma taxi por flojera, usa la tarjeta de crédito creyendo que es dinero extra y a fin de mes no sabe qué hacer.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sueldo mensual:</span>
                <strong style={{ color: '#fff' }}>S/ 2,400</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gastos hormiga desbordados:</span>
                <strong style={{ color: 'var(--danger)' }}>S/ 1,320 (disparados)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tarjeta de crédito reventada:</span>
                <strong style={{ color: 'var(--danger)' }}>S/ 2,150 (en riesgo mora)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.35rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Déficit próximo mes:</span>
                <strong style={{ color: 'var(--danger)', fontSize: '0.95rem' }}>- S/ 950 en rojo ⚠️</strong>
              </div>
            </div>

            <button
              onClick={() => onStartDemo('pepe')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#fca5a5'
              }}
            >
              <span>Ver la Crisis de Pepe 💸</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* 3 PILARES SIMPLES */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Las 3 Cosas que SaveAhorro hace por ti
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Diseñado para que lo uses sin pereza todos los días.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.35rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <Zap size={22} color="#f59e0b" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>1. Registro en 3 Segundos</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Toca un botón rápido como "☕ Café pasado" o "🚌 Pasaje", marca si fue Yape o Efectivo y listo. Olvídate de formularios largos.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.35rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <Coins size={22} color="#3b82f6" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>2. Se Descuenta de tu Saldo</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Si pagas con Yape, se descuenta de tu saldo Yape. Si pagas en efectivo, se descuenta de tu billetera. Siempre sabes cuánta plata tienes hoy.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.35rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>3. Protege tus Ahorros</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Te dice de antemano si tus sueldos cubren la casa, los servicios y la tarjeta de crédito del próximo mes, para que nunca toques tus ahorros de reserva.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="glass-card" style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Empieza hoy y recupera el control de tu dinero
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '550px', margin: '0 auto 1.5rem auto' }}>
          Únete a quienes ya ahorran cientos de soles al mes simplemente vigilando sus gastos hormiga en segundos.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onStartDemo('carlos')}
            className="btn btn-ant"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1rem', fontWeight: 800 }}
          >
            <span>Probar la Demo en Vivo 🐜</span>
            <ChevronRight size={18} />
          </button>
          <button
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ padding: '0.85rem 1.6rem', fontSize: '1rem', fontWeight: 700 }}
          >
            <span>Entrar a Mi Cuenta</span>
          </button>
        </div>
      </section>

    </div>
  );
}
