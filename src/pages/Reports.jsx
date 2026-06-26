import { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, Filter, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { parseSafeDate, formatSafeDate } from '../utils/dateUtils';
import './Reports.css';

const Reports = () => {
  const { reservations, cabins, carReservations, cars } = useStore();
  const [filterType, setFilterType] = useState('owner'); // 'owner' or 'cabin'
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Mes y Año actuales por defecto
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const reportRef = useRef(null);

  const owners = [
    { id: 'owner1', name: 'Dueño 1 (Cabaña Grande y Pequeña)' },
    { id: 'owner2', name: 'Dueño 2 (Cabaña Mediana 1 y 2)' }
  ];

  const months = [
    { id: 'all', name: 'Todos los meses' },
    { id: '0', name: 'Enero' }, { id: '1', name: 'Febrero' }, { id: '2', name: 'Marzo' },
    { id: '3', name: 'Abril' }, { id: '4', name: 'Mayo' }, { id: '5', name: 'Junio' },
    { id: '6', name: 'Julio' }, { id: '7', name: 'Agosto' }, { id: '8', name: 'Septiembre' },
    { id: '9', name: 'Octubre' }, { id: '10', name: 'Noviembre' }, { id: '11', name: 'Diciembre' }
  ];

  const filteredReservations = useMemo(() => {
    let results = reservations;

    // Filtrar por Dueño / Cabaña
    if (selectedFilter !== 'all') {
      if (filterType === 'owner') {
        const ownerCabins = cabins.filter(c => c.ownerId === selectedFilter).map(c => c.id);
        results = results.filter(res => ownerCabins.includes(res.cabinId));
      } else {
        results = results.filter(res => res.cabinId === selectedFilter);
      }
    }

    // Filtrar por Mes y Año
    if (selectedMonth !== 'all') {
      results = results.filter(res => {
        const d = parseSafeDate(res.startDate);
        return d.getMonth().toString() === selectedMonth && d.getFullYear().toString() === selectedYear;
      });
    }

    // Excluir bloqueos
    return results.filter(res => res.status !== 'blocked');

  }, [reservations, cabins, filterType, selectedFilter, selectedMonth, selectedYear]);

  const filteredCarReservations = useMemo(() => {
    let results = carReservations;
    if (selectedMonth !== 'all') {
      results = results.filter(res => {
        const d = parseSafeDate(res.startDate);
        return d.getMonth().toString() === selectedMonth && d.getFullYear().toString() === selectedYear;
      });
    }
    return results.filter(res => res.status === 'confirmed');
  }, [carReservations, selectedMonth, selectedYear]);

  const totalIncome = filteredReservations.reduce((acc, res) => acc + Number(res.totalCost), 0);
  const totalReservations = filteredReservations.length;

  const totalCarIncome = filteredCarReservations.reduce((acc, res) => acc + Number(res.totalCost), 0);
  const carIncomeByCar = cars.map(car => {
    const resForCar = filteredCarReservations.filter(r => r.carId === car.id);
    return {
      car,
      total: resForCar.reduce((acc, r) => acc + Number(r.totalCost), 0),
      count: resForCar.length
    };
  }).filter(c => c.total > 0 || c.count > 0);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSelectedFilter('all');
  };

  const handleExportPDF = () => {
    const element = reportRef.current;
    
    // Configuración para el PDF
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Reporte_${filterType === 'owner' ? 'Dueño' : 'Cabañas'}_${months.find(m => m.id === selectedMonth)?.name || 'General'}_${selectedYear}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="reports-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reportes y Analítica</h1>
        <button className="btn btn-primary" onClick={handleExportPDF} disabled={filteredReservations.length === 0}>
          <Download size={20} /> Exportar Reporte a PDF
        </button>
      </div>

      <div className="card glass-panel filter-section">
        <div className="filter-header">
          <Filter size={20} />
          <h3>Filtros de Reporte</h3>
        </div>
        
        <div className="filter-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1' }}>
            <label className="form-label">Segmentar por:</label>
            <select className="form-input" value={filterType} onChange={handleFilterTypeChange}>
              <option value="owner">Por Dueño</option>
              <option value="cabin">Por Cabaña</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: '1.5' }}>
            <label className="form-label">Seleccionar:</label>
            <select className="form-input" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
              <option value="all">Todos</option>
              {filterType === 'owner' ? (
                owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
              ) : (
                cabins.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              )}
            </select>
          </div>

          <div className="form-group" style={{ flex: '1' }}>
            <label className="form-label">Mes:</label>
            <select className="form-input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flex: '0.8' }}>
            <label className="form-label">Año:</label>
            <input 
              type="number" 
              className="form-input" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              min="2020" 
              max="2100" 
            />
          </div>
        </div>
      </div>

      <div className="report-results">
        <div className="stat-card glass-panel">
          <div className="stat-icon"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Cabañas</span>
            <h2 className="stat-value text-success">${totalIncome.toLocaleString('es-CL')}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <div className="stat-icon" style={{ color: 'var(--accent-primary)', background: 'rgba(59,130,246,0.1)' }}><BarChart3 size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Vehículos</span>
            <h2 className="stat-value" style={{ color: 'var(--accent-primary)' }}>${totalCarIncome.toLocaleString('es-CL')}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}><BarChart3 size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Ingresos Totales (Global)</span>
            <h2 className="stat-value" style={{ color: '#8b5cf6' }}>${(totalIncome + totalCarIncome).toLocaleString('es-CL')}</h2>
          </div>
        </div>
      </div>

      {carIncomeByCar.length > 0 && (
        <div className="card glass-panel" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Desglose por Vehículo (Para pagos a terceros)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {carIncomeByCar.map(item => (
              <div key={item.car.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>{item.car.name} ({item.car.plate})</h4>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#64748b' }}>{item.count} Arriendos</p>
                <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>${item.total.toLocaleString('es-CL')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenedor Ref para el PDF */}
      <div className="card glass-panel table-container" ref={reportRef} style={{ background: '#fff', color: '#333' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #2c4c3b', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ color: '#2c4c3b', margin: '0 0 0.5rem 0' }}>Reporte de Llegadas y Transfers</h2>
            <p style={{ margin: 0, color: '#666' }}>
              Segmento: {selectedFilter === 'all' ? 'General' : (filterType === 'owner' ? owners.find(o => o.id === selectedFilter)?.name : cabins.find(c => c.id === selectedFilter)?.name)} | 
              Período: {selectedMonth === 'all' ? 'Histórico' : `${months.find(m => m.id === selectedMonth)?.name} ${selectedYear}`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, color: '#16a34a' }}>{totalReservations} reservas contabilizadas</h3>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <p className="empty-text">No hay datos para mostrar con este filtro.</p>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #eee' }}>
            <table className="reports-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead style={{ background: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unidad</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estadía</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vuelos (In / Out)</th>
                  <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Pax (A/N/B)</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(res => {
                  const cabin = cabins.find(c => c.id === res.cabinId);
                  return (
                    <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>{res.clientName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: cabin?.color ? `${cabin.color}20` : '#e2e8f0', color: cabin?.color || '#475569', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>
                          {cabin?.name || 'Vehículo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#334155' }}>{formatSafeDate(res.startDate, 'dd/MM')}</strong> al <strong style={{ color: '#334155' }}>{formatSafeDate(res.endDate, 'dd/MM')}</strong>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span>In: <strong style={{ color: '#334155' }}>{res.flightIn || '--'}</strong></span>
                          <span>Out: <strong style={{ color: '#334155' }}>{res.flightOut || '--'}</strong></span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        <span title="Adultos">{res.adults || 0}</span> / <span title="Niños">{res.childrenCount || 0}</span> / <span title="Bebés">{res.babiesCount || 0}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

