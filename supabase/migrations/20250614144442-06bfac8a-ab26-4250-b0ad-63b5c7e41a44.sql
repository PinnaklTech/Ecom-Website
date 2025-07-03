
-- Add sample appointment data for testing the Dashboard with valid dates
INSERT INTO public.appointments (
  user_id,
  appointment_date,
  status,
  cart_items,
  total_amount,
  customer_name,
  customer_email,
  customer_phone,
  notes
) VALUES
-- Upcoming confirmed appointment
(
  '781a3be0-a80d-4c94-8a14-706740a795a2',
  '2025-07-20 11:00:00+00:00',
  'confirmed',
  '[{"id": "2", "name": "Gold Necklace Design", "price": 25000, "quantity": 1}, {"id": "3", "name": "Earrings Matching", "price": 8000, "quantity": 1}]'::jsonb,
  33000.00,
  'Giridhar Pathyapu',
  'giridhar6750@gmail.com',
  '+91-9876543210',
  'Custom necklace design with matching earrings'
),
-- Upcoming pending appointment
(
  '781a3be0-a80d-4c94-8a14-706740a795a2',
  '2025-06-25 16:15:00+00:00',
  'pending',
  '[{"id": "4", "name": "Bracelet Repair", "price": 3500, "quantity": 1}]'::jsonb,
  3500.00,
  'Giridhar Pathyapu',
  'giridhar6750@gmail.com',
  '+91-9876543210',
  'Silver bracelet chain repair'
),
-- Future appointment
(
  '781a3be0-a80d-4c94-8a14-706740a795a2',
  '2025-08-15 14:30:00+00:00',
  'confirmed',
  '[{"id": "1", "name": "Diamond Ring Consultation", "price": 15000, "quantity": 1}]'::jsonb,
  15000.00,
  'Giridhar Pathyapu',
  'giridhar6750@gmail.com',
  '+91-9876543210',
  'Consultation for engagement ring selection'
),
-- Another future appointment
(
  '781a3be0-a80d-4c94-8a14-706740a795a2',
  '2025-09-10 10:00:00+00:00',
  'pending',
  '[{"id": "5", "name": "Wedding Ring Set", "price": 45000, "quantity": 1}]'::jsonb,
  45000.00,
  'Giridhar Pathyapu',
  'giridhar6750@gmail.com',
  '+91-9876543210',
  'Custom wedding ring consultation'
);
