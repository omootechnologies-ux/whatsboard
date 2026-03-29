insert into public.businesses (id, owner_id, name, phone, currency)
values ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'WHATSBOARD Demo Store', '+255700000000', 'TZS');

insert into public.customers (id, business_id, name, phone, area, status)
values
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Amina Selemani', '+255712000111', 'Mbezi', 'active'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Neema Ally', '+255744332211', 'Kariakoo', 'active');

insert into public.orders (business_id, customer_id, product_name, amount, delivery_area, stage, payment_status, notes)
values
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '2 satin dresses', 85000, 'Mbezi', 'waiting_payment', 'unpaid', 'Customer asked for payment details'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Face serum bundle', 45000, 'Kariakoo', 'packing', 'paid', 'Paid and waiting to pack');
