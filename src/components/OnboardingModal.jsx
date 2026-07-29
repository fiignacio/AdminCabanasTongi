import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sparkles, Building2, Palette, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import './OnboardingModal.css';

const THEME_PRESETS = [
  { id: 'green', name: 'Verde Bosque', color: '#2c4c3b' },
  { id: 'blue', name: 'Azul Océano', color: '#1e3a8a' },
  { id: 'terracotta', name: 'Terracota', color: '#d35400' },
  { id: 'purple', name: 'Morado Elegante', color: '#6b21a8' },
  { id: 'teal', name: 'Turquesa Marino', color: '#0d9488' },
  { id: 'slate', name: 'Gris Grafito', color: '#334155' }
];

export default function OnboardingModal() {
  const { businessConfig, updateBusinessConfig } = useStore();
  const [step, setStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState(businessConfig.businessName || 'Rent-a-Car & Tours');
  const [administratorName, setAdministratorName] = useState(businessConfig.administratorName || 'Administrador General');
  const [contactPhone, setContactPhone] = useState(businessConfig.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(businessConfig.contactEmail || '');
  const [primaryColor, setPrimaryColor] = useState(businessConfig.primaryColor || '#2c4c3b');

  const handleFinish = () => {
    updateBusinessConfig({
      businessName: businessName.trim() || 'Rent-a-Car & Tours',
      administratorName: administratorName.trim() || 'Administrador',
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      primaryColor,
      isSetupCompleted: true
    });
  };

  if (businessConfig.isSetupCompleted) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h1><Sparkles size={24} color={primaryColor} /> Bienvenido a tu Administrador</h1>
          <p>Personaliza la información inicial de tu empresa de Arriendo de Vehículos y Tours.</p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="onboarding-steps">
          <div className={`step-indicator ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}`}>
            {step > 1 ? <CheckCircle2 size={20} /> : '1'}
            <span className="step-label">Identidad</span>
          </div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
            '2'
            <span className="step-label">Apariencia</span>
          </div>
        </div>

        {/* Step 1: Business Identity */}
        {step === 1 && (
          <div className="step-content">
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1e293b' }}>
              <Building2 size={18} style={{ display: 'inline', marginRight: 6 }} /> Datos de la Empresa
            </h3>
            
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa / Negocio</label>
              <input 
                type="text" 
                className="form-input" 
                value={businessName} 
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Ej: Rent-a-Car & Tours Rapa Nui" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">¿Quién Administra?</label>
              <input 
                type="text" 
                className="form-input" 
                value={administratorName} 
                onChange={e => setAdministratorName(e.target.value)}
                placeholder="Ej: Juan Pérez / Administración" 
                required 
              />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={contactPhone} 
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+56 9 1234 5678" 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Email de Contacto</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contacto@empresa.cl" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Theme & Visual Style */}
        {step === 2 && (
          <div className="step-content">
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
              <Palette size={18} style={{ display: 'inline', marginRight: 6 }} /> Personaliza el Tema de la Aplicación
            </h3>
            <p className="text-secondary" style={{ margin: 0, fontSize: '0.85rem' }}>
              Selecciona el color principal que identificará tu marca y panel de administración.
            </p>

            <div className="color-picker-grid">
              {THEME_PRESETS.map(theme => (
                <div 
                  key={theme.id}
                  className={`color-option-card ${primaryColor === theme.color ? 'selected' : ''}`}
                  onClick={() => setPrimaryColor(theme.color)}
                >
                  <div className="color-swatch" style={{ backgroundColor: theme.color }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>{theme.name}</span>
                </div>
              ))}
            </div>

            {/* Live Preview Card */}
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: `2px solid ${primaryColor}` }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista Previa de Marca</span>
              <h2 style={{ color: primaryColor, margin: '0.25rem 0' }}>{businessName || 'Rent-a-Car & Tours'}</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>Administrado por: <strong>{administratorName || 'Administrador'}</strong></p>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="onboarding-footer">
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} /> Anterior
            </button>
          ) : (
            <div></div>
          )}

          {step < 2 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleFinish} style={{ background: primaryColor }}>
              <CheckCircle2 size={18} /> Guardar y Comenzar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
