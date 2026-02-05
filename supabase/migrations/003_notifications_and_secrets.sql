-- Secret Love Notes (moved from localStorage)
CREATE TABLE IF NOT EXISTS secret_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  author TEXT NOT NULL CHECK (author IN ('ива', 'мео')),
  recipient TEXT NOT NULL CHECK (recipient IN ('ива', 'мео')),
  show_at TIMESTAMPTZ NOT NULL,
  is_shown BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Notifications
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_target TEXT NOT NULL CHECK (user_target IN ('ива', 'мео', 'both')),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  chapter_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification types:
-- 'morning_journal' - 10:00 reminder to write daily journal
-- 'evening_journal' - 21:00 reminder to write daily journal
-- 'secret_note' - secret love note reveal
-- 'time_capsule' - time capsule ready to open
-- 'new_letter' - new letter from partner
-- 'memory_1month' - memory reminder after 1 month
-- 'memory_3months' - memory reminder after 3 months
-- 'memory_6months' - memory reminder after 6 months
-- 'memory_1year' - memory reminder after 1 year
-- 'birthday' - birthday notification
-- 'anniversary' - anniversary notification

-- Update app_settings to include full birth dates
ALTER TABLE app_settings
ADD COLUMN IF NOT EXISTS iva_birth_date DATE,
ADD COLUMN IF NOT EXISTS meo_birth_date DATE;

-- Enable RLS
ALTER TABLE secret_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all for secret_notes" ON secret_notes FOR ALL USING (true);
CREATE POLICY "Allow all for scheduled_notifications" ON scheduled_notifications FOR ALL USING (true);

-- Index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled
ON scheduled_notifications(scheduled_for, is_sent)
WHERE is_sent = FALSE;

CREATE INDEX IF NOT EXISTS idx_secret_notes_show_at
ON secret_notes(show_at, is_shown)
WHERE is_shown = FALSE;
