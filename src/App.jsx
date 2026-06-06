import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import CarCalendar from './pages/CarCalendar';
import Reservations from './pages/Reservations';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import AdminCars from './pages/AdminCars';
import QuoteGenerator from './pages/QuoteGenerator';
import PassengerRegistration from './pages/PassengerRegistration';
import PublicBooking from './pages/PublicBooking';
import SyncManager from './pages/SyncManager';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { fetchFromSupabase, initRealtimeSubscription, checkSession } = useStore();

  useEffect(() => {
    checkSession();
    fetchFromSupabase();
    const unsubscribe = initRealtimeSubscription();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchFromSupabase, initRealtimeSubscription, checkSession]);

  return (
    <Router>
      <Routes>
        {/* Vista Pública Principal */}
        <Route path="/" element={<PublicBooking />} />
        
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Panel de Administración y Herramientas (Protegido) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="cars-calendar" element={<CarCalendar />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Admin />} />
          <Route path="cars-settings" element={<AdminCars />} />
          <Route path="sync" element={<SyncManager />} />
          <Route path="tools/quote" element={<QuoteGenerator />} />
          <Route path="tools/passengers" element={<PassengerRegistration />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
