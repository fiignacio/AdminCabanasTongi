import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { parseSafeDate, formatSafeDate } from '../utils/dateUtils';
import { Users, FileText, Download, CheckCircle, Clock, Trash2, Edit2, Plus } from 'lucide-react';
import './Referrers.css';

const months = [
  { id: '01', name: 'Enero' }, { id: '02', name: 'Febrero' }, { id: '03', name: 'Marzo' },
  { id: '04', name: 'Abril' }, { id: '05', name: 'Mayo' }, { id: '06', name: 'Junio' },
  { id: '07', name: 'Julio' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Septiembre' },
  { id: '10', name: 'Octubre' }, { id: '11', name: 'Noviembre' }, { id: '12', name: 'Diciembre' }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 1 + i).toString());

const Referrers = () => {
  const { referrers, addReferrer, updateReferrer, deleteReferrer, reservations, updateReservation, cabins } = useStore();
  
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const handleSaveReferrer = (e) => {
    e.preventDefault();
    if (editingId) {
      updateReferrer(editingId, formData);
    } else {
      addReferrer({ ...formData, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    setFormData({ name: '', phone: '', email: '' });
    setEditingId(null);
  };

  const handleEdit = (ref) => {
    setFormData({ name: ref.name, phone: ref.phone || '', email: ref.email || '' });
    setEditingId(ref.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este referente? Las reservas asociadas perderán este enlace.')) {
      deleteReferrer(id);
    }
  };

  const handleToggleStatus = (res) => {
    const newStatus = res.referrerStatus === 'paid' ? 'pending' : 'paid';
    updateReservation(res.id, { referrerStatus: newStatus });
  };

  // Filtrar reservas que tienen referente y coinciden con el mes/año
  const relevantReservations = reservations.filter(res => {
    if (res.status === 'blocked' || res.status === 'archived') return false;
    if (!res.referrerId) return false;
    
    // Check if reservation overlaps with the selected month/year
    const resStart = parseSafeDate(res.startDate);
    const resEnd = parseSafeDate(res.endDate);
    if (!resStart || !resEnd) return false;
    
    // Convert selected month/year to Date range
    const filterStart = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
    const filterEnd = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0); // last day
    
    return resStart <= filterEnd && resEnd >= filterStart;
  });

  const generatePDF = (refId = null) => {
    const doc = new jsPDF();
    
    let refsToExport = referrers;
    if (refId) {
      refsToExport = referrers.filter(r => r.id === refId);
    }

    doc.setFontSize(18);
    doc.text(`Reporte de Referentes - ${months.find(m=>m.id === selectedMonth)?.name} ${selectedYear}`, 14, 20);
    
    let currentY = 30;

    refsToExport.forEach((ref) => {
      const refReservations = relevantReservations.filter(res => res.referrerId === ref.id);
      if (refReservations.length === 0) return;

      doc.setFontSize(14);
      doc.setTextColor(44, 76, 59); // var(--primary)
      doc.text(`Referente: ${ref.name}`, 14, currentY);
      currentY += 8;

      const tableData = refReservations.map(res => {
        const cabin = cabins.find(c => c.id === res.cabinId);
        return [
          res.clientName,
          cabin?.name || '?',
          `${formatSafeDate(res.startDate, 'dd/MM')} al ${formatSafeDate(res.endDate, 'dd/MM')}`,
          `$${Number(res.totalCost).toLocaleString('es-CL')}`,
          res.referrerStatus === 'paid' ? 'Cobrado' : 'Pendiente'
        ];
      });

      doc.autoTable({
        startY: currentY,
        head: [['Cliente', 'Cabaña', 'Estadía', 'Monto Total', 'Estado Pago']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [44, 76, 59] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 15;
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`Cuadre_Referentes_${selectedMonth}_${selectedYear}.pdf`);
  };

  const generateCSV = () => {
    const headers = ['Referente', 'Cliente', 'Cabana', 'Llegada', 'Salida', 'Monto Total', 'Estado'];
    const rows = [];

    referrers.forEach(ref => {
      const refReservations = relevantReservations.filter(res => res.referrerId === ref.id);
      refReservations.forEach(res => {
        const cabin = cabins.find(c => c.id === res.cabinId);
        rows.push([
          `"${ref.name}"`,
          `"${res.clientName}"`,
          `"${cabin?.name || ''}"`,
          `"${res.startDate}"`,
          `"${res.endDate}"`,
          res.totalCost,
          res.referrerStatus === 'paid' ? 'Cobrado' : 'Pendiente'
        ].join(','));
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Referentes_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="referrers-container">
      <div className="header-section">
        <h1>Cuadre de Referentes</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={generateCSV}><FileText size={18} /> Exportar CSV</button>
          <button className="btn btn-primary" onClick={() => generatePDF()}><Download size={18} /> Exportar PDF General</button>
        </div>
      </div>

      <div className="filters-glass">
        <div className="filter-group">
          <label>Mes</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="form-input">
            {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Año</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="form-input">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="filter-group" style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({name:'', phone:'', email:''}) }}>
            <Plus size={18} /> Nuevo Referente
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'Editar Referente' : 'Nuevo Referente'}</h3>
          <form onSubmit={handleSaveReferrer} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">Nombre</label>
              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">Guardar</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="referrers-grid">
        {referrers.map(ref => {
          const refReservations = relevantReservations.filter(res => res.referrerId === ref.id);
          
          const totalCobrado = refReservations.filter(r => r.referrerStatus === 'paid').reduce((sum, r) => sum + Number(r.totalCost), 0);
          const totalPendiente = refReservations.filter(r => r.referrerStatus !== 'paid').reduce((sum, r) => sum + Number(r.totalCost), 0);
          
          return (
            <div key={ref.id} className="referrer-card glass-panel">
              <div className="ref-header">
                <div className="ref-info">
                  <h3><Users size={20} /> {ref.name}</h3>
                  <p>{ref.phone || 'Sin teléfono'} {ref.email ? `| ${ref.email}` : ''}</p>
                </div>
                <div className="ref-actions">
                  <button className="btn-icon" onClick={() => handleEdit(ref)} title="Editar"><Edit2 size={18} /></button>
                  <button className="btn-icon" onClick={() => generatePDF(ref.id)} title="Descargar PDF individual"><Download size={18} /></button>
                  <button className="btn-icon text-danger" onClick={() => handleDelete(ref.id)} title="Eliminar"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="ref-stats">
                <div className="stat-box success">
                  <span className="stat-label">Cobrado</span>
                  <span className="stat-value">${totalCobrado.toLocaleString('es-CL')}</span>
                </div>
                <div className="stat-box warning">
                  <span className="stat-label">Pendiente</span>
                  <span className="stat-value">${totalPendiente.toLocaleString('es-CL')}</span>
                </div>
              </div>

              {refReservations.length > 0 ? (
                <div className="table-responsive">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Cliente / Cabaña</th>
                        <th>Fechas</th>
                        <th>Total Reserva</th>
                        <th>Estado Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refReservations.map(res => {
                        const cabin = cabins.find(c => c.id === res.cabinId);
                        const isPaid = res.referrerStatus === 'paid';
                        
                        return (
                          <tr key={res.id}>
                            <td>
                              <strong>{res.clientName}</strong><br/>
                              <span style={{ fontSize: '0.8rem', color: '#666' }}>{cabin?.name}</span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>
                              {formatSafeDate(res.startDate, 'dd/MM')} - {formatSafeDate(res.endDate, 'dd/MM')}
                            </td>
                            <td>${Number(res.totalCost).toLocaleString('es-CL')}</td>
                            <td>
                              <button 
                                className={`status-toggle ${isPaid ? 'paid' : 'pending'}`}
                                onClick={() => handleToggleStatus(res)}
                              >
                                {isPaid ? <><CheckCircle size={14} /> Cobrado</> : <><Clock size={14} /> Pendiente</>}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-text">No hay reservas referidas por esta persona en este período.</p>
              )}
            </div>
          );
        })}
        {referrers.length === 0 && (
          <p className="empty-text" style={{ gridColumn: '1 / -1' }}>No hay referentes registrados. Crea uno nuevo para comenzar.</p>
        )}
      </div>
    </div>
  );
};

export default Referrers;
