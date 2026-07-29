import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Save, Building2, Palette, Sparkles, RefreshCw } from 'lucide-react';
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
  const { 
    prices, updatePrices, 
    
    businessConfig, updateBusinessConfig, resetSetup 
  } = useStore();
  
  // Branding Form State
  const [brandForm, setBrandForm] = useState({
    businessName: businessConfig.businessName || '',
    administratorName: businessConfig.administratorName || '',
    contactPhone: businessConfig.contactPhone || '',
    contactEmail: businessConfig.contactEmail || '',
    primaryColor: businessConfig.primaryColor || '#2c4c3b'
  });
  const [brandSaved, setBrandSaved] = useState(false);

  // Prices Form State
  const [pricesForm, setPricesForm] = useState({
    highSeasonAdult: prices.highSeasonAdult,
    lowSeasonAdult: prices.lowSeasonAdult,
    child: prices.child
  });
  const [priceSaved, setPriceSaved] = useState(false);



  const handlePriceChange = (e) => {
    setPricesForm({ ...pricesForm, [e.target.name]: Number(e.target.value) });
    setPriceSaved(false);
  };

  const handleSavePrices = (e) => {
    e.preventDefault();
    updatePrices(pricesForm);
    setPriceSaved(true);
    setTimeout(() => setPriceSaved(false), 3000);
  };

  const openNewCabin = () => {
    setCabinForm({ name: '', type: 'large', maxCapacity: 4, color: '#2980b9' });
    setEditingCabin(null);
    setIsCabinModalOpen(true);
  };

  const openEditCabin = (cabin) => {
    setCabinForm({ name: cabin.name, type: cabin.type || 'large', maxCapacity: cabin.maxCapacity, color: cabin.color || '#2980b9' });
    setEditingCabin(cabin);
    setIsCabinModalOpen(true);
  };

  const handleDeleteCabin = (id) => {
    if (window.confirm('¿Eliminar esta cabaña? (Se perderá del catálogo, aunque las reservas existentes se mantendrán)')) {
      deleteCabin(id);
    }
  };

  const handleCabinSubmit = (e) => {
    e.preventDefault();
    if (editingCabin) {
      updateCabin(editingCabin.id, cabinForm);
    } else {
      addCabin(cabinForm);
    }
    setIsCabinModalOpen(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1><Settings size={28} /> Panel de Configuración y Personalización</h1>
          <p className="text-secondary">Personaliza el nombre de tu propiedad, quién administra, temas de color y catálogo de cabañas.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { resetSetup(); window.location.reload(); }}>
          <RefreshCw size={18} /> Re-iniciar Asistente Inicial
        </button>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
        {/* 1. Panel de Identidad y Marca */}
        <div className="card glass-panel admin-section" style={{ gridColumn: 'span 1' }}>
          <h2><Building2 size={22} style={{ display: 'inline', marginRight: 8, color: brandForm.primaryColor }} /> Marca y Administración</h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Personaliza cómo se llamará tu complejo y los datos de contacto en vouchers.</p>
          
          <form onSubmit={handleBrandSubmit} className="prices-form">
            <div className="form-group">
              <label className="form-label">Nombre del Complejo / Cabañas</label>
              <input 
                type="text" 
                className="form-input" 
                value={brandForm.businessName} 
                onChange={e => setBrandForm({...brandForm, businessName: e.target.value})} 
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
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={brandForm.contactPhone} 
                  onChange={e => setBrandForm({...brandForm, contactPhone: e.target.value})} 
                  placeholder="+56 9..." 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email de Contacto</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={brandForm.contactEmail} 
                  onChange={e => setBrandForm({...brandForm, contactEmail: e.target.value})} 
                  placeholder="admin@correo.cl" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><Palette size={16} style={{ display: 'inline', marginRight: 6 }} /> Color de Tema Principal</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {THEME_PRESETS.map(preset => (
                  <div 
                    key={preset.id} 
                    onClick={() => setBrandForm({...brandForm, primaryColor: preset.color})}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', backgroundColor: preset.color, cursor: 'pointer',
                      border: brandForm.primaryColor === preset.color ? '3px solid #1e293b' : '2px solid transparent',
                      boxShadow: brandForm.primaryColor === preset.color ? '0 0 0 2px #fff' : 'none'
                    }}
                    title={preset.name}
                  />
                ))}
                <input 
                  type="color" 
                  value={brandForm.primaryColor} 
                  onChange={e => setBrandForm({...brandForm, primaryColor: e.target.value})}
                  style={{ width: 34, height: 28, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                  title="Color personalizado"
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: brandForm.primaryColor }}>
              <Save size={18} /> Guardar Personalización
            </button>
            {brandSaved && <span className="text-success save-msg">¡Marca y tema actualizados!</span>}
          </form>
        </div>

        {/* 2. Tarifas Globales */}
        <div className="card glass-panel admin-section">
          <h2>Tarifas Globales por Temporada</h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Estos valores se aplican a los cálculos automatizados de estadía.</p>
          
          <form onSubmit={handleSavePrices} className="prices-form">
            <div className="form-group">
              <label className="form-label">Adulto Temporada Alta ($)</label>
              <input type="number" name="highSeasonAdult" className="form-input" value={pricesForm.highSeasonAdult} onChange={handlePriceChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Adulto Temporada Baja ($)</label>
              <input type="number" name="lowSeasonAdult" className="form-input" value={pricesForm.lowSeasonAdult} onChange={handlePriceChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Niños (7-15 años) ($)</label>
              <input type="number" name="child" className="form-input" value={pricesForm.child} onChange={handlePriceChange} required />
            </div>
            
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Guardar Tarifas
            </button>
            {priceSaved && <span className="text-success save-msg">¡Tarifas actualizadas!</span>}
          </form>
        </div>

      </div>
    </div>
  );
};

export default Admin;
