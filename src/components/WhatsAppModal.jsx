import { useState, useEffect } from 'react';
import { X, MessageCircle, RefreshCw } from 'lucide-react';
import { generateWhatsAppLink, generateCabinMessage, generateCarMessage } from '../utils/whatsapp';

const WhatsAppModal = ({ isOpen, onClose, reservation, type, contextName }) => {
  const [template, setTemplate] = useState('confirmation');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && reservation) {
      if (type === 'cabin') {
        setMessage(generateCabinMessage(reservation, contextName, template));
      } else {
        setMessage(generateCarMessage(reservation, contextName, template));
      }
    }
  }, [isOpen, reservation, template, type, contextName]);

  if (!isOpen || !reservation) return null;

  const handleSend = () => {
    const link = generateWhatsAppLink(reservation.clientPhone, message);
    window.open(link, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={24} color="#25D366" /> 
            Enviar WhatsApp
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <div style={{ marginBottom: '1.5rem', background: 'rgba(37, 211, 102, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              Destinatario: <strong>{reservation.clientName} ({reservation.clientPhone})</strong>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Elegir Plantilla</label>
          <select 
            className="form-input" 
            value={template} 
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="confirmation">Confirmación de Reserva</option>
            <option value="checkin">Recordatorio de Check-in (con Mapa)</option>
            {type === 'cabin' && <option value="checkout">Despedida / Check-out (Pedir Reseña)</option>}
            <option value="payment">Cobro de Saldo Pendiente</option>
          </select>
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Mensaje a enviar
            <button 
              className="btn-icon" 
              style={{ padding: '4px' }} 
              title="Restaurar texto original"
              onClick={() => setMessage(type === 'cabin' ? generateCabinMessage(reservation, contextName, template) : generateCarMessage(reservation, contextName, template))}
            >
              <RefreshCw size={14} />
            </button>
          </label>
          <textarea 
            className="form-input" 
            rows={10} 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            style={{ fontFamily: 'inherit', resize: 'vertical' }}
          />
          <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem' }}>
            Puedes editar este texto libremente antes de enviarlo. No se guardará en la base de datos, solo se enviará por WhatsApp.
          </small>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            type="button" 
            className="btn btn-primary" 
            style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleSend}
          >
            <MessageCircle size={18} />
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
