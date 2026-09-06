import React, { useState } from 'react';
import { signInWithEmail, signUpWithEmail, getCurrentUser, getSupabaseClient } from '../lib/supabaseClient';
import { User, Mail, Lock, LogIn, UserPlus, X, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor completa tu correo y contraseña.');
      return;
    }

    if (mode === 'register' && !firstName.trim()) {
      setErrorMsg('Por favor escribe tu nombre para personalizar tu cuenta.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const client = getSupabaseClient();

    try {
      if (client) {
        // Conexión Supabase Activa
        if (mode === 'login') {
          const data = await signInWithEmail(email, password);
          if (data?.user) {
            const profile = {
              firstName: data.user.user_metadata?.first_name || email.split('@')[0] || 'Jonathan',
              lastName: data.user.user_metadata?.last_name || ''
            };
            setSuccessMsg(`¡Bienvenido de vuelta, ${profile.firstName}!`);
            setTimeout(() => {
              onAuthSuccess && onAuthSuccess(data.user, profile);
              onClose();
            }, 800);
          }
        } else {
          const profile = {
            firstName: firstName.trim(),
            lastName: lastName.trim()
          };
          const data = await signUpWithEmail(email, password, {
            first_name: profile.firstName,
            last_name: profile.lastName
          });
          if (data?.user) {
            setSuccessMsg(`¡Cuenta creada con éxito! Bienvenido, ${profile.firstName}.`);
            setTimeout(() => {
              onAuthSuccess && onAuthSuccess(data.user, profile);
              onClose();
            }, 900);
          }
        }
      } else {
        // Modo Local Autónomo (Sin requerir nube obligatoria)
        let localUsers = [];
        try {
          localUsers = JSON.parse(localStorage.getItem('saveahorro_local_users') || '[]');
        } catch (e) {}

        const normalizedEmail = email.trim().toLowerCase();

        if (mode === 'login') {
          const existingUser = localUsers.find(u => u.email === normalizedEmail);
          if (existingUser) {
            if (existingUser.password !== password) {
              setErrorMsg('Contraseña incorrecta. Por favor verifica e intenta de nuevo.');
              setLoading(false);
              return;
            }
            const profile = {
              firstName: existingUser.firstName || 'Jonathan',
              lastName: existingUser.lastName || ''
            };
            const userObj = {
              id: existingUser.id,
              email: existingUser.email,
              user_metadata: profile
            };
            setSuccessMsg(`¡Bienvenido de vuelta, ${profile.firstName}!`);
            setTimeout(() => {
              onAuthSuccess && onAuthSuccess(userObj, profile);
              onClose();
            }, 800);
          } else {
            // Usuario no encontrado en lista local: crear sesión rápida
            const profile = {
              firstName: email.split('@')[0] || 'Jonathan',
              lastName: ''
            };
            const userObj = {
              id: 'local_usr_' + Date.now(),
              email: normalizedEmail,
              user_metadata: profile
            };
            localUsers.push({
              id: userObj.id,
              email: normalizedEmail,
              password: password,
              firstName: profile.firstName,
              lastName: ''
            });
            localStorage.setItem('saveahorro_local_users', JSON.stringify(localUsers));
            setSuccessMsg(`¡Sesión iniciada con éxito!`);
            setTimeout(() => {
              onAuthSuccess && onAuthSuccess(userObj, profile);
              onClose();
            }, 800);
          }
        } else {
          // Registrar nuevo usuario local
          const profile = {
            firstName: firstName.trim(),
            lastName: lastName.trim()
          };
          const userObj = {
            id: 'local_usr_' + Date.now(),
            email: normalizedEmail,
            user_metadata: profile
          };
          localUsers = localUsers.filter(u => u.email !== normalizedEmail);
          localUsers.push({
            id: userObj.id,
            email: normalizedEmail,
            password: password,
            firstName: profile.firstName,
            lastName: profile.lastName
          });
          localStorage.setItem('saveahorro_local_users', JSON.stringify(localUsers));

          setSuccessMsg(`¡Cuenta creada con éxito! Bienvenido, ${profile.firstName}.`);
          setTimeout(() => {
            onAuthSuccess && onAuthSuccess(userObj, profile);
            onClose();
          }, 900);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Ocurrió un error inesperado.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta nueva.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este correo ya tiene una cuenta creada. Intenta iniciar sesión.';
      } else if (msg.includes('Password should be at least 6 characters')) {
        msg = 'La contraseña debe tener al menos 6 caracteres.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      zIndex: 1300,
      padding: '1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '1.75rem',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
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
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: '0.5rem'
          }}>
            <User size={26} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {mode === 'login' 
              ? 'Accede a tus cuentas, gastos y liquidez personalizada.' 
              : 'Tus registros quedarán protegidos y aislados para tu usuario.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          marginBottom: '1.25rem',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'login' ? 'var(--primary)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <LogIn size={15} />
            <span>Ingresar</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: mode === 'register' ? 'var(--primary)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <UserPlus size={15} />
            <span>Registrarse</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="grid-2" style={{ marginBottom: '1rem', gap: '0.65rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={13} color="var(--primary)" />
                  <span>Tu Nombre</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Jonathan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  <span>Apellidos</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Figueroa"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} color="var(--primary)" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              placeholder="tu-correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} color="var(--primary)" />
              <span>Contraseña (mínimo 6 caracteres)</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="animate-fade-in" style={{
              marginBottom: '1rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="animate-fade-in" style={{
              marginBottom: '1rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#6ee7b7',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <span>Procesando...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Iniciar Sesión</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Crear Cuenta Personal</span>
              </>
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.25rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.74rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem'
        }}>
          <ShieldCheck size={14} color="var(--primary)" />
          <span>Sesión persistente por semanas mediante Supabase Auth</span>
        </div>

      </div>
    </div>
  );
}
