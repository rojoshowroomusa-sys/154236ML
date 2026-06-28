-- EJECUTAR ESTO EN EL SQL EDITOR DE TU PANEL DE SUPABASE
-- Para habilitar el soporte de cupones dinámicos en la base de datos de Supabase.

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    store TEXT NOT NULL,
    discount TEXT NOT NULL,
    discount_value NUMERIC NOT NULL DEFAULT 0,
    min_order NUMERIC,
    description TEXT NOT NULL,
    category TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_hot BOOLEAN NOT NULL DEFAULT false,
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Permitir lectura pública de cupones" ON public.coupons;
CREATE POLICY "Permitir lectura pública de cupones" ON public.coupons
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir todo a service_role" ON public.coupons;
CREATE POLICY "Permitir todo a service_role" ON public.coupons
    FOR ALL TO service_role USING (true);
