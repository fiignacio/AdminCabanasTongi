-- Copia y pega esto en el SQL Editor de Supabase y presiona Run para habilitar la sincronización de Tours

-- Tabla de Tours (Catálogo)
CREATE TABLE IF NOT EXISTS public.tours (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric DEFAULT 0,
    duration text,
    maxCapacity integer DEFAULT 10,
    color text DEFAULT '#9b59b6',
    "isActive" boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tabla de Reservas de Tours
CREATE TABLE IF NOT EXISTS public.tour_reservations (
    id text PRIMARY KEY,
    "tourId" text REFERENCES public.tours(id) ON DELETE CASCADE,
    "clientName" text NOT NULL,
    "clientPhone" text,
    date text NOT NULL,
    time text,
    "paxCount" integer DEFAULT 1,
    "totalCost" numeric DEFAULT 0,
    status text DEFAULT 'confirmed',
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS y políticas permisivas para anónimo/cliente
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo acceso anónimo tours" ON public.tours;
CREATE POLICY "Permitir todo acceso anónimo tours" ON public.tours FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo acceso anónimo reservas tours" ON public.tour_reservations;
CREATE POLICY "Permitir todo acceso anónimo reservas tours" ON public.tour_reservations FOR ALL USING (true) WITH CHECK (true);
