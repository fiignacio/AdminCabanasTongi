import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings, Save, Plus, Edit2, Trash2, X } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { prices, updatePrices, cabins, addCabin, updateCabin, deleteCabin } = useStore();
  
  // Prices Form State
  const [pricesForm, setPricesForm] = useState({
    highSeasonAdult: prices.highSeasonAdult,
    lowSeasonAdult: prices.lowSeasonAdult,
    child: prices.child
  });
  const [priceSaved, setPriceSaved] = useState(false);

  // Cabin Form State
  const [editingCabin, setEditingCabin] = useState(null);
  const [isCabinModalOpen, setIsCabinModalOpen] = useState(false);
  const [cabinForm, setCabinForm] = useState({
    name: '', type: 'large', maxCapacity: 1, ownerId: 'owner1', ownerName: 'Dueño 1'
  });

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
    setCabinForm({ name: '', type: 'large', maxCapacity: 4, ownerId: 'owner1', ownerName: 'Dueño 1' });
    setEditingCabin(null);
    setIsCabinModalOpen(true);
  };

  const openEditCabin = (cabin) => {
    setCabinForm(cabin);
    setEditingCabin(cabin);
    setIsCabinModalOpen(true);
  };

  const handleDeleteCabin = (id) => {
    if (window.confirm('¿Eliminar esta cabaña? (Se perderá del catálogo, aunque las reservas pueden quedar huérfanas)')) {
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

  const owners = [
    { id: 'owner1', name: 'Dueño 1' },
    { id: 'owner2', name: 'Dueño 2' }
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1><Settings size={28} /> Panel de Administración</h1>
      </div>

      <div className="admin-grid">
        {/* Prices Settings */}
        <div className="card glass-panel admin-section">
          <h2>Tarifas Globales</h2>
          <p className="text-secondary">Estos valores aplican automáticamente a todas las reservas basándose en la fecha.</p>
          
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

        {/* Cabins Management */}
        <div className="card glass-panel admin-section">
          <div className="section-header-row">
            <h2>Gestión de Cabañas</h2>
            <button className="btn btn-primary btn-sm" onClick={openNewCabin}>
              <Plus size={18} /> Nueva Cabaña
            </button>
          </div>
          
          <div className="table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Capacidad</th>
                  <th>Dueño</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cabins.map(cabin => (
                  <tr key={cabin.id}>
                    <td><strong>{cabin.name}</strong></td>
                    <td>{cabin.maxCapacity} pers.</td>
                    <td>{cabin.ownerName}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon" onClick={() => openEditCabin(cabin)}><Edit2 size={18} /></button>
                        <button className="btn-icon danger" onClick={() => handleDeleteCabin(cabin.id)}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cabin Modal */}
      {isCabinModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>{editingCabin ? 'Editar Cabaña' : 'Nueva Cabaña'}</h2>
              <button className="btn-icon" onClick={() => setIsCabinModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCabinSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre de la Cabaña</label>
                <input type="text" className="form-input" value={cabinForm.name} onChange={e => setCabinForm({...cabinForm, name: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacidad Max.</label>
                  <input type="number" min="1" className="form-input" value={cabinForm.maxCapacity} onChange={e => setCabinForm({...cabinForm, maxCapacity: Number(e.target.value)})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Dueño Asignado</label>
                  <select className="form-input" value={cabinForm.ownerId} onChange={e => {
                    const owner = owners.find(o => o.id === e.target.value);
                    setCabinForm({...cabinForm, ownerId: owner.id, ownerName: owner.name});
                  }}>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCabinModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cabaña</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
