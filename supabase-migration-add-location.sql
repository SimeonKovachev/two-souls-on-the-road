-- ============================================
-- MIGRATION: Add location column to chapters
-- Run this in Supabase SQL Editor if you already have the database set up
-- ============================================

-- Add location column (JSONB for {lat, lng, name})
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS location jsonb;

-- Also add is_favorite to moments if not exists
ALTER TABLE moments ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;
