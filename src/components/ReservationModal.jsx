import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateReservationCost } from '../utils/pricing';
import { parseSafeDate } from '../utils/dateUtils';
import './ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, reservationToEdit, initialData }) => {
  const { cabins, prices, addReservation, updateReservation, reservations, referrers, addReferrer } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    cabinId: '',
    clientName: '',
    startDate: '',
    endDate: '',
    adults: 1,
    childrenCount: 0,
    babiesCount: 0,
    flightOut: '',
    isBlock: false,
    depositAmount: 0,
    paymentMethod: '',
    clientPhone: '',
    referrerId: '',
    referrerStatus: 'pending'
  });
  
  const [error, setError] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [lastCalculatedCost, setLastCalculatedCost] = useState(0);

  useEffect(() => {
    if (reservationToEdit) {
      setFormData({
        ...reservationToEdit,
        flightIn: reservationToEdit.flightIn || '',
        flightOut: reservationToEdit.flightOut || '',
        depositAmount: reservationToEdit.depositAmount || 0,
        paymentMethod: reservationToEdit.paymentMethod || '',
        clientPhone: reservationToEdit.clientPhone || '',
        referrerId: reservationToEdit.referrerId || '',
        referrerStatus: reservationToEdit.referrerStatus || 'pending'
      });
      setTotalCost(reservationToEdit.totalCost);
      setLastCalculatedCost(reservationToEdit.totalCost);
    } else if (initialData) {
      setFormData({
        cabinId: initialData.cabinId || cabins[0]?.id || '',
        clientName: '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        adults: 1,
        childrenCount: 0,
        babiesCount: 0,
        flightIn: '',
        flightOut: '',
        isBlock: false,
        depositAmount: 0,
        paymentMethod: '',
        clientPhone: '',
        referrerId: '',
        referrerStatus: 'pending'
      });
      setTotalCost(0);
      setLastCalculatedCost(0);
    } else {
      setFormData({
        cabinId: cabins[0]?.id || '',
        clientName: '',
        startDate: '',
        endDate: '',
        adults: 1,
        childrenCount: 0,
        babiesCount: 0,
        flightIn: '',
        flightOut: '',
        isBlock: false,
        depositAmount: 0,
        paymentMethod: '',
        clientPhone: '',
        referrerId: '',
        referrerStatus: 'pending'
      });
    }
  }, [reservationToEdit, initialData, cabins, isOpen]);

  useEffect(() => {
    if (formData.startDate && formData.endDate && !formData.isBlock) {
      const cost = calculateReservationCost(
        formData.startDate, 
        formData.endDate, 
        Number(formData.adults), 
        Number(formData.childrenCount),
        prices
      );
      
      // Auto-actualizar solo si el usuario no ha puesto un precio manual
      if (totalCost === lastCalculatedCost || totalCost === 0) {
        setTotalCost(cost);
      }
      setLastCalculatedCost(cost);
    } else {
      if (totalCost === lastCalculatedCost) {
        setTotalCost(0);
      }
      setLastCalculatedCost(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate, formData.adults, formData.childrenCount, formData.isBlock, prices]);

  if (!isOpen) return null;

  const handleCreateReferrer = () => {
    const name = window.prompt('Nombre del nuevo referente o agencia:');
    if (name && name.trim()) {
      const newId = addReferrer({ name: name.trim(), createdAt: new Date().toISOString() });
      setFormData(prev => ({ ...prev, referrerId: newId }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cabin = cabins.find(c => c.id === formData.cabinId);
    if (!cabin) {
      setError('Seleccione una cabaña válida.');
      return;
    }

    if (!formData.isBlock) {
      const totalGuests = Number(formData.adults) + Number(formData.childrenCount);
      if (totalGuests > cabin.maxCapacity) {
        setError(`La capacidad máxima de esta cabaña es de ${cabin.maxCapacity} personas (sin contar bebés).`);
        return;
      }
    }

    if (parseSafeDate(formData.startDate) >= parseSafeDate(formData.endDate)) {
      setError('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }

    const start = parseSafeDate(formData.startDate);
    const end = parseSafeDate(formData.endDate);
    
    const isOverlap = reservations.some(res => {
      if (res.status === 'archived') return false;
      if (reservationToEdit && res.id === reservationToEdit.id) return false;
      if (res.cabinId !== formData.cabinId) return false;

      const resStart = parseSafeDate(res.startDate);
      const resEnd = parseSafeDate(res.endDate);
      
      return start < resEnd && end > resStart;
    });

    if (isOverlap) {
      setError('La cabaña ya está reservada o bloqueada en estas fechas. Elige otra.');
      return;
    }

    const isAdjacent = reservations.some(res => {
      if (res.status === 'archived') return false;
      if (reservationToEdit && res.id === reservationToEdit.id) return false;
      if (res.cabinId !== formData.cabinId) return false;

      const resStart = parseSafeDate(res.startDate);
      const resEnd = parseSafeDate(res.endDate);
      
      return start.getTime() === resEnd.getTime() || end.getTime() === resStart.getTime();
    });

    if (isAdjacent) {
      const confirmSave = window.confirm('⚠️ Atención: Has seleccionado una fecha que coincide con la llegada o salida de otra reserva en la misma cabaña (Turnover). ¿Estás seguro que deseas agendarla en este día?');
      if (!confirmSave) return;
    }

    const payload = {
      ...formData,
      clientName: formData.isBlock ? 'Bloqueo/Mantenimiento' : formData.clientName,
      totalCost: formData.isBlock ? 0 : totalCost,
      status: formData.isBlock ? 'blocked' : 'confirmed'
    };

    if (reservationToEdit) {
      updateReservation(reservationToEdit.id, payload);
    } else {
      addReservation(payload);
    }
    
    onClose();
  };

  const handleGenerateCarta = () => {
    navigate('/admin/tools/passengers', { state: { reservation: formData } });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const getSeason = (dateString) => {
    if (!dateString) return null;
    const date = parseSafeDate(dateString);
    const month = date.getMonth();
    if (month === 11 || month === 0 || month === 1 || month === 2) return 'Alta';
    return 'Baja';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <h2>
            {reservationToEdit 
              ? (formData.isBlock ? 'Editar Bloqueo' : 'Editar Reserva') 
              : 'Nueva Reserva/Bloqueo'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-form">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="form-group checkbox-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="isBlock" 
                checked={formData.isBlock} 
                onChange={handleChange} 
              />
              <Lock size={16} /> Bloquear disponibilidad (Mantenimiento/Cierre)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Cabaña</label>
            <select 
              name="cabinId" 
              className="form-input" 
              value={formData.cabinId} 
              onChange={handleChange} 
              required
            >
              {cabins.map(cabin => (
                <option key={cabin.id} value={cabin.id}>
                  {cabin.name} (Max {cabin.maxCapacity} pers.)
                </option>
              ))}
            </select>
          </div>

          {!formData.isBlock && (
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Cliente</label>
                <input 
                  type="text" 
                  name="clientName" 
                  className="form-input" 
                  value={formData.clientName} 
                  onChange={handleChange} 
                  required={!formData.isBlock} 
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" title="Opcional">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  name="clientPhone" 
                  className="form-input" 
                  placeholder="+569..."
                  value={formData.clientPhone} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          )}

          {!formData.isBlock && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Referido por (Agencia/Tercero)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  name="referrerId" 
                  className="form-input" 
                  value={formData.referrerId || ''} 
                  onChange={handleChange} 
                  style={{ flex: 1 }}
                >
                  <option value="">Sin referente (Directo)</option>
                  {referrers?.map(ref => (
                    <option key={ref.id} value={ref.id}>{ref.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCreateReferrer}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  + Nuevo
                </button>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{formData.isBlock ? 'Inicio Bloqueo' : 'Llegada'}</label>
              <input 
                type="date" 
                name="startDate" 
                className="form-input" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">{formData.isBlock ? 'Fin Bloqueo' : 'Salida'}</label>
              <input 
                type="date" 
                name="endDate" 
                className="form-input" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {formData.startDate && (() => {
            const season = getSeason(formData.startDate);
            return (
              <div style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', background: season === 'Alta' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)', color: season === 'Alta' ? 'var(--danger)' : 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <span style={{ marginRight: '8px' }}>{season === 'Alta' ? '🔥' : '❄️'}</span>
                Temporada de la reserva: {season}
              </div>
            );
          })()}

          {!formData.isBlock && (
            <>
              <div className="form-row guests-row">
                <div className="form-group">
                  <label className="form-label">Adultos</label>
                  <input 
                    type="number" 
                    name="adults" 
                    min="1" 
                    className="form-input" 
                    value={formData.adults} 
                    onChange={handleChange} 
                    required={!formData.isBlock} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" title={`7 a 15 años ($${prices?.child?.toLocaleString('es-CL')})`}>Niños (7-15)</label>
                  <input 
                    type="number" 
                    name="childrenCount" 
                    min="0" 
                    className="form-input" 
                    value={formData.childrenCount} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" title="Menores de 7 años (Gratis)">Bebés (&lt;7)</label>
                  <input 
                    type="number" 
                    name="babiesCount" 
                    min="0" 
                    className="form-input" 
                    value={formData.babiesCount} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" title="Opcional">Vuelo Ingreso (Ida)</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightIn" value="LA841" checked={formData.flightIn === 'LA841'} onChange={handleChange} /> LA841
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightIn" value="LA843" checked={formData.flightIn === 'LA843'} onChange={handleChange} /> LA843
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightIn" value="" checked={!formData.flightIn} onChange={handleChange} /> Ninguno
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" title="Opcional">Vuelo Salida (Regreso)</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightOut" value="LA842" checked={formData.flightOut === 'LA842'} onChange={handleChange} /> LA842
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightOut" value="LA844" checked={formData.flightOut === 'LA844'} onChange={handleChange} /> LA844
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                      <input type="radio" name="flightOut" value="" checked={!formData.flightOut} onChange={handleChange} /> Ninguno
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <label className="form-label" style={{ fontSize: '1.1rem' }}>Precio Total Negociado ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}
                  value={totalCost} 
                  onChange={e => setTotalCost(Number(e.target.value))} 
                  required 
                />
                
                {formData.startDate && formData.endDate && (() => {
                  const s = parseSafeDate(formData.startDate);
                  const e = parseSafeDate(formData.endDate);
                  if (s >= e) return null;
                  const n = Math.max(1, Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)));
                  const isCustom = totalCost !== lastCalculatedCost;
                  return (
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                      Cálculo automático: <strong>{n} noches</strong> x {Number(formData.adults)+Number(formData.childrenCount)} pers. = <strong>${lastCalculatedCost.toLocaleString('es-CL')}</strong>
                      {isCustom && (
                        <button type="button" onClick={() => setTotalCost(lastCalculatedCost)} className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', marginLeft: '10px', fontSize: '0.75rem' }}>
                          Usar sugerido
                        </button>
                      )}
                    </small>
                  );
                })()}
              </div>

              <div className="form-row" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Abono Realizado ($)</span>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, depositAmount: Math.round(totalCost * 0.5) }));
                          } else {
                            setFormData(prev => ({ ...prev, depositAmount: 0 }));
                          }
                        }}
                      />
                      50% Abono
                    </label>
                  </label>
                  <input 
                    type="number" 
                    name="depositAmount" 
                    className="form-input" 
                    value={formData.depositAmount} 
                    onChange={handleChange} 
                    min="0"
                  />
                  {formData.depositAmount > 0 && totalCost > 0 && (
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                      Saldo Pendiente: <strong style={{ color: 'var(--danger)' }}>${(totalCost - formData.depositAmount).toLocaleString('es-CL')}</strong>
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Medio de Pago</label>
                  <select 
                    name="paymentMethod" 
                    className="form-input" 
                    value={formData.paymentMethod} 
                    onChange={handleChange}
                  >
                    <option value="">Seleccione...</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking">Booking</option>
                    <option value="Expedia">Expedia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ flex: 1 }}>
              {!formData.isBlock && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '5px' }} 
                  onClick={handleGenerateCarta}
                  title="Ir a generar Carta de Invitación (Los datos actuales se transferirán)"
                >
                  <FileText size={16} /> Carta
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
