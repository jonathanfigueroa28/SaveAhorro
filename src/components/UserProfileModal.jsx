import React, { useState } from 'react';
import { User, Check, X, Sparkles } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, userProfile, onSaveProfile }) {
  const [firstName, setFirstName] = useState(userProfile.firstName || 'Jonathan');
  const [lastName, setLastName] = useState(userProfile.lastName || 'Figueroa');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    onSaveProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });
    onClose();
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
        maxWidth: '400px',
        padding: '1.75rem',
        position: 'relative'
      }}>
        {/* Close button */}
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

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '0.6rem',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)'
          }}>
            <User size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Mi Perfil</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Personaliza cómo te saluda la aplicación.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre</label>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Apellidos</label>
            <input
              type="text"
              placeholder="Ej: Figueroa"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <Check size={16} />
              <span>Guardar Nombre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
