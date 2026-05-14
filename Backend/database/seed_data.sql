-- ==========================================
-- CarVentory — Dummy / Seed Data
-- ==========================================
-- PRASYARAT: Jalankan migration.sql (termasuk bagian
--            "CarVentory Frontend Compatibility Migration")
--            sebelum menjalankan file ini.
--
-- Password plain-text untuk referensi:
--   admin@carventory.id  → 'admin123'
--   semua user lain      → 'password123'
--
-- Hash bcrypt di bawah sudah valid (cost factor 12).
-- Jika ingin generate ulang, jalankan:
--   node -e "require('bcryptjs').hash('password123',12).then(console.log)"
-- ==========================================


-- ==========================================
-- 1. USERS  (1 admin, 2 seller, 2 user/buyer)
-- ==========================================
INSERT INTO users (id, username, email, password, role, phone, is_verified, is_suspended, deposit_balance, created_at) VALUES
(1, 'Super Admin',  'admin@carventory.id', '$2a$12$R9h/cIPz0gi.URNNX3rub2A9WEsyTUK1D8.oXnO1nE0P0m0wZ4qVq', 'admin',  '081111111111', TRUE,  FALSE, 0.00,         '2025-01-01 00:00:00+07'),
(2, 'Budi Santoso', 'budi@example.com',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7pNxCH.SyW', 'seller', '081234567890', TRUE,  FALSE, 0.00,         '2025-02-15 09:00:00+07'),
(3, 'Siti Rahayu',  'siti@example.com',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7pNxCH.SyW', 'seller', '082345678901', TRUE,  FALSE, 0.00,         '2025-03-10 10:30:00+07'),
(4, 'Ahmad Fauzi',  'ahmad@example.com',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7pNxCH.SyW', 'user',   '083456789012', TRUE,  FALSE, 5000000.00,  '2025-04-01 14:00:00+07'),
(5, 'Dewi Kusuma',  'dewi@example.com',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj7pNxCH.SyW', 'user',   '084567890123', TRUE,  FALSE, 12500000.00, '2025-04-20 08:00:00+07');

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));


-- ==========================================
-- 2. CARS  (8 mobil — penumpang, mewah, klasik)
-- ==========================================
--   id 1-2: seller = Budi  (id=2), status active
--   id 3:   seller = Siti  (id=3), status active  (upcoming auction)
--   id 4:   seller = Siti  (id=3), status sold    (auction ended, terjual)
--   id 5:   seller = Budi  (id=2), status sold    (auction ended, terjual)
--   id 6:   seller = Siti  (id=3), status pending (belum diverifikasi)
--   id 7:   seller = Budi  (id=2), status active
--   id 8:   seller = Siti  (id=3), status active  (belum ada auction)
INSERT INTO cars (id, seller_id, car_id, brand, model, year, starting_price, status, description, image_url, category, chassis_number, engine_number, location, is_verified, created_at) VALUES
(1, 2, 'CAR-001', 'Toyota',        'Kijang Innova Zenix', 2023, 350000000.00,   'active',  'Kondisi prima, KM rendah, semua fitur berfungsi sempurna. Warna Abu-abu Metalik.',                           'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800', 'penumpang', 'MHF11FR3XN0123456', '2GD-FTV-A0023456',   'Jakarta Barat',     TRUE,  '2025-06-01 08:00:00+07'),
(2, 2, 'CAR-002', 'Honda',         'CR-V Turbo',          2023, 420000000.00,   'active',  'SUV terpopuler, fitur lengkap, Honda Sensing aktif. Warna Merah.',                                           'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 'penumpang', 'MHRRW1850NK000789', 'L15B7-VTEC-789012',  'Bekasi',            TRUE,  '2025-07-15 10:00:00+07'),
(3, 3, 'CAR-003', 'BMW',           '7 Series 750Li',      2021, 1800000000.00,  'active',  'Sedan mewah, KM 15.000, full opsional, kondisi istimewa. Warna Putih Pearl.',                               'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800', 'mewah',     'WBAGN41000CD12345', 'N74B60-BMW-12345',   'Bandung',           TRUE,  '2025-08-01 09:30:00+07'),
(4, 3, 'CAR-004', 'Mercedes-Benz', 'S-Class 500',         2022, 2500000000.00,  'sold',    'Sedan premium, full opsional, kondisi sangat baik. Warna Hitam.',                                            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800', 'mewah',     'WDD2221781A012345', 'M277-E46-001234',    'Jakarta Selatan',   TRUE,  '2025-09-05 11:00:00+07'),
(5, 2, 'CAR-005', 'Ford',          'Mustang GT',          1969, 850000000.00,   'sold',    'Mobil klasik kondisi orisinal, mesin 390 FE V8. Warna Merah Klasik. Sertifikat keaslian tersedia.',         'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800', 'klasik',    '9F02M100001',       'Ford-390-FE-9001',   'Surabaya',          TRUE,  '2025-09-20 14:00:00+07'),
(6, 3, 'CAR-006', 'Volkswagen',    'Beetle',              1973, 120000000.00,   'pending', 'Body orisinal terawat, mesin masih kuat. Warna Biru Muda Klasik.',                                           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'klasik',    '1132000001',        'VW-1600-TYPE1-7301', 'Yogyakarta',        FALSE, '2026-01-10 13:00:00+07'),
(7, 2, 'CAR-007', 'Wuling',        'Air EV',              2023, 180000000.00,   'active',  'Mobil listrik hemat energi, jarak tempuh 200 km/charge. Warna Kuning.',                                      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', 'penumpang', 'LSG1ECA19P5001234', 'EV-WULING-AIR-5678', 'Tangerang Selatan', TRUE,  '2026-02-05 09:00:00+07'),
(8, 3, 'CAR-008', 'Lamborghini',   'Huracán',             2022, 7500000000.00,  'active',  'Supercar Italia, mesin V10 610HP, hanya 500 KM. Warna Kuning Giallo.',                                       'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800', 'mewah',     'ZHWUC1ZF9NLA12345', 'LP610-4-LAMBO-001',  'Jakarta Utara',     TRUE,  '2026-03-01 15:00:00+07');

SELECT setval('cars_id_seq', (SELECT MAX(id) FROM cars));


-- ==========================================
-- 3. AUCTION  (4 active/upcoming, 2 ended)
-- ==========================================
--   id 1: car=1 Innova,   active,   no winner
--   id 2: car=2 CR-V,     active,   no winner
--   id 3: car=3 BMW,      upcoming, no winner (belum mulai)
--   id 4: car=4 Mercedes, ended,    winner = Ahmad (id=4)
--   id 5: car=5 Mustang,  ended,    winner = Dewi  (id=5)
--   id 6: car=7 Wuling,   active,   no winner
INSERT INTO auction (id, car_id, winner_id, start_time, end_time, current_highest_bid, status, created_at) VALUES
(1, 1, NULL, '2026-05-10 08:00:00+07', '2026-05-20 20:00:00+07', 390000000.00,   'active',   '2026-05-09 10:00:00+07'),
(2, 2, NULL, '2026-05-12 08:00:00+07', '2026-05-22 20:00:00+07', 450000000.00,   'active',   '2026-05-11 10:00:00+07'),
(3, 3, NULL, '2026-05-20 08:00:00+07', '2026-05-30 20:00:00+07', 0.00,           'upcoming', '2026-05-15 10:00:00+07'),
(4, 4, 4,    '2026-04-01 08:00:00+07', '2026-04-10 20:00:00+07', 2600000000.00,  'ended',    '2026-03-28 10:00:00+07'),
(5, 5, 5,    '2026-03-01 08:00:00+07', '2026-03-15 20:00:00+07', 910000000.00,   'ended',    '2026-02-25 10:00:00+07'),
(6, 7, NULL, '2026-05-08 08:00:00+07', '2026-05-18 20:00:00+07', 190000000.00,   'active',   '2026-05-07 10:00:00+07');

SELECT setval('auction_id_seq', (SELECT MAX(id) FROM auction));


-- ==========================================
-- 4. BID
-- ==========================================
--   Semua bidder: Ahmad (id=4) dan Dewi (id=5)
--   Nilai current_highest_bid di tabel auction sudah disesuaikan.
INSERT INTO bid (id, auction_id, user_id, bid_amount, bid_time) VALUES
-- Auction 1 — Toyota Kijang Innova Zenix (active, highest: Ahmad 390jt)
(1,  1, 4, 360000000.00,   '2026-05-11 10:00:00+07'),
(2,  1, 5, 375000000.00,   '2026-05-12 14:30:00+07'),
(3,  1, 4, 390000000.00,   '2026-05-13 09:15:00+07'),
-- Auction 2 — Honda CR-V Turbo (active, highest: Ahmad 450jt)
(4,  2, 5, 435000000.00,   '2026-05-12 11:00:00+07'),
(5,  2, 4, 450000000.00,   '2026-05-13 16:45:00+07'),
-- Auction 4 — Mercedes-Benz S-Class (ended, winner: Ahmad id=4 dengan 2.6M)
(6,  4, 5, 2550000000.00,  '2026-04-04 15:00:00+07'),
(7,  4, 4, 2600000000.00,  '2026-04-05 10:00:00+07'),
-- Auction 5 — Ford Mustang GT (ended, winner: Dewi id=5 dengan 910jt)
(8,  5, 4, 870000000.00,   '2026-03-05 09:00:00+07'),
(9,  5, 5, 890000000.00,   '2026-03-07 14:00:00+07'),
(10, 5, 4, 895000000.00,   '2026-03-09 10:00:00+07'),
(11, 5, 5, 910000000.00,   '2026-03-10 16:00:00+07'),
-- Auction 6 — Wuling Air EV (active, highest: Ahmad 190jt)
(12, 6, 4, 190000000.00,   '2026-05-10 11:30:00+07');

SELECT setval('bid_id_seq', (SELECT MAX(id) FROM bid));


-- ==========================================
-- 5. TRANSACTION
-- ==========================================
--   auction_id NULL  → topup saldo
--   auction_id SET   → pembayaran lelang
INSERT INTO transaction (id, auction_id, user_id, amount, payment_status, type, payment_gateway_ref, transaction_date, created_at) VALUES
(1, NULL, 4, 10000000.00,   'paid',    'topup',           'GW-2026-001', '2026-03-01 10:00:00+07', '2026-03-01 10:00:00+07'),
(2, NULL, 5, 15000000.00,   'paid',    'topup',           'GW-2026-002', '2026-03-05 11:00:00+07', '2026-03-05 11:00:00+07'),
(3, 4,    4, 2600000000.00, 'paid',    'auction_payment', 'GW-2026-003', '2026-04-11 09:00:00+07', '2026-04-11 09:00:00+07'),
(4, 5,    5, 910000000.00,  'paid',    'auction_payment', 'GW-2026-004', '2026-03-16 10:00:00+07', '2026-03-16 10:00:00+07'),
(5, NULL, 4, 5000000.00,    'pending', 'topup',           'GW-2026-005', '2026-05-10 15:00:00+07', '2026-05-10 15:00:00+07');

SELECT setval('transaction_id_seq', (SELECT MAX(id) FROM transaction));


-- ==========================================
-- 6. ADMIN LOG
-- ==========================================
INSERT INTO admin_log (id, admin_id, action, target_id, target_type, details, created_at) VALUES
(1, 1, 'UPDATE_CAR_STATUS',         4, 'car',         'Status changed to sold',    '2026-04-10 21:00:00+07'),
(2, 1, 'UPDATE_CAR_STATUS',         5, 'car',         'Status changed to sold',    '2026-03-15 21:00:00+07'),
(3, 1, 'CREATE_TRANSACTION',        3, 'transaction', NULL,                        '2026-04-11 09:00:00+07'),
(4, 1, 'CREATE_TRANSACTION',        4, 'transaction', NULL,                        '2026-03-16 10:00:00+07'),
(5, 1, 'UPDATE_TRANSACTION_STATUS', 3, 'transaction', 'Status changed to paid',    '2026-04-11 09:05:00+07'),
(6, 1, 'UPDATE_TRANSACTION_STATUS', 4, 'transaction', 'Status changed to paid',    '2026-03-16 10:05:00+07');

SELECT setval('admin_log_id_seq', (SELECT MAX(id) FROM admin_log));


-- ==========================================
-- 7. NOTIFICATIONS
-- ==========================================
INSERT INTO notifications (id, user_id, title, message, is_read, created_at) VALUES
(1, 4, 'Penawaran Anda Terlampaui',        'Penawaran Anda untuk Toyota Kijang Innova Zenix telah dilampaui. Bid sekarang untuk tetap unggul!', FALSE, '2026-05-12 14:31:00+07'),
(2, 4, 'Selamat! Anda Memenangkan Lelang', 'Selamat! Anda memenangkan lelang Mercedes-Benz S-Class 500 dengan penawaran Rp 2.600.000.000.',     TRUE,  '2026-04-10 20:00:00+07'),
(3, 5, 'Penawaran Anda Terlampaui',        'Penawaran Anda untuk Mercedes-Benz S-Class 500 telah dilampaui.',                                   TRUE,  '2026-04-05 10:01:00+07'),
(4, 5, 'Selamat! Anda Memenangkan Lelang', 'Selamat! Anda memenangkan lelang Ford Mustang GT 1969 dengan penawaran Rp 910.000.000.',             FALSE, '2026-03-15 20:00:00+07'),
(5, 4, 'Penawaran Anda Terlampaui',        'Penawaran Anda untuk Ford Mustang GT 1969 telah dilampaui.',                                         TRUE,  '2026-03-10 16:01:00+07'),
(6, 5, 'Penawaran Anda Terlampaui',        'Penawaran Anda untuk Honda CR-V Turbo telah dilampaui. Bid sekarang untuk tetap unggul!',            FALSE, '2026-05-13 16:46:00+07');

SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
