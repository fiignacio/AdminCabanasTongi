import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { user, isAuthChecking } = useStore();

  if (isAuthChecking) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF7F2' }}>
        <Loader2 className="spin" size={48} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
