import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Save, Building2, Palette, RefreshCw, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import './Admin.css';

const THEME_PRESETS = [
  { id: 'green', name: 'Verde Bosque', color: '#2c4c3b' },
  { id: 'blue', name: 'Azul Océano', color: '#1e3a8a' },
  { id: 'terracotta', name: 'Terracota', color: '#d35400' },
  { id: 'purple', name: 'Morado Elegante', color: '#6b21a8' },
  { id: 'teal', name: 'Turquesa Marino', color: '#0d9488' },
  { id: 'slate', name: 'Gris Grafito', color: '#334155' }
];

const Admin = () => {
  const { businessConfig, updateBusinessConfig, resetSetup } = useStore();
  
  // Branding Form State
  const [brandForm, setBrandForm] = useState({
    businessName: businessConfig.businessName || '',
    administratorName: businessConfig.administratorName || '',
    contactPhone: businessConfig.contactPhone || '',
    contactEmail: businessConfig.contactEmail || '',
    primaryColor: businessConfig.primaryColor || '#2c4c3b',
    logoUrl: businessConfig.logoUrl || ''
  });
  const [brandSaved, setBrandSaved] = useState(false);

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    updateBusinessConfig(brandForm);
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 3000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen del logo no debe superar los 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandForm(prev => ({ ...prev, logoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1><Settings size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} /> Personalización de Marca y Tema</h1>
          <p className="text-secondary">Personaliza el logo de tu empresa, nombre comercial, administrador, datos de contacto y colores de la app.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { resetSetup(); window.location.reload(); }}>
          <RefreshCw size={18} /> Re-iniciar Asistente Inicial
        </button>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* 1. Panel de Identidad y Marca */}
        <div className="card glass-panel admin-section" style={{ gridColumn: 'span 1' }}>
          <h2><Building2 size={22} style={{ display: 'inline', marginRight: 8, color: brandForm.primaryColor }} /> Marca y Administración</h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Sube tu logo institucional y personaliza los datos corporativos.</p>
          
          <form onSubmit={handleBrandSubmit} className="prices-form">
            {/* Carga de Logo */}
            <div className="form-group">
              <label className="form-label"><ImageIcon size={16} style={{ display: 'inline', marginRight: 6 }} /> Logo de la Empresa</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '6px' }}>
                {brandForm.logoUrl ? (
                  <div style={{ position: 'relative', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '6px', background: '#ffffff', display: 'inline-block' }}>
                    <img src={brandForm.logoUrl} alt="Logo Preview" style={{ height: 50, maxWidth: 120, objectFit: 'contain', display: 'block' }} />
                    <button 
                      type="button" 
                      onClick={() => setBrandForm({...brandForm, logoUrl: ''})}
                      style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Eliminar Logo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.88rem' }}>
                    <Upload size={16} /> Subir Imagen del Logo (PNG, JPG, SVG)
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Negocio / Empresa</label>
              <input 
                type="text" 
                className="form-input" 
                value={brandForm.businessName} 
                onChange={e => setBrandForm({...brandForm, businessName: e.target.value})} 
                placeholder="Ej: Rent-a-Car & Tours Rapa Nui"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">¿Quién Administra? (Propietario / Admin)</label>
              <input 
                type="text" 
                className="form-input" 
                value={brandForm.administratorName} 
                onChange={e => setBrandForm({...brandForm, administratorName: e.target.value})} 
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
                  value={brandForm.contactPhone} 
                  onChange={e => setBrandForm({...brandForm, contactPhone: e.target.value})} 
                  placeholder="+56 9..." 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Email de Contacto</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={brandForm.contactEmail} 
                  onChange={e => setBrandForm({...brandForm, contactEmail: e.target.value})} 
                  placeholder="contacto@empresa.cl" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><Palette size={16} style={{ display: 'inline', marginRight: 6 }} /> Color de Tema Principal</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                {THEME_PRESETS.map(preset => (
                  <div 
                    key={preset.id} 
                    onClick={() => setBrandForm({...brandForm, primaryColor: preset.color})}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', backgroundColor: preset.color, cursor: 'pointer',
                      border: brandForm.primaryColor === preset.color ? '3px solid #0f172a' : '2px solid transparent',
                      boxShadow: brandForm.primaryColor === preset.color ? '0 0 0 3px #ffffff' : '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    title={preset.name}
                  />
                ))}
                <input 
                  type="color" 
                  value={brandForm.primaryColor} 
                  onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})}
                  style={{ width: 38, height: 32, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  title="Color personalizado"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: brandForm.primaryColor }}>
                <Save size={18} /> Guardar Personalización
              </button>
              {brandSaved && <span className="text-success save-msg">¡Marca y logo actualizados con éxito!</span>}
            </div>
          </form>
        </div>

        {/* 2. Vista Previa de Marca */}
        <div className="card glass-panel admin-section" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(248, 250, 252, 0.8) 100%)' }}>
          <h2>Vista Previa de Tarjeta de Marca</h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Así lucirán el logo y las referencias visuales de tu marca en los vouchers y documentos.</p>
          
          <div style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '16px', background: '#ffffff', border: `2px solid ${brandForm.primaryColor}`, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: brandForm.primaryColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>COMPROBANTE OFICIAL</span>
              {brandForm.logoUrl && (
                <img src={brandForm.logoUrl} alt="Logo Oficial" style={{ maxHeight: 40, maxWidth: 120, objectFit: 'contain' }} />
              )}
            </div>
            
            <h2 style={{ color: brandForm.primaryColor, margin: '0.4rem 0 0.2rem 0', fontSize: '1.4rem' }}>{brandForm.businessName || 'Nombre de tu Empresa'}</h2>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569' }}>Administración: <strong>{brandForm.administratorName || 'Nombre Administrador'}</strong></p>

            <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.8rem', fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span>📞 Contacto: {brandForm.contactPhone || 'No especificado'}</span>
              <span>✉️ Email: {brandForm.contactEmail || 'No especificado'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
