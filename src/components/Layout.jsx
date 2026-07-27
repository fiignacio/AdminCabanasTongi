import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import OnboardingModal from './OnboardingModal';
import { useStore } from '../store/useStore';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { businessConfig } = useStore();

  useEffect(() => {
    if (businessConfig?.primaryColor) {
      document.documentElement.style.setProperty('--accent-primary', businessConfig.primaryColor);
      document.documentElement.style.setProperty('--primary-color', businessConfig.primaryColor);
    }
  }, [businessConfig?.primaryColor]);

  return (
    <div className="app-container">
      {/* Onboarding Wizard popup for first launch */}
      <OnboardingModal />

      {/* Mobile Top Bar */}
      <div className="mobile-topbar glass-panel">
        <button className="btn-icon" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} color="var(--text-primary)" />
        </button>
        <h2 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>
          {businessConfig?.businessName || 'Panel de Administración'}
        </h2>
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
