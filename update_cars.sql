-- Copia y pega esto en el SQL Editor de Supabase y presiona Run

ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "promoThresholdDays" integer,
ADD COLUMN IF NOT EXISTS "promoDailyRate" numeric;

-- Opcional: asegurarnos de que los permisos estén correctos
DROP POLICY IF EXISTS "Permitir todo acceso anónimo vehiculos" ON public.cars;
CREATE POLICY "Permitir todo acceso anónimo vehiculos" ON public.cars FOR ALL USING (true) WITH CHECK (true);
