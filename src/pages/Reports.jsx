import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, Filter, Car, Compass, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { parseSafeDate, formatSafeDate } from '../utils/dateUtils';
import './Reports.css';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Reports = () => {
  const { carReservations, cars, tours, tourReservations } = useStore();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Filter Car Reservations by month & year
  const filteredCarReservations = carReservations.filter(res => {
    if (!res.startDate) return false;
    const date = parseSafeDate(res.startDate);
    return date.getMonth() === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
  });

  // Filter Tour Reservations by month & year
  const filteredTourReservations = tourReservations.filter(res => {
    if (!res.date) return false;
    const date = parseSafeDate(res.date);
    return date.getMonth() === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
  });

  // Totals
  const carsTotal = filteredCarReservations.reduce((sum, r) => sum + Number(r.totalCost || 0), 0);
  const carsCount = filteredCarReservations.length;

  const toursTotal = filteredTourReservations.reduce((sum, r) => sum + Number(r.totalCost || 0), 0);
  const toursCount = filteredTourReservations.length;
  const toursPaxTotal = filteredTourReservations.reduce((sum, r) => sum + Number(r.paxCount || 1), 0);

  const grandTotal = carsTotal + toursTotal;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Reporte Consolidado - ${months[selectedMonth]} ${selectedYear}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);

    doc.setFontSize(14);
    doc.text('1. Resumen Mensual Consolidado', 14, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Línea de Negocio', 'Monto Total ($)']],
      body: [
        ['Arriendo de Vehículos', `$${carsTotal.toLocaleString('es-CL')}`],
        ['Tours y Excursiones', `$${toursTotal.toLocaleString('es-CL')}`],
        ['TOTAL CONSOLIDADO', `$${grandTotal.toLocaleString('es-CL')}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 76, 59] }
    });

    doc.save(`REPORTE_${months[selectedMonth].toUpperCase()}_${selectedYear}.pdf`);
  };

  return (
    <div className="reports-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Reportes y Analítica Mensual</h1>
          <p className="text-secondary">Consolidado de ingresos generales: Arriendo de Vehículos y Tours.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleExportPDF} 
          disabled={filteredCarReservations.length === 0 && filteredTourReservations.length === 0}
        >
          <Download size={20} /> Exportar Reporte a PDF
        </button>
      </div>

      {/* Controles de Filtro por Mes y Año */}
      <div className="card glass-panel filter-section" style={{ marginBottom: '1.5rem' }}>
        <div className="filter-header">
          <Filter size={20} />
          <h3>Filtro por Período Mensual</h3>
        </div>
        <div className="filter-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: '150px' }}>
            <label className="form-label">Mes</label>
            <select 
              className="form-input" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: '120px' }}>
            <label className="form-label">Año</label>
            <select 
              className="form-input" 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen Consolidado */}
      <div className="reports-summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card glass-panel report-card">
          <div className="report-card-icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
            <Car size={28} />
          </div>
          <div className="report-card-info">
            <span className="text-secondary">Arriendo Vehículos</span>
            <h3>${carsTotal.toLocaleString('es-CL')}</h3>
            <small>{carsCount} arriendos de auto</small>
          </div>
        </div>

        <div className="card glass-panel report-card">
          <div className="report-card-icon" style={{ background: 'rgba(142, 68, 173, 0.1)', color: '#8e44ad' }}>
            <Compass size={28} />
          </div>
          <div className="report-card-info">
            <span className="text-secondary">Tours y Excursiones</span>
            <h3>${toursTotal.toLocaleString('es-CL')}</h3>
            <small>{toursCount} tours vendidos ({toursPaxTotal} Pax)</small>
          </div>
        </div>

        <div className="card glass-panel report-card highlight">
          <div className="report-card-icon" style={{ background: 'rgba(39, 174, 96, 0.15)', color: 'var(--success)' }}>
            <DollarSign size={28} />
          </div>
          <div className="report-card-info">
            <span className="text-secondary">Total Consolidado Mes</span>
            <h3 style={{ color: 'var(--success)' }}>${grandTotal.toLocaleString('es-CL')}</h3>
            <small>Vehículos + Tours</small>
          </div>
        </div>
      </div>

      {/* Tablas de Desglose */}
      <div className="reports-tables-container" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* 1. Tabla Vehículos */}
        <div className="card glass-panel">
          <h2><Car size={22} style={{ display: 'inline', marginRight: 8, color: '#3498db' }} /> Arriendos de Vehículos ({months[selectedMonth]} {selectedYear})</h2>
          <div className="table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Vehículo</th>
                  <th>Cliente</th>
                  <th>Período</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredCarReservations.map(res => {
                  const car = cars.find(c => c.id === res.carId);
                  return (
                    <tr key={res.id}>
                      <td><strong>{car ? car.name : 'Vehículo'}</strong> ({car ? car.plate : ''})</td>
                      <td>{res.clientName}</td>
                      <td>{formatSafeDate(res.startDate, 'dd/MM')} al {formatSafeDate(res.endDate, 'dd/MM')}</td>
                      <td><strong>${Number(res.totalCost).toLocaleString('es-CL')}</strong></td>
                    </tr>
                  );
                })}
                {filteredCarReservations.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay arriendos en este período</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Tabla Tours */}
        <div className="card glass-panel">
          <h2><Compass size={22} style={{ display: 'inline', marginRight: 8, color: '#8e44ad' }} /> Tours y Excursiones ({months[selectedMonth]} {selectedYear})</h2>
          <div className="table-container">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Cliente</th>
                  <th>Fecha y Hora</th>
                  <th>Pax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredTourReservations.map(res => {
                  const tour = tours.find(t => t.id === res.tourId);
                  return (
                    <tr key={res.id}>
                      <td><strong>{tour ? tour.name : 'Tour'}</strong></td>
                      <td>{res.clientName}</td>
                      <td>{formatSafeDate(res.date, 'dd/MM/yyyy')} {res.time || ''}</td>
                      <td>{res.paxCount} pers.</td>
                      <td><strong>${Number(res.totalCost).toLocaleString('es-CL')}</strong></td>
                    </tr>
                  );
                })}
                {filteredTourReservations.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay tours en este período</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
