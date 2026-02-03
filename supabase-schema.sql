-- ============================================
-- TWO SOULS ON THE ROAD - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CHAPTERS TABLE
-- ============================================
create table chapters (
  id uuid default uuid_generate_v4() primary key,
  destination text not null,
  subtitle text,
  date_from date,
  date_to date,
  cover_line text,
  cover_photo_url text,
  location jsonb, -- Map location: {lat, lng, name}
  moods text[] default '{}',
  reflection text,
  reflection_prompt text not null,
  sealed boolean default false,

  -- First & Last impressions (stored as JSONB)
  first_impression jsonb,
  last_night_thoughts jsonb,

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- DAY ENTRIES TABLE
-- ============================================
create table day_entries (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references chapters(id) on delete cascade not null,
  date date not null,

  -- Moods
  morning_mood text,
  evening_mood text,

  -- Gratitude & Word of the day
  gratitude text,
  gratitude_author text,
  word_of_the_day text,

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure unique day per chapter
  unique(chapter_id, date)
);

-- ============================================
-- PHOTOS TABLE
-- ============================================
create table photos (
  id uuid default uuid_generate_v4() primary key,
  day_entry_id uuid references day_entries(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  url text not null,
  caption text,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- THOUGHTS TABLE (quick notes during the day)
-- ============================================
create table thoughts (
  id uuid default uuid_generate_v4() primary key,
  day_entry_id uuid references day_entries(id) on delete cascade not null,
  text text not null,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PROMPTS TABLE (answered journal prompts)
-- ============================================
create table prompts (
  id uuid default uuid_generate_v4() primary key,
  day_entry_id uuid references day_entries(id) on delete cascade not null,
  question text not null,
  answer text not null,
  author text not null,
  answered_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- LETTERS TABLE (private notes between partners)
-- ============================================
create table letters (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references chapters(id) on delete cascade not null,
  from_author text not null,
  to_author text not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  read_at timestamp with time zone
);

-- ============================================
-- TIME CAPSULES TABLE
-- ============================================
create table time_capsules (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references chapters(id) on delete cascade not null,
  title text not null,
  content text not null,
  author text not null,
  unlock_date date not null,
  is_unlocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unlocked_at timestamp with time zone
);

-- ============================================
-- UNEXPECTED MOMENTS TABLE
-- ============================================
create table unexpected_moments (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references chapters(id) on delete cascade not null,
  text text not null,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- LEGACY MOMENTS TABLE (backwards compatibility)
-- ============================================
create table moments (
  id uuid default uuid_generate_v4() primary key,
  chapter_id uuid references chapters(id) on delete cascade not null,
  text text not null,
  photo_data_url text,
  author text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index idx_day_entries_chapter on day_entries(chapter_id);
create index idx_day_entries_date on day_entries(date);
create index idx_photos_day_entry on photos(day_entry_id);
create index idx_thoughts_day_entry on thoughts(day_entry_id);
create index idx_prompts_day_entry on prompts(day_entry_id);
create index idx_letters_chapter on letters(chapter_id);
create index idx_time_capsules_chapter on time_capsules(chapter_id);
create index idx_moments_chapter on moments(chapter_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_chapters_updated_at
  before update on chapters
  for each row execute function update_updated_at_column();

create trigger update_day_entries_updated_at
  before update on day_entries
  for each row execute function update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- For now, we'll keep it simple - anyone with the anon key can access
-- Later you can add proper auth
-- ============================================
alter table chapters enable row level security;
alter table day_entries enable row level security;
alter table photos enable row level security;
alter table thoughts enable row level security;
alter table prompts enable row level security;
alter table letters enable row level security;
alter table time_capsules enable row level security;
alter table unexpected_moments enable row level security;
alter table moments enable row level security;

-- Allow all operations for now (you two are the only users)
create policy "Allow all for chapters" on chapters for all using (true) with check (true);
create policy "Allow all for day_entries" on day_entries for all using (true) with check (true);
create policy "Allow all for photos" on photos for all using (true) with check (true);
create policy "Allow all for thoughts" on thoughts for all using (true) with check (true);
create policy "Allow all for prompts" on prompts for all using (true) with check (true);
create policy "Allow all for letters" on letters for all using (true) with check (true);
create policy "Allow all for time_capsules" on time_capsules for all using (true) with check (true);
create policy "Allow all for unexpected_moments" on unexpected_moments for all using (true) with check (true);
create policy "Allow all for moments" on moments for all using (true) with check (true);

-- ============================================
-- STORAGE BUCKET FOR PHOTOS
-- Run this separately in Storage settings or via SQL
-- ============================================
-- insert into storage.buckets (id, name, public)
-- values ('photos', 'photos', true);

-- create policy "Allow public read for photos"
-- on storage.objects for select
-- using (bucket_id = 'photos');

-- create policy "Allow authenticated upload for photos"
-- on storage.objects for insert
-- with check (bucket_id = 'photos');
