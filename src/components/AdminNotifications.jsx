import { useState, useEffect } from 'react';
import { Bell, Car, Compass, MessageCircle, X, CheckCircle2, Volume2, ShieldCheck, Share2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatSafeDate, parseSafeDate } from '../utils/dateUtils';
import WhatsAppModal from './WhatsAppModal';
import { generateAdminDailySummaryMessage, generateWhatsAppLink } from '../utils/whatsapp';
import { isToday, isTomorrow } from 'date-fns';

export default function AdminNotifications() {
  const { carReservations, cars, tourReservations, tours, businessConfig } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');

  // Active WhatsApp modal state for client reminders
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waReservation, setWaReservation] = useState(null);
  const [waType, setWaType] = useState('car');
  const [waContextName, setWaContextName] = useState('');

  // Check Browser Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Play audio chime beep
  const playAudioChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio chime not supported or muted');
    }
  };

  // Request system notification permission
  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta Notificaciones Push del sistema.');
      return;
    }
    const result = await Notification.requestPermission();
    setPushPermission(result);
    if (result === 'granted') {
      playAudioChime();
      new Notification(`🟢 Notificaciones Activas - ${businessConfig?.businessName || 'Administrador'}`, {
        body: 'Recibirás avisos del sistema directamente en la pantalla de tu computador, tablet o teléfono.',
        icon: businessConfig?.logoUrl || '/icon-192.png'
      });
    }
  };

  // Find car pickups or returns for today or tomorrow
  const upcomingCars = carReservations.filter(res => {
    if (!res.startDate || !res.endDate) return false;
    const start = parseSafeDate(res.startDate);
    const end = parseSafeDate(res.endDate);
    return isToday(start) || isTomorrow(start) || isToday(end) || isTomorrow(end);
  });

  // Find tour departures for today or tomorrow
  const upcomingTours = tourReservations.filter(res => {
    if (!res.date) return false;
    const date = parseSafeDate(res.date);
    return isToday(date) || isTomorrow(date);
  });

  const totalAlerts = upcomingCars.length + upcomingTours.length;

  const togglePanel = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      playAudioChime();
    }
  };

  const openWhatsApp = (res, type, contextName) => {
    setWaReservation(res);
    setWaType(type);
    setWaContextName(contextName);
    setWaModalOpen(true);
    setIsOpen(false);
  };

  // Send summary directly to Admin's WhatsApp
  const handleSendAdminSummary = () => {
    const adminPhone = businessConfig?.contactPhone || '';
    if (!adminPhone) {
      alert('Por favor configura primero el Teléfono de Contacto del Administrador en la sección de Personalización.');
      return;
    }

    const carsFormatted = upcomingCars.map(res => {
      const car = cars.find(c => c.id === res.carId);
      const isStartToday = isToday(parseSafeDate(res.startDate));
      return {
        res,
        carName: car ? `${car.brand} ${car.model}` : 'Vehículo',
        type: isStartToday ? 'Retiro HOY' : 'Retiro Mañana',
        dateStr: formatSafeDate(res.startDate, 'dd/MM')
      };
    });

    const toursFormatted = upcomingTours.map(res => {
      const tour = tours.find(t => t.id === res.tourId);
      const isTourToday = isToday(parseSafeDate(res.date));
      return {
        res,
        tourName: tour ? tour.name : 'Tour',
        type: isTourToday ? 'Salida HOY' : 'Salida Mañana',
        dateStr: formatSafeDate(res.date, 'dd/MM')
      };
    });

    const summaryMsg = generateAdminDailySummaryMessage(
      carsFormatted,
      toursFormatted,
      businessConfig?.businessName || 'Mi Administración'
    );

    const waUrl = generateWhatsAppLink(adminPhone, summaryMsg);
    if (waUrl) {
      window.open(waUrl, '_blank');
    }
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button 
          className="btn-icon" 
          onClick={togglePanel}
          style={{ 
            position: 'relative', 
            background: isOpen ? 'rgba(0,0,0,0.06)' : 'transparent',
            padding: '8px',
            borderRadius: '50%'
          }}
          title="Avisos Notificaciones Internas para el Administrador (Móvil / Tablet / PC)"
        >
          <Bell size={22} color={totalAlerts > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
          {totalAlerts > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: '800',
              boxShadow: '0 0 0 2px #ffffff'
            }}>
              {totalAlerts}
            </span>
          )}
        </button>

        {/* Dropdown Notifications Panel */}
        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '370px',
            maxHeight: '520px',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            zIndex: 99999,
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Panel de Alertas (Admin)</h3>
              </div>
              <button className="btn-icon" onClick={() => setIsOpen(false)} style={{ padding: '2px' }}><X size={18} /></button>
            </div>

            {/* System Push Notification Banner */}
            <div style={{
              background: pushPermission === 'granted' ? 'rgba(34, 197, 94, 0.08)' : '#f8fafc',
              border: `1px solid ${pushPermission === 'granted' ? 'rgba(34, 197, 94, 0.3)' : '#cbd5e1'}`,
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {pushPermission === 'granted' ? (
                  <ShieldCheck size={18} color="#16a34a" />
                ) : (
                  <Volume2 size={18} color="#64748b" />
                )}
                <div>
                  <strong style={{ fontSize: '0.8rem', color: '#0f172a', display: 'block' }}>
                    {pushPermission === 'granted' ? 'Notificaciones Push Activas' : 'Alertas en Pantalla / Móvil'}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {pushPermission === 'granted' ? 'Recibirás avisos en PC, Tablet y Móvil' : 'Activa notificaciones del sistema'}
                  </span>
                </div>
              </div>

              {pushPermission !== 'granted' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={requestPushPermission}
                  style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}
                >
                  Activar
                </button>
              )}
            </div>

            {/* Send Summary to Admin WhatsApp */}
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleSendAdminSummary}
              style={{
                width: '100%',
                marginBottom: '1rem',
                padding: '0.55rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                color: '#15803d',
                fontWeight: '700'
              }}
            >
              <Share2 size={16} /> Enviar Resumen Diario a mi WhatsApp
            </button>

            {totalAlerts === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                <CheckCircle2 size={32} color="#22c55e" style={{ margin: '0 auto 0.5rem auto' }} />
                <span>¡Sin avisos pendientes para hoy ni mañana!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 🚗 Entregas de Vehículos */}
                {upcomingCars.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🚗 Arriendos (Entregas / Devoluciones)
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {upcomingCars.map(res => {
                        const car = cars.find(c => c.id === res.carId);
                        const isStartToday = isToday(parseSafeDate(res.startDate));
                        return (
                          <div key={res.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{res.clientName}</strong>
                              <span style={{ fontSize: '0.78rem', color: '#475569' }}>{car ? `${car.brand} ${car.model}` : 'Vehículo'} ({car ? car.plate : ''})</span>
                              <div style={{ fontSize: '0.72rem', color: isStartToday ? '#2563eb' : '#64748b', fontWeight: '600', marginTop: '2px' }}>
                                {isStartToday ? '⚡ Retiro HOY' : '📅 Retiro Mañana'} ({formatSafeDate(res.startDate, 'dd/MM')})
                              </div>
                            </div>
                            <button 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#25D366', borderColor: '#25D366' }}
                              onClick={() => openWhatsApp(res, 'car', car ? `${car.brand} ${car.model}` : 'Vehículo')}
                              title="Enviar aviso de recordatorio al cliente por WhatsApp"
                            >
                              <MessageCircle size={14} /> Cliente
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 🧭 Próximos Tours */}
                {upcomingTours.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🧭 Tours y Excursiones Próximas
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {upcomingTours.map(res => {
                        const tour = tours.find(t => t.id === res.tourId);
                        const isTourToday = isToday(parseSafeDate(res.date));
                        return (
                          <div key={res.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{res.clientName} ({res.paxCount} Pax)</strong>
                              <span style={{ fontSize: '0.78rem', color: '#475569' }}>{tour ? tour.name : 'Tour'}</span>
                              <div style={{ fontSize: '0.72rem', color: isTourToday ? '#9333ea' : '#64748b', fontWeight: '600', marginTop: '2px' }}>
                                {isTourToday ? '⚡ Salida HOY' : '📅 Salida Mañana'} a las {res.time || '09:00'}
                              </div>
                            </div>
                            <button 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#25D366', borderColor: '#25D366' }}
                              onClick={() => openWhatsApp(res, 'tour', tour ? tour.name : 'Tour')}
                              title="Enviar aviso de recordatorio al cliente por WhatsApp"
                            >
                              <MessageCircle size={14} /> Cliente
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Modal Trigger */}
      <WhatsAppModal 
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        reservation={waReservation}
        type={waType}
        contextName={waContextName}
      />
    </>
  );
}
