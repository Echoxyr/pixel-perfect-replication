-- Fix function search path warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_numero_fattura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.numero IS NULL OR NEW.numero = '' THEN
    NEW.numero := CASE 
      WHEN NEW.tipo = 'attiva' THEN 'FA-' 
      ELSE 'FP-' 
    END || to_char(CURRENT_DATE, 'YYYY') || '-' || LPAD((SELECT COALESCE(MAX(CAST(SPLIT_PART(numero, '-', 3) AS INTEGER)), 0) + 1 FROM public.fatture WHERE tipo = NEW.tipo AND numero LIKE '%' || to_char(CURRENT_DATE, 'YYYY') || '%')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;