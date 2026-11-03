-- Lectura pública de clientes vinculados a facturas del catálogo.
-- BILL TO / NIT / ADDRESS de la invoice se leen de public.customers.

drop policy if exists "Lectura publica catalogo customers" on public.customers;

create policy "Lectura publica catalogo customers"
  on public.customers
  for select
  to anon, authenticated
  using (true);
