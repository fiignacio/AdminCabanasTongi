import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar glass-panel">
        <button className="btn-icon" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Manuara App</h2>
      </div>

      {/* Overlay para cerrar haciendo tap afuera */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      <div className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <button className="mobile-close-btn btn-icon" onClick={() => setSidebarOpen(false)}>
          <X size={24} color="var(--text-primary)" />
        </button>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
