import { useState, useRef } from 'react';
import { Download, Users, FileText, Plane, PlaneTakeoff, PlaneLanding, Mail, Trash2, Plus, Share2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import './PassengerRegistration.css';

export default function PassengerRegistration() {
  const location = useLocation();
  const reservationData = location.state?.reservation;

  const [rawText, setRawText] = useState('');
  
  // Parsed Form State - Inicializado con datos de la reserva si existen
  const [checkIn, setCheckIn] = useState(reservationData?.startDate || '');
  const [checkOut, setCheckOut] = useState(reservationData?.endDate || '');
  const [flightIn, setFlightIn] = useState(reservationData?.flightIn || '');
  const [flightOut, setFlightOut] = useState(reservationData?.flightOut || '');
  const [email, setEmail] = useState('');
  const [titular, setTitular] = useState(reservationData?.clientName || '');
  const [passengers, setPassengers] = useState([]);
  
  const invoiceRef = useRef(null);

  const handleParseText = () => {
    // Basic Parsing Heuristics
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let foundDates = [];
    let foundRuts = [];
    let foundEmails = [];
    let newPassengers = [];

    const rutRegex = /\b(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])\b/gi;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\b/g;
    const flightRegex = /\b([A-Za-z]{0,2}\s?\d{3,4})\b/g;

    let possibleFlights = [];

    for (let i = 0; i < lines.length; i++) {
      // Limpiar prefijos de WhatsApp como "[22/5, 12:05 p.m.] Nombre:"
      let line = lines[i].replace(/^\[\d{1,2}[\/\-]\d{1,2}.*?\]\s*.*?:/i, '').trim();

      const emailsInLine = line.match(emailRegex);
      if (emailsInLine) foundEmails.push(...emailsInLine);

      const datesInLine = line.match(dateRegex);
      if (datesInLine) foundDates.push(...datesInLine);

      // Mejorar detección de vuelos: ignorar RUTs que parezcan vuelos
      const flightsInLine = line.match(flightRegex);
      if (flightsInLine) {
        const validFlights = flightsInLine.filter(f => !rutRegex.test(f) && /\d/.test(f));
        possibleFlights.push(...validFlights);
      }

      const rutsInLine = line.match(rutRegex);
      if (rutsInLine) {
        rutsInLine.forEach(rut => {
          let nameRaw = line.replace(rutRegex, '').replace(emailRegex, '').replace(dateRegex, '').trim();
          
          // Si la línea con el RUT quedó casi vacía, el nombre probablemente está en la línea anterior
          if (nameRaw.length < 4 && i > 0) {
            nameRaw = lines[i-1].replace(/^\[\d{1,2}[\/\-]\d{1,2}.*?\]\s*.*?:/i, '').replace(emailRegex, '').replace(dateRegex, '').trim();
          }

          // Limpiar palabras clave o ruidos
          let name = nameRaw.replace(/numero de vuelo ida/gi, '')
                            .replace(/vuelta/gi, '')
                            .replace(/rut[:]?/gi, '')
                            .replace(/pasajero[:]?/gi, '')
                            .replace(/viajo el.*$/gi, '')
                            .replace(/carnet.*$/gi, '')
                            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') // Eliminar caracteres especiales y números que no sean letras
                            .trim();
          
          if (name.length < 2) name = 'Pasajero Sin Nombre';
          
          newPassengers.push({ name, rut });
        });
      }
    }

    let parsedCheckIn = '';
    let parsedCheckOut = '';
    
    // Convertir de DD/MM/YYYY a YYYY-MM-DD
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length >= 3) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        return `${year}-${month}-${day}`;
      }
      return dateStr;
    };

    if (!checkIn && foundDates.length >= 1) setCheckIn(parsedCheckIn);
    if (!checkOut && foundDates.length >= 2) setCheckOut(parsedCheckOut);
    
    if (foundEmails.length > 0) setEmail(foundEmails[0]);

    // Extraer vuelos del texto si es que hay palabras clave (vuelo, ida, vuelta)
    const combinedText = lines.join(' ').toLowerCase();
    const flightMatches = combinedText.match(/(?:vuelo|ida|vuelta).*?\b([A-Za-z]{0,2}\s?\d{3,4})\b/g);
    
    if (flightMatches) {
       flightMatches.forEach(fm => {
          const numMatch = fm.match(/\b([A-Za-z]{0,2}\s?\d{3,4})\b/);
          if (numMatch) {
             const fNum = numMatch[1].replace(/\s/g, '').toUpperCase();
             if (fm.includes('ida') || fm.includes('llegada')) setFlightIn(fNum);
             else if (fm.includes('vuelta') || fm.includes('salida')) setFlightOut(fNum);
          }
       });
    } else {
      // Fallback
      if (!flightIn && possibleFlights.length >= 1) setFlightIn(possibleFlights[0].toUpperCase());
      if (!flightOut && possibleFlights.length >= 2) setFlightOut(possibleFlights[possibleFlights.length - 1].toUpperCase());
    }

    if (newPassengers.length > 0) {
      setPassengers(newPassengers);
    }
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', rut: '' }]);
  };

  const removePassenger = (index) => {
    const newP = [...passengers];
    newP.splice(index, 1);
    setPassengers(newP);
  };

  const handlePassengerChange = (index, field, value) => {
    const newP = [...passengers];
    newP[index][field] = value;
    setPassengers(newP);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const element = invoiceRef.current;
      
      const opt = {
        margin: [0.5, 1, 0.5, 1],
        filename: `Registro_Pasajeros_${titular ? titular.replace(/\s+/g, '_') : 'Sin_Nombre'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#FAF7F2'
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save().then(() => {
        setIsExporting(false);
      });
    }, 150);
  };

  const handleShare = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const element = invoiceRef.current;
      const opt = {
        margin: [0.5, 1, 0.5, 1],
        filename: `Registro_Pasajeros_${titular ? titular.replace(/\s+/g, '_') : 'Sin_Nombre'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#FAF7F2' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).outputPdf('blob').then((pdfBlob) => {
        setIsExporting(false);
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'Carta de Invitación - Cabañas Manuara',
            text: `Adjunto carta de invitación / registro de pasajeros para la reserva de ${titular || ''}.`
          }).catch(err => {
            console.error("Error al compartir:", err);
            // Si el usuario cancela no hacemos nada, pero si falla mostramos algo
          });
        } else {
          alert("Tu dispositivo o navegador no soporta enviar archivos directamente. El archivo se descargará.");
          handleExportPDF();
        }
      });
    }, 150);
  };

  return (
    <div className="passenger-page">
      <div className="page-header">
        <h1>Registro de Pasajeros</h1>
        <p className="text-secondary">Autocompletado de Reservas y Vuelos</p>
      </div>

      <div className="content-grid">
        <div className="left-panel">
          <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
            <h2><FileText size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Texto de la Reserva</h2>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Pega aquí la información que te envía el cliente (correo, whatsapp, etc). El sistema intentará extraer los datos automáticamente.
            </p>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Pega el texto aquí..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              style={{ resize: 'vertical', width: '100%' }}
            />
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={handleParseText}
              disabled={!rawText.trim()}
            >
              Analizar y Extraer Datos
            </button>
          </div>

          <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
            <h2><Plane size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Detalles del Viaje</h2>
            
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Titular de la Reserva</label>
                <input type="text" className="form-input" value={titular} onChange={e => setTitular(e.target.value)} placeholder="Ej: Juan Pérez" />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Ida (Check-in)</label>
                <input type="date" className="form-input" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Vuelta (Check-out)</label>
                <input type="date" className="form-input" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><PlaneLanding size={16} style={{ display: 'inline' }}/> Vuelo Llegada (Ida)</label>
                <select className="form-input" value={flightIn} onChange={e => setFlightIn(e.target.value)}>
                  <option value="">Seleccione vuelo...</option>
                  <option value="LA841">LA841</option>
                  <option value="LA843">LA843</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><PlaneTakeoff size={16} style={{ display: 'inline' }}/> Vuelo Salida (Vuelta)</label>
                <select className="form-input" value={flightOut} onChange={e => setFlightOut(e.target.value)}>
                  <option value="">Seleccione vuelo...</option>
                  <option value="LA842">LA842</option>
                  <option value="LA844">LA844</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label"><Mail size={16} style={{ display: 'inline' }}/> Correo de Contacto</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
              </div>
            </div>
          </div>

          <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2><Users size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Lista de Pasajeros</h2>
              <button className="btn btn-secondary" onClick={addPassenger} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                <Plus size={16} /> Agregar
              </button>
            </div>
            
            {passengers.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                No hay pasajeros agregados.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {passengers.map((p, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 2 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={p.name} 
                        onChange={e => handlePassengerChange(index, 'name', e.target.value)} 
                        placeholder="Nombre Completo" 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={p.rut} 
                        onChange={e => handlePassengerChange(index, 'rut', e.target.value)} 
                        placeholder="RUT" 
                      />
                    </div>
                    <button 
                      onClick={() => removePassenger(index)} 
                      className="btn-icon danger"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: PDF Preview */}
        <div className="right-panel">
          <div style={{ width: '100%', minWidth: isExporting ? '800px' : 'auto', transition: 'min-width 0.1s' }}>
            <div className="card glass-panel invoice-preview-container" style={{ padding: 0, background: '#FAF7F2' }} ref={invoiceRef}>
              <div className="invoice-header">
                <h2 className="invoice-title">CABAÑAS MANUARA</h2>
              <div className="invoice-subtitle">CÓDIGO SERNATUR: 34494</div>
              <h3 className="invoice-doc-type">CONFIRMACIÓN DE RESERVA</h3>
            </div>

            <div className="invoice-body">
              <div className="invoice-section">
                <div className="invoice-section-title">DETALLES DE LA RESERVA</div>
                <div className="invoice-detail-row">
                  <strong>Titular de la Reserva:</strong> <span>{titular || '—'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Fecha de Entrada:</strong> <span>{checkIn || '—'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Fecha de Salida:</strong> <span>{checkOut || '—'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Vuelo de Entrada:</strong> <span>{flightIn || '—'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Vuelo de Salida:</strong> <span>{flightOut || '—'}</span>
                </div>
              </div>

              <div className="invoice-section">
                <div className="invoice-section-title">LISTA DE PASAJEROS</div>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>N°</th>
                      <th>Nombre Completo</th>
                      <th>RUT / Pasaporte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{p.name || '—'}</td>
                        <td>{p.rut || '—'}</td>
                      </tr>
                    ))}
                    {passengers.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>Sin pasajeros registrados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', width: '100%' }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1 }}
              onClick={handleExportPDF}
            >
              <Download size={20} /> Guardar
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ flex: 1, backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none' }}
              onClick={handleShare}
            >
              <Share2 size={20} /> Compartir / Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
