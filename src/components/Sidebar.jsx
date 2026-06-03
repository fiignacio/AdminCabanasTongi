import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, BarChart3, Tent, Settings, Calculator, Users, RefreshCw, Car } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/calendar', name: 'Cal. Cabañas', icon: <CalendarDays size={20} /> },
    { path: '/admin/cars-calendar', name: 'Cal. Vehículos', icon: <Car size={20} /> },
    { path: '/admin/reservations', name: 'Reservas', icon: <BookOpen size={20} /> },
    { path: '/admin/reports', name: 'Reportes', icon: <BarChart3 size={20} /> },
    { path: '/admin/tools/quote', name: 'Cotizador', icon: <Calculator size={20} /> },
    { path: '/admin/tools/passengers', name: 'Pasajeros', icon: <Users size={20} /> },
    { path: '/admin/sync', name: 'Sincronización', icon: <RefreshCw size={20} /> },
    { path: '/admin/cars-settings', name: 'Flota Vehículos', icon: <Settings size={20} /> },
    { path: '/admin/settings', name: 'Conf. Cabañas', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <Tent className="logo-icon" size={28} />
        <h2 style={{ fontSize: '1.25rem' }}>Cabañas Manuara</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
        
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <NavLink 
            to="/" 
            className="nav-item"
            style={{ color: 'var(--accent-secondary)' }}
            onClick={onClose}
          >
            <Tent size={20} />
            <span>Ver Vista Pública</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
