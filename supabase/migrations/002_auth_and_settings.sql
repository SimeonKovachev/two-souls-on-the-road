-- App password (one password for both users)
CREATE TABLE IF NOT EXISTS app_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions (track who is logged in from which device)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL CHECK (user_name IN ('ива', 'мео')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- App settings (shared between both users)
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anniversary_date DATE,
  iva_birthday DATE,
  meo_birthday DATE,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for anon since we use app-level password)
CREATE POLICY "Allow all for app_auth" ON app_auth FOR ALL USING (true);
CREATE POLICY "Allow all for user_sessions" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for app_settings" ON app_settings FOR ALL USING (true);

-- Insert default settings row
INSERT INTO app_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
