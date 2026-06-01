import { useState, useRef } from 'react';
import { Download, Calendar, Users, Car, Moon, Sun } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { format, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useStore } from '../store/useStore';
import './QuoteGenerator.css';

export default function QuoteGenerator() {
  const { prices } = useStore();
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 3));
  const [isHighSeason, setIsHighSeason] = useState(false);
  const [titular, setTitular] = useState('');
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [babies, setBabies] = useState(0);

  const [includeCar, setIncludeCar] = useState(false);
  const [carDays, setCarDays] = useState(1);

  const invoiceRef = useRef(null);

  const nights = Math.max(1, differenceInDays(endDate, startDate) || 1);
  const totalGuests = adults + children + babies;

  // Pricing Logic from Global Store
  let priceAdult = isHighSeason ? prices.highSeasonAdult : prices.lowSeasonAdult;
  // Descuento para grupos grandes (como en el original)
  if (totalGuests >= 10) {
    priceAdult = 25000;
  }
  const priceChild = prices.child;

  const totalAdults = adults * priceAdult * nights;
  const totalChildren = children * priceChild * nights;
  
  // Extra Car
  const carPricePerDay = carDays >= 3 ? 40000 : 45000;
  const totalCar = includeCar ? carDays * carPricePerDay : 0;

  const subtotal = totalAdults + totalChildren;
  const grandTotal = subtotal + totalCar;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const element = invoiceRef.current;
      
      const opt = {
        margin: [0.5, 1, 0.5, 1], // Superior, Derecho, Inferior, Izquierdo
        filename: `Presupuesto_Cabanas_${titular ? titular.replace(/\s+/g, '_') : 'Sin_Nombre'}.pdf`,
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

  const handleStartDateChange = (e) => {
    const date = new Date(e.target.value + 'T12:00:00');
    setStartDate(date);
    if (date >= endDate) {
      setEndDate(addDays(date, 1));
    }
  };

  const handleEndDateChange = (e) => {
    const date = new Date(e.target.value + 'T12:00:00');
    if (date > startDate) {
      setEndDate(date);
    }
  };

  return (
    <div className="quote-page">
      <div className="page-header">
        <h1>Cotizador de Estadía</h1>
        <p className="text-secondary">Generador de Presupuestos en PDF</p>
      </div>

      <div className="content-grid">
        <div className="left-panel">
          
          <div className="card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <h2><Calendar size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Datos de la Reserva</h2>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Titular de la Reserva</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Ej: Juan Pérez"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
              />
            </div>

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Check-in</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            <div className="form-group checkbox-group" style={{ marginTop: '1rem', background: isHighSeason ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                <input 
                  type="checkbox" 
                  checked={isHighSeason} 
                  onChange={(e) => setIsHighSeason(e.target.checked)}
                />
                {isHighSeason ? <Sun size={20} color="var(--primary-color)"/> : <Moon size={20} color="var(--text-secondary)"/>}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>Temporada Alta</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Utiliza la tarifa global de Temporada Alta</span>
                </div>
              </label>
            </div>
          </div>

          <div className="card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <h2><Users size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Húespedes</h2>
            
            <div className="counter-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="counter-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>Adultos</strong>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Mayores de 15 años</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn-icon" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{adults}</span>
                  <button className="btn-icon" onClick={() => setAdults(adults + 1)}>+</button>
                </div>
              </div>

              <div className="counter-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <strong>Niños</strong>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>7 a 15 años (Tarifa reducida)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn-icon" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{children}</span>
                  <button className="btn-icon" onClick={() => setChildren(children + 1)}>+</button>
                </div>
              </div>

              <div className="counter-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Bebés</strong>
                  <div className="text-secondary" style={{ fontSize: '0.85rem' }}>Menores de 7 años (Gratis)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button className="btn-icon" onClick={() => setBabies(Math.max(0, babies - 1))}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{babies}</span>
                  <button className="btn-icon" onClick={() => setBabies(babies + 1)}>+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card glass-panel">
            <h2>Servicios Extra</h2>
            
            <div style={{ marginTop: '1rem' }}>
              <div className="form-group checkbox-group" style={{ background: includeCar ? 'rgba(var(--primary-color-rgb), 0.1)' : 'transparent', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={includeCar} 
                    onChange={(e) => setIncludeCar(e.target.checked)}
                  />
                  <Car size={20} color="var(--primary-color)"/>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong>Arriendo de Vehículo</strong>
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{formatCurrency(carPricePerDay)} por día</span>
                  </div>
                </label>

                {includeCar && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', paddingLeft: '2rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Cantidad de días:</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={carDays} 
                      onChange={(e) => setCarDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-input"
                      style={{ width: '80px', padding: '0.5rem' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: PDF Preview */}
        <div className="right-panel">
          <div style={{ width: '100%', minWidth: isExporting ? '800px' : 'auto', transition: 'min-width 0.1s' }}>
            <div className="card glass-panel invoice-preview-container" style={{ background: '#FAF7F2' }} ref={invoiceRef}>
              <div className="invoice-header">
                <h2 className="invoice-title">CABAÑAS MANUARA</h2>
              <div className="invoice-subtitle">CÓDIGO SERNATUR: 34494</div>
              <h3 className="invoice-doc-type">PRESUPUESTO DE ESTADÍA</h3>
            </div>

            <div className="invoice-body">
              <div className="invoice-section">
                <div className="invoice-detail-row">
                  <strong>Titular:</strong> <span>{titular || '—'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Check-in:</strong> <span>{format(startDate, "dd MMM yyyy", { locale: es })}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Check-out:</strong> <span>{format(endDate, "dd MMM yyyy", { locale: es })}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Duración:</strong> <span>{nights} {nights === 1 ? 'noche' : 'noches'}</span>
                </div>
                <div className="invoice-detail-row">
                  <strong>Húespedes:</strong> <span>{totalGuests} total</span>
                </div>
              </div>

              <div className="invoice-section">
                <div className="invoice-section-title">DESGLOSE</div>
                
                {adults > 0 && (
                  <div className="invoice-detail-row">
                    <span>{adults}x Adultos ({formatCurrency(priceAdult)}/noche):</span>
                    <span>{formatCurrency(totalAdults)}</span>
                  </div>
                )}
                
                {children > 0 && (
                  <div className="invoice-detail-row">
                    <span>{children}x Niños ({formatCurrency(priceChild)}/noche):</span>
                    <span>{formatCurrency(totalChildren)}</span>
                  </div>
                )}

                {babies > 0 && (
                  <div className="invoice-detail-row">
                    <span>{babies}x Bebés (Gratis):</span>
                    <span>$0</span>
                  </div>
                )}

                {includeCar && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="invoice-section-title">EXTRAS</div>
                    <div className="invoice-detail-row">
                      <span>Arriendo Vehículo ({carDays} {carDays === 1 ? 'día' : 'días'}):</span>
                      <span>{formatCurrency(totalCar)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#fffef9', borderLeft: '4px solid #d4a373', fontSize: '0.85rem', color: '#6b4c2a' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Detalles del Servicio:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Incluye servicio de traslado desde y hacia el aeropuerto.</li>
                  <li>Incluye bienvenida con collar de flores.</li>
                  <li>No incluye servicio de desayuno.</li>
                </ul>
              </div>

              <div className="invoice-detail-row" style={{ fontSize: '1.4rem', fontWeight: 'bold', borderTop: '2px solid #333', marginTop: '1rem', paddingTop: '1rem' }}>
                <span>Total Estimado:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleExportPDF}>
            <Download size={20} /> Exportar a PDF
          </button>
        </div>
      </div>
    </div>
  );
}
