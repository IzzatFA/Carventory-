require('dotenv').config();
const supabase = require('../src/config/database');
const bcrypt = require('bcryptjs');

// To dynamically import the ES module
async function run() {
  const seedModule = await import('./seed.js');
  
  const { mockUsers, mockCars, mockAuctions, mockBids, mockTransactions } = seedModule;

  console.log('--- Starting Database Seeding ---');

  // Insert Users
  for (const u of mockUsers) {
    // Generate UUID if using default uuid in supabase, but we have string ids like 'usr-001'
    // Since our database uses UUID, we need to map string IDs to UUIDs or alter table.
    // Wait, let's see how the table is structured.
    console.log(`Inserting user: ${u.email}`);
  }

  console.log('Seeding finished.');
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});
