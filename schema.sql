-- ==========================================
-- 1. USERS TABLE (Login & Roles)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN')),
  is_blocked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. REFERRALS TABLE (Owner dwara generate kiye gaye codes)
-- ==========================================
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  role_granted TEXT NOT NULL CHECK (role_granted IN ('OWNER', 'ADMIN')),
  created_by INTEGER NOT NULL,
  is_used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. SDK KEYS TABLE (Unified MUNDO & BCORE)
-- ==========================================
CREATE TABLE IF NOT EXISTS sdk_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('MUNDO', 'BCORE')),
  sdk_key TEXT UNIQUE NOT NULL,
  duration_days INTEGER NOT NULL,
  pkg_limit INTEGER NOT NULL,
  app_limit INTEGER NOT NULL,
  feature1 INTEGER DEFAULT 0,
  feature2 INTEGER DEFAULT 0,
  is_blocked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. SERVER STATUS TABLE (Maintenance Control)
-- ==========================================
CREATE TABLE IF NOT EXISTS server_status (
  engine TEXT PRIMARY KEY NOT NULL CHECK (engine IN ('MUNDO', 'BCORE')),
  maintenance_mode INTEGER DEFAULT 0,
  maintenance_message TEXT DEFAULT ''
);

-- ==========================================
-- 5. DEFAULT OWNER ACCOUNT (Pehla Login)
-- ==========================================
-- Username: owner
-- Password: owner123
INSERT INTO users (username, password_hash, role, is_blocked) 
VALUES ('owner', 'owner123', 'OWNER', 0);
