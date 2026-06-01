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

function App() {
  const { fetchFromSupabase } = useStore();

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  return (
    <Router>
      <Routes>
        {/* Vista Pública Principal */}
        <Route path="/" element={<PublicBooking />} />

        {/* Panel de Administración y Herramientas */}
        <Route path="/admin" element={<Layout />}>
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
      </Routes>
    </Router>
  );
}

export default App;
