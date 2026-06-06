import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

// Helper function to get supabase instance if configured
const getSupabase = (config) => {
  const url = import.meta.env.VITE_SUPABASE_URL || config?.supabaseUrl;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || config?.supabaseKey;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
};

export const useStore = create(
  persist(
    (set, get) => ({
      prices: {
        highSeasonAdult: 35000,
        lowSeasonAdult: 30000,
        child: 15000,
      },
      updatePrices: (newPrices) => set((state) => ({
        prices: { ...state.prices, ...newPrices }
      })),
      
      cabins: [
        { id: '1', name: 'Cabaña Grande', type: 'large', maxCapacity: 6, ownerId: 'owner1', ownerName: 'Dueño 1', color: '#D35400' },
        { id: '2', name: 'Cabaña Pequeña', type: 'small', maxCapacity: 3, ownerId: 'owner1', ownerName: 'Dueño 1', color: '#556B2F' },
        { id: '3', name: 'Cabaña Mediana 1', type: 'medium', maxCapacity: 4, ownerId: 'owner2', ownerName: 'Dueño 2', color: '#B8860B' },
        { id: '4', name: 'Cabaña Mediana 2', type: 'medium', maxCapacity: 4, ownerId: 'owner2', ownerName: 'Dueño 2', color: '#CD853F' }
      ],
      addCabin: (cabin) => {
        const newCabin = { ...cabin, id: Date.now().toString() };
        set((state) => ({ cabins: [...state.cabins, newCabin] }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cabins').insert([newCabin]).then(({error}) => error && console.error(error));
      },
      updateCabin: (id, updatedData) => {
        set((state) => ({ cabins: state.cabins.map(c => c.id === id ? { ...c, ...updatedData } : c) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cabins').update(updatedData).eq('id', id).then(({error}) => error && console.error(error));
      },
      deleteCabin: (id) => {
        set((state) => ({ cabins: state.cabins.filter(c => c.id !== id) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cabins').delete().eq('id', id).then(({error}) => error && console.error(error));
      },
      
      reservations: [],
      addReservation: (reservation) => {
        const newRes = { ...reservation, id: Date.now().toString() };
        set((state) => ({ reservations: [...state.reservations, newRes] }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('reservations').insert([newRes]).then(({error}) => error && console.error(error));
      },
      updateReservation: (id, updatedData) => {
        set((state) => ({ reservations: state.reservations.map(res => res.id === id ? { ...res, ...updatedData } : res) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('reservations').update(updatedData).eq('id', id).then(({error}) => error && console.error(error));
      },
      deleteReservation: (id) => {
        set((state) => ({ reservations: state.reservations.filter(res => res.id !== id) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('reservations').delete().eq('id', id).then(({error}) => error && console.error(error));
      },
      // CARS
      cars: [
        { id: 'c1', name: 'Suzuki Jimny', plate: 'AB-CD-12', dailyRate: 45000, color: '#27ae60', isActive: true, promoThresholdDays: 3, promoDailyRate: 40000 },
        { id: 'c2', name: 'Nissan X-Trail', plate: 'XY-ZA-99', dailyRate: 65000, color: '#2980b9', isActive: true, promoThresholdDays: 0, promoDailyRate: 0 }
      ],
      addCar: (car) => {
        const newCar = { ...car, id: Date.now().toString() };
        set((state) => ({ cars: [...state.cars, newCar] }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cars').insert([newCar]).then(({error}) => {
          if (error) {
            console.error(error);
            alert("Error al guardar vehículo en la nube: " + error.message + "\nPor favor, actualiza tu base de datos con el último supabase_schema.sql");
          }
        });
      },
      updateCar: (id, updatedData) => {
        set((state) => ({ cars: state.cars.map(c => c.id === id ? { ...c, ...updatedData } : c) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cars').update(updatedData).eq('id', id).then(({error}) => {
          if (error) {
            console.error(error);
            alert("Error al actualizar vehículo en la nube: " + error.message);
          }
        });
      },
      deleteCar: (id) => {
        set((state) => ({ cars: state.cars.filter(c => c.id !== id) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('cars').delete().eq('id', id).then(({error}) => error && console.error(error));
      },

      // CAR RESERVATIONS
      carReservations: [],
      addCarReservation: (res) => {
        const newRes = { ...res, id: Date.now().toString() };
        set((state) => ({ carReservations: [...state.carReservations, newRes] }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('car_reservations').insert([newRes]).then(({error}) => error && console.error(error));
      },
      updateCarReservation: (id, updatedData) => {
        set((state) => ({ carReservations: state.carReservations.map(r => r.id === id ? { ...r, ...updatedData } : r) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('car_reservations').update(updatedData).eq('id', id).then(({error}) => error && console.error(error));
      },
      deleteCarReservation: (id) => {
        set((state) => ({ carReservations: state.carReservations.filter(r => r.id !== id) }));
        
        const sb = getSupabase(get().syncConfig);
        if (sb) sb.from('car_reservations').delete().eq('id', id).then(({error}) => error && console.error(error));
      },
      // Sync Configurations
      syncConfig: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        googleClientId: ''
      },
      updateSyncConfig: (newConfig) => set((state) => ({
        syncConfig: { ...state.syncConfig, ...newConfig }
      })),

      // Pull from Supabase
      fetchFromSupabase: async () => {
        const sb = getSupabase(get().syncConfig);
        if (!sb) return;
        
        console.log("Iniciando sincronización con Supabase...");
        
        const { data: cabinsData, error: cabinsError } = await sb.from('cabins').select('*');
        if (cabinsError) {
          console.error("Error al obtener cabañas:", cabinsError);
        } else if (cabinsData) {
          set({ cabins: cabinsData });
        }
        
        const { data: resData, error: resError } = await sb.from('reservations').select('*');
        if (resError) {
          console.error("Error al obtener reservas:", resError);
        } else if (resData) {
          set({ reservations: resData });
        }

        // Fetch Cars
        const { data: carsData, error: carsError } = await sb.from('cars').select('*');
        if (carsError) console.error("Error cars:", carsError);
        else if (carsData) {
          set({ cars: carsData });
        }

        // Fetch Car Reservations
        const { data: carResData, error: carResError } = await sb.from('car_reservations').select('*');
        if (carResError) console.error("Error car reservations:", carResError);
        else if (carResData) {
          set({ carReservations: carResData });
        }
      },

      // Realtime Sync
      initRealtimeSubscription: () => {
        const sb = getSupabase(get().syncConfig);
        if (!sb) return;

        console.log("Iniciando suscripciones en tiempo real...");

        const handleRealtimeEvent = (table, stateKey) => (payload) => {
          console.log(`Evento Realtime en ${table}:`, payload);
          set((state) => {
            const currentList = state[stateKey];
            let newList = [...currentList];

            if (payload.eventType === 'INSERT') {
              // Evitar duplicados
              if (!newList.find(item => item.id === payload.new.id)) {
                newList.push(payload.new);
              }
            } else if (payload.eventType === 'UPDATE') {
              newList = newList.map(item => item.id === payload.new.id ? { ...item, ...payload.new } : item);
            } else if (payload.eventType === 'DELETE') {
              newList = newList.filter(item => item.id !== payload.old.id);
            }

            return { [stateKey]: newList };
          });
        };

        const channel = sb.channel('public:all')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, handleRealtimeEvent('reservations', 'reservations'))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cabins' }, handleRealtimeEvent('cabins', 'cabins'))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, handleRealtimeEvent('cars', 'cars'))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'car_reservations' }, handleRealtimeEvent('car_reservations', 'carReservations'))
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Conectado a Supabase Realtime');
            }
          });
        
        return () => {
          sb.removeChannel(channel);
        };
      }
    }),
    {
      name: 'cabin-storage',
    }
  )
);
