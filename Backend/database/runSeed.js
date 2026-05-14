require('dotenv').config();
const supabase = require('../src/config/database');

const seedUsers = [
  { username: 'Admin CarVentory', email: 'admin@carventory.id', password: 'admin123', role: 'admin' },
  { username: 'Budi Santoso', email: 'budi@example.com', password: 'password123', role: 'seller' },
  { username: 'Siti Rahayu', email: 'siti@example.com', password: 'password123', role: 'user' },
  { username: 'Ahmad Fauzi', email: 'ahmad@example.com', password: 'password123', role: 'user' },
];

async function run() {
  console.log('--- Starting Database Seeding ---');

  // Insert Users
  const insertedUsers = [];
  for (const u of seedUsers) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username: u.username, email: u.email, password: u.password, role: u.role }])
      .select('id, email, role')
      .single();

    if (error) {
      console.warn(`Skipping user ${u.email}: ${error.message}`);
    } else {
      insertedUsers.push(data);
      console.log(`Inserted user: ${data.email} (id: ${data.id})`);
    }
  }

  const seller = insertedUsers.find((u) => u.role === 'seller');
  if (!seller) {
    console.error('No seller user found, cannot seed cars.');
    process.exit(1);
  }

  // Insert Cars
  const seedCars = [
    { seller_id: seller.id, brand: 'Toyota', model: 'Kijang Innova Zenix', year: 2023, starting_price: 350000000, status: 'active', description: 'Kondisi prima, km rendah, semua fitur berfungsi sempurna.' },
    { seller_id: seller.id, brand: 'Honda', model: 'CR-V Turbo', year: 2023, starting_price: 420000000, status: 'active', description: 'SUV terpopuler, fitur lengkap, Honda Sensing aktif.' },
    { seller_id: seller.id, brand: 'Ford', model: 'Mustang GT', year: 1969, starting_price: 850000000, status: 'pending', description: 'Kondisi orisinal, mesin 390 FE V8, sertifikat keaslian tersedia.' },
    { seller_id: seller.id, brand: 'Mercedes-Benz', model: 'S-Class 500', year: 2022, starting_price: 2500000000, status: 'pending', description: 'Sedan mewah premium, full opsional, kondisi sangat baik.' },
  ];

  const insertedCars = [];
  for (const c of seedCars) {
    const { data, error } = await supabase
      .from('cars')
      .insert([c])
      .select('id, brand, model')
      .single();

    if (error) {
      console.warn(`Skipping car ${c.brand} ${c.model}: ${error.message}`);
    } else {
      insertedCars.push(data);
      console.log(`Inserted car: ${data.brand} ${data.model} (id: ${data.id})`);
    }
  }

  // Insert Auctions for active cars
  const activeCars = insertedCars.slice(0, 2);
  const now = new Date();
  for (const car of activeCars) {
    const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('auction')
      .insert([{ car_id: car.id, start_time: startTime, end_time: endTime, current_highest_bid: 0 }])
      .select('id')
      .single();

    if (error) {
      console.warn(`Skipping auction for car ${car.id}: ${error.message}`);
    } else {
      console.log(`Inserted auction for car ${car.brand} ${car.model} (auction id: ${data.id})`);
    }
  }

  console.log('--- Seeding finished ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});
