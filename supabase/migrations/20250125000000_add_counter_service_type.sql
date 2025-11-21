-- Add 'counter' as a valid service type option
ALTER TABLE orders 
  DROP CONSTRAINT IF EXISTS orders_service_type_check;

ALTER TABLE orders 
  ADD CONSTRAINT orders_service_type_check 
  CHECK (service_type IN ('dine-in', 'pickup', 'delivery', 'counter'));

