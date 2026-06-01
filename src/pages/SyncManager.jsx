import { useState, useEffect } from 'react';
import { Database, Calendar, Key, Link as LinkIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { createClient } from '@supabase/supabase-js';
import './SyncManager.css';

export default function SyncManager() {
  const { syncConfig, updateSyncConfig } = useStore();
  
  // Local state for forms
  const [supabaseUrl, setSupabaseUrl] = useState(syncConfig.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(syncConfig.supabaseKey || '');
  const [googleClientId, setGoogleClientId] = useState(syncConfig.googleClientId || '');
  
  // Status states
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // checking, connected, error, disconnected
  const [supabaseMessage, setSupabaseMessage] = useState('');

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      if (!syncConfig.supabaseUrl || !syncConfig.supabaseKey) {
        setSupabaseStatus('disconnected');
        return;
      }
      
      try {
        setSupabaseStatus('checking');
        const supabase = createClient(syncConfig.supabaseUrl, syncConfig.supabaseKey);
        
        // Intentar hacer una consulta simple para verificar la conexión
        // Asumimos que la tabla de reservas podría no existir aún, pero el cliente debería poder inicializarse y hacer ping.
        // Un ping simple es consultar una tabla que siempre existe internamente o atrapar el error de "tabla no existe" que confirma que la BD está conectada.
        const { data, error } = await supabase.from('reservations').select('id').limit(1);
        
        // Si el error es "tabla no existe" (PGRST205 o 42P01), significa que estamos conectados pero falta crear la tabla.
        if (error && error.code !== '42P01' && error.code !== 'PGRST205') { 
          throw error;
        }
        
        setSupabaseStatus('connected');
        setSupabaseMessage('Conectado exitosamente a Supabase.');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setSupabaseStatus('error');
        setSupabaseMessage(err.message || 'Error al conectar. Verifica tus credenciales.');
      }
    };
    
    testConnection();
  }, [syncConfig.supabaseUrl, syncConfig.supabaseKey]);

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    updateSyncConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseKey: supabaseKey.trim()
    });
    
    // Forzar sincronización inmediata al guardar
    setTimeout(() => {
      useStore.getState().fetchFromSupabase();
    }, 500);
  };

  const handleSaveGoogle = (e) => {
    e.preventDefault();
    updateSyncConfig({
      googleClientId: googleClientId.trim()
    });
  };

  return (
    <div className="sync-page">
      <div className="page-header">
        <h1>Sincronización de Datos</h1>
        <p className="text-secondary">Conecta la aplicación a la nube y a tu calendario para sincronización en tiempo real.</p>
      </div>

      <div className="sync-grid">
        {/* Supabase Card */}
        <div className="card glass-panel sync-card">
          <div className="sync-card-header">
            <Database size={24} color="#3ECF8E" />
            <h2 style={{ flex: 1 }}>Base de Datos (Supabase)</h2>
            {supabaseStatus === 'connected' && (
              <span className="status-badge connected"><CheckCircle2 size={14} /> Conectado</span>
            )}
            {supabaseStatus === 'error' && (
              <span className="status-badge disconnected"><AlertCircle size={14} /> Error</span>
            )}
            {supabaseStatus === 'disconnected' && (
              <span className="status-badge disconnected">Desconectado</span>
            )}
            {supabaseStatus === 'checking' && (
              <span className="status-badge"><RefreshCw size={14} className="spin" /> Verificando...</span>
            )}
          </div>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Supabase permite guardar las reservas y cabañas en la nube, para que todos tus dispositivos estén sincronizados.
          </div>

          <form onSubmit={handleSaveSupabase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><LinkIcon size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Supabase Project URL</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://xyzcompany.supabase.co" 
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label"><Key size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Supabase Anon Key</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5c..." 
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
              />
            </div>
            
            {supabaseMessage && (
              <div style={{ fontSize: '0.85rem', color: supabaseStatus === 'error' ? 'var(--danger)' : 'var(--success)' }}>
                {supabaseMessage}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Guardar Credenciales de Supabase
            </button>
          </form>
          
          <div className="help-text" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <strong>¿No tienes claves?</strong> Crea un proyecto gratuito en <a href="https://supabase.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>supabase.com</a>, ve a Project Settings &gt; API y copia la URL y la llave 'anon public'.
          </div>
        </div>

        {/* Google Calendar Card */}
        <div className="card glass-panel sync-card">
          <div className="sync-card-header">
            <Calendar size={24} color="#4285F4" />
            <h2 style={{ flex: 1 }}>Google Calendar</h2>
            {!syncConfig.googleClientId ? (
              <span className="status-badge disconnected">Desconectado</span>
            ) : (
              <span className="status-badge connected"><CheckCircle2 size={14} /> Listo para OAuth</span>
            )}
          </div>
          
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Integra tus reservas directamente con tu Google Calendar. Crea y actualiza eventos automáticamente al registrar una nueva estadía.
          </div>

          <form onSubmit={handleSaveGoogle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label"><Key size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> Google OAuth Client ID</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="1234567890-xyz.apps.googleusercontent.com" 
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Guardar Configuración de Google
            </button>
          </form>
          
          <div className="help-text" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <strong>¿Cómo obtenerlo?</strong> Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>Google Cloud Console</a>, crea un proyecto, habilita "Google Calendar API", y crea credenciales OAuth 2.0 (Aplicación web).
          </div>
        </div>
      </div>
    </div>
  );
}
