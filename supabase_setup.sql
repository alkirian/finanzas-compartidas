-- =============================================
-- SQL para crear las tablas en Supabase
-- Ejecutar en: SQL Editor de Supabase
-- =============================================

-- Tabla de transacciones (ingresos y gastos)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de gastos fijos mensuales
CREATE TABLE fixed_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de créditos/cuotas
CREATE TABLE credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  installments INTEGER NOT NULL,
  installment_amount NUMERIC NOT NULL,
  start_month INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Habilitar acceso público (RLS deshabilitado)
-- Esto es solo para apps personales sin auth
-- =============================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir todas las operaciones (sin autenticación)
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on fixed_expenses" ON fixed_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on credits" ON credits FOR ALL USING (true) WITH CHECK (true);
