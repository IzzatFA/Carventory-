// ====================================================
// CarVentory — Mock Data (mirrors Supabase DB schema)
// Replace these with actual Supabase calls in production
// ====================================================

export const mockUsers = [
  {
    id: 'usr-001',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    password_hash: 'hashed_password_123',
    phone: '081234567890',
    role: 'user',
    is_verified: true,
    is_suspended: false,
    deposit_balance: 15000000,
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'usr-002',
    name: 'Siti Rahayu',
    email: 'siti@example.com',
    password_hash: 'hashed_password_456',
    phone: '082345678901',
    role: 'user',
    is_verified: true,
    is_suspended: false,
    deposit_balance: 8500000,
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'usr-003',
    name: 'Ahmad Fauzi',
    email: 'ahmad@example.com',
    password_hash: 'hashed_password_789',
    phone: '083456789012',
    role: 'user',
    is_verified: false,
    is_suspended: false,
    deposit_balance: 0,
    created_at: '2024-03-10T14:00:00Z',
  },
  {
    id: 'usr-004',
    name: 'Dewi Kusuma',
    email: 'dewi@example.com',
    password_hash: 'hashed_password_abc',
    phone: '084567890123',
    role: 'user',
    is_verified: true,
    is_suspended: true,
    deposit_balance: 2000000,
    created_at: '2024-03-20T09:00:00Z',
  },
  {
    id: 'adm-001',
    name: 'Admin CarVentory',
    email: 'admin@carventory.id',
    password_hash: 'hashed_admin_pass',
    phone: '081111111111',
    role: 'admin',
    is_verified: true,
    is_suspended: false,
    deposit_balance: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockCars = [
  {
    id: 'car-001',
    name: 'Toyota Kijang Innova Zenix',
    category: 'penumpang',
    chassis_number: 'MHF11FR3XN0123456',
    engine_number: '2GD-FTV-A0023456',
    initial_price: 350000000,
    image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600',
    description: 'Toyota Kijang Innova Zenix 2023, kondisi prima, km rendah, semua fitur berfungsi sempurna. Warna Abu-Abu Metalik.',
    is_verified: true,
    created_at: '2024-04-01T08:00:00Z',
  },
  {
    id: 'car-002',
    name: 'Wuling Air EV',
    category: 'penumpang',
    chassis_number: 'LSG1ECA19P5001234',
    engine_number: 'EV-WULING-AIR-5678',
    initial_price: 180000000,
    image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600',
    description: 'Wuling Air EV 2023, mobil listrik hemat energi, jarak tempuh 200km/charge, warna Kuning.',
    is_verified: true,
    created_at: '2024-04-02T09:00:00Z',
  },
  {
    id: 'car-003',
    name: 'Mercedes-Benz S-Class 500',
    category: 'mewah',
    chassis_number: 'WDD2221781A012345',
    engine_number: 'M277-E46-001234',
    initial_price: 2500000000,
    image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600',
    description: 'Mercedes-Benz S500 2022, sedan mewah premium, full opsional, kondisi sangat baik. Warna Hitam.',
    is_verified: true,
    created_at: '2024-04-03T10:00:00Z',
  },
  {
    id: 'car-004',
    name: 'BMW 7 Series 750Li',
    category: 'mewah',
    chassis_number: 'WBAGN41000CD12345',
    engine_number: 'N74B60-BMW-12345',
    initial_price: 1800000000,
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600',
    description: 'BMW 7 Series 750Li 2021, kondisi istimewa, KM 15.000, warna Putih Pearl.',
    is_verified: true,
    created_at: '2024-04-04T11:00:00Z',
  },
  {
    id: 'car-005',
    name: 'Ford Mustang GT 1969',
    category: 'klasik',
    chassis_number: '9F02M100001',
    engine_number: 'Ford-390-FE-9001',
    initial_price: 850000000,
    image_url: 'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=600',
    description: 'Ford Mustang GT 1969, kondisi orisinal, mesin 390 FE V8, warna Merah Klassik. Sertifikat keaslian tersedia.',
    is_verified: true,
    created_at: '2024-04-05T12:00:00Z',
  },
  {
    id: 'car-006',
    name: 'VW Beetle 1973',
    category: 'klasik',
    chassis_number: '1132000001',
    engine_number: 'VW-1600-TYPE1-7301',
    initial_price: 120000000,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    description: 'Volkswagen Beetle 1973, kondisi terawat, body orisinal, mesin masih kuat. Warna Biru Muda klasik.',
    is_verified: true,
    created_at: '2024-04-06T13:00:00Z',
  },
  {
    id: 'car-007',
    name: 'Honda CR-V Turbo',
    category: 'penumpang',
    chassis_number: 'MHRRW1850NK000789',
    engine_number: 'L15B7-VTEC-789012',
    initial_price: 420000000,
    image_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600',
    description: 'Honda CR-V Turbo 2023, SUV terpopuler, fitur lengkap, Honda Sensing aktif. Warna Merah.',
    is_verified: true,
    created_at: '2024-04-07T14:00:00Z',
  },
  {
    id: 'car-008',
    name: 'Lamborghini Huracán',
    category: 'mewah',
    chassis_number: 'ZHWUC1ZF9NLA12345',
    engine_number: 'LP610-4-LAMBO-001',
    initial_price: 7500000000,
    image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
    description: 'Lamborghini Huracán 2022, supercar Italia, mesin V10 610HP, warna Kuning Giallo. Hanya 500km.',
    is_verified: true,
    created_at: '2024-04-08T15:00:00Z',
  },
];

// Helper: auctions end time relative to now
const now = new Date();
const inMinutes = (m) => new Date(now.getTime() + m * 60000).toISOString();
const pastMinutes = (m) => new Date(now.getTime() - m * 60000).toISOString();

export const mockAuctions = [
  {
    id: 'auc-001',
    car_id: 'car-001',
    current_highest_bid: 370000000,
    winner_id: null,
    start_time: pastMinutes(60),
    end_time: inMinutes(25),
    status: 'active',
  },
  {
    id: 'auc-002',
    car_id: 'car-002',
    current_highest_bid: 195000000,
    winner_id: null,
    start_time: pastMinutes(30),
    end_time: inMinutes(55),
    status: 'active',
  },
  {
    id: 'auc-003',
    car_id: 'car-003',
    current_highest_bid: 2600000000,
    winner_id: null,
    start_time: pastMinutes(120),
    end_time: inMinutes(10),
    status: 'active',
  },
  {
    id: 'auc-004',
    car_id: 'car-004',
    current_highest_bid: 1900000000,
    winner_id: null,
    start_time: pastMinutes(90),
    end_time: inMinutes(75),
    status: 'active',
  },
  {
    id: 'auc-005',
    car_id: 'car-005',
    current_highest_bid: 900000000,
    winner_id: 'usr-001',
    start_time: pastMinutes(200),
    end_time: pastMinutes(60),
    status: 'ended',
  },
  {
    id: 'auc-006',
    car_id: 'car-006',
    current_highest_bid: 125000000,
    winner_id: null,
    start_time: inMinutes(30),
    end_time: inMinutes(150),
    status: 'upcoming',
  },
  {
    id: 'auc-007',
    car_id: 'car-007',
    current_highest_bid: 435000000,
    winner_id: null,
    start_time: pastMinutes(45),
    end_time: inMinutes(90),
    status: 'active',
  },
  {
    id: 'auc-008',
    car_id: 'car-008',
    current_highest_bid: 7600000000,
    winner_id: null,
    start_time: pastMinutes(15),
    end_time: inMinutes(120),
    status: 'active',
  },
];

export const mockBids = [
  {
    id: 'bid-001',
    auction_id: 'auc-001',
    user_id: 'usr-001',
    car_id: 'car-001',
    bid_amount: 360000000,
    timestamp: pastMinutes(45),
    status: 'active',
  },
  {
    id: 'bid-002',
    auction_id: 'auc-001',
    user_id: 'usr-002',
    car_id: 'car-001',
    bid_amount: 370000000,
    timestamp: pastMinutes(30),
    status: 'active',
  },
  {
    id: 'bid-003',
    auction_id: 'auc-002',
    user_id: 'usr-001',
    car_id: 'car-002',
    bid_amount: 185000000,
    timestamp: pastMinutes(25),
    status: 'active',
  },
  {
    id: 'bid-004',
    auction_id: 'auc-002',
    user_id: 'usr-002',
    car_id: 'car-002',
    bid_amount: 195000000,
    timestamp: pastMinutes(10),
    status: 'active',
  },
  {
    id: 'bid-005',
    auction_id: 'auc-005',
    user_id: 'usr-001',
    car_id: 'car-005',
    bid_amount: 900000000,
    timestamp: pastMinutes(90),
    status: 'won',
  },
  {
    id: 'bid-006',
    auction_id: 'auc-005',
    user_id: 'usr-002',
    car_id: 'car-005',
    bid_amount: 880000000,
    timestamp: pastMinutes(100),
    status: 'lost',
  },
];

export const mockTransactions = [
  {
    id: 'trx-001',
    user_id: 'usr-001',
    amount: 10000000,
    type: 'topup',
    status: 'paid',
    payment_gateway_ref: 'GW-2024-001',
    created_at: pastMinutes(200),
  },
  {
    id: 'trx-002',
    user_id: 'usr-001',
    amount: 5000000,
    type: 'topup',
    status: 'paid',
    payment_gateway_ref: 'GW-2024-002',
    created_at: pastMinutes(100),
  },
  {
    id: 'trx-003',
    user_id: 'usr-002',
    amount: 8500000,
    type: 'topup',
    status: 'paid',
    payment_gateway_ref: 'GW-2024-003',
    created_at: pastMinutes(150),
  },
];

export const mockNotifications = [
  {
    id: 'notif-001',
    user_id: 'usr-001',
    title: 'Penawaran Anda Terlampaui',
    message: 'Penawaran Anda untuk Toyota Kijang Innova Zenix telah dilampaui oleh penawaran lebih tinggi.',
    is_read: false,
    created_at: pastMinutes(30),
  },
  {
    id: 'notif-002',
    user_id: 'usr-001',
    title: 'Selamat! Anda Memenangkan Lelang',
    message: 'Selamat! Anda memenangkan lelang Ford Mustang GT 1969 dengan penawaran Rp 900.000.000.',
    is_read: true,
    created_at: pastMinutes(60),
  },
];

// Utility: format currency IDR
export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility: get car by id
export const getCarById = (id) => mockCars.find((c) => c.id === id);

// Utility: get auction by id
export const getAuctionById = (id) => mockAuctions.find((a) => a.id === id);

// Utility: get auctions for car
export const getAuctionByCar = (carId) => mockAuctions.find((a) => a.car_id === carId);

// Utility: get bids for auction
export const getBidsByAuction = (auctionId) =>
  mockBids.filter((b) => b.auction_id === auctionId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Utility: get user bids
export const getUserBids = (userId) =>
  mockBids.filter((b) => b.user_id === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

// Utility: category label
export const categoryLabel = {
  penumpang: 'Penumpang',
  mewah: 'Mewah',
  klasik: 'Klasik',
};

export const categoryColors = {
  penumpang: '#3B82F6',
  mewah: '#8B5CF6',
  klasik: '#D97706',
};
