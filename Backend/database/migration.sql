-- ==========================================
-- CarVentory Database Schema (PostgreSQL)
-- ==========================================

-- 1. Tables

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL,
  car_id VARCHAR(50),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  starting_price DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auction (
  id SERIAL PRIMARY KEY,
  car_id INTEGER NOT NULL,
  winner_id INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  current_highest_bid DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bid (
  id SERIAL PRIMARY KEY,
  bid_ammount DECIMAL(15,2) NOT NULL,
  bid_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  auction_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_id INTEGER,
  target_type VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- 2. Constraints & Foreign Keys

-- ENUM-like checks
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role;
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'seller', 'admin'));

ALTER TABLE cars DROP CONSTRAINT IF EXISTS chk_cars_status;
ALTER TABLE cars ADD CONSTRAINT chk_cars_status CHECK (status IN ('pending', 'active', 'sold'));

ALTER TABLE transaction DROP CONSTRAINT IF EXISTS chk_payment_status;
ALTER TABLE transaction ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Foreign Keys
ALTER TABLE cars DROP CONSTRAINT IF EXISTS fk_cars_seller;
ALTER TABLE cars ADD CONSTRAINT fk_cars_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE auction DROP CONSTRAINT IF EXISTS fk_auction_car;
ALTER TABLE auction ADD CONSTRAINT fk_auction_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE;

ALTER TABLE auction DROP CONSTRAINT IF EXISTS fk_auction_winner;
ALTER TABLE auction ADD CONSTRAINT fk_auction_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE bid DROP CONSTRAINT IF EXISTS fk_bid_auction;
ALTER TABLE bid ADD CONSTRAINT fk_bid_auction FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE;

ALTER TABLE bid DROP CONSTRAINT IF EXISTS fk_bid_user;
ALTER TABLE bid ADD CONSTRAINT fk_bid_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE transaction DROP CONSTRAINT IF EXISTS fk_transaction_auction;
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_auction FOREIGN KEY (auction_id) REFERENCES auction(id) ON DELETE CASCADE;

ALTER TABLE admin_log DROP CONSTRAINT IF EXISTS fk_admin_log_admin;
ALTER TABLE admin_log ADD CONSTRAINT fk_admin_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;


-- 3. Indexes for Performance

CREATE INDEX IF NOT EXISTS idx_cars_seller_id ON cars(seller_id);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_bid_auction_id ON bid(auction_id);
CREATE INDEX IF NOT EXISTS idx_bid_user_id ON bid(user_id);
CREATE INDEX IF NOT EXISTS idx_auction_car_id ON auction(car_id);
CREATE INDEX IF NOT EXISTS idx_transaction_auction_id ON transaction(auction_id);
CREATE INDEX IF NOT EXISTS idx_admin_log_admin_id ON admin_log(admin_id);


-- 4. Initial Setup / Seed (Optional)
-- Insert a default admin account
-- The password is 'admin123' (hashed with bcrypt, 12 rounds)
-- Note: It's recommended to create users via the API to ensure proper hashing
-- INSERT INTO users (username, email, password, role) 
-- VALUES ('Super Admin', 'admin@carventory.id', '$2a$12$R9h/cIPz0gi.URNNX3rub2A9WEsyTUK1D8.oXnO1nE0P0m0wZ4qVq', 'admin')
-- ON CONFLICT (email) DO NOTHING;
