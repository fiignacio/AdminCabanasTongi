import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, BarChart3, Tent, Settings, Calculator, Users, RefreshCw, Car, LogOut, WifiOff, CloudOff, Network } from 'lucide-react';
import { useStore } from '../store/useStore';
import './Sidebar.css';

const Sidebar = ({ onClose }) => {
  const { logout, offlineQueue } = useStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/calendar', name: 'Cal. Cabañas', icon: <CalendarDays size={20} /> },
    { path: '/admin/cars-calendar', name: 'Cal. Vehículos', icon: <Car size={20} /> },
    { path: '/admin/reservations', name: 'Reservas', icon: <BookOpen size={20} /> },
    { path: '/admin/reports', name: 'Reportes', icon: <BarChart3 size={20} /> },
    { path: '/admin/tools/quote', name: 'Cotizador', icon: <Calculator size={20} /> },
    { path: '/admin/referrers', name: 'Referentes', icon: <Network size={20} /> },
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
      
      {!isOnline && (
        <div style={{ margin: '0.5rem 1rem', padding: '0.5rem', background: 'rgba(231, 76, 60, 0.1)', color: 'var(--danger)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <WifiOff size={16} /> Modo Sin Conexión
        </div>
      )}
      {offlineQueue.length > 0 && (
        <div style={{ margin: '0.5rem 1rem', padding: '0.5rem', background: 'rgba(243, 156, 18, 0.1)', color: '#d35400', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          <CloudOff size={16} /> {offlineQueue.length} cambio(s) por subir
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="sidebar-scrollable" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', paddingRight: '0.25rem' }}>
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
        </div>
        
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <NavLink 
            to="/" 
            className="nav-item"
            style={{ color: 'var(--accent-secondary)' }}
            onClick={onClose}
          >
            <Tent size={20} />
            <span>Ver Vista Pública</span>
          </NavLink>
          <button 
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginTop: '0.5rem' }}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
