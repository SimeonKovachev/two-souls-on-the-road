# Two Souls on the Road

> *A living book of our journeys — Ива & Мео*

A beautiful, private travel journal web application designed for couples to document their adventures together. Built with love, magic, and a witchy purple-silver aesthetic.

---

## Features

### Core Journaling
- **Chapters** — Each trip becomes a chapter in your shared story
- **Daily Entries** — Morning & evening moods, photos, thoughts, gratitude
- **Love Letters** — Private notes between partners, revealed when read
- **Time Capsules** — Lock messages to be opened on future dates
- **Moments** — Quick captures of special moments with photos

### Special Features
- **Birthday Welcome** — Special greeting on your loved one's birthday
- **Anniversary Counter** — Days, months, years together at a glance
- **Random Memory** — Surprise yourself with a random past moment
- **Favorites** — Star your most precious memories
- **Travel Map** — Embedded OpenStreetMap showing all your adventures
- **Secret Love Notes** — Hidden messages that appear on special dates

### Security & Experience
- **Password Protection** — Shared password stored securely in Supabase
- **User Identification** — System knows who is logged in (Ива or Мео) per device
- **Dark Mode** — Beautiful witchy night theme
- **Mobile-First** — Optimized for phones, perfect for traveling
- **Cloud Sync** — Supabase backend with localStorage fallback
- **PDF Export** — Print chapters as keepsakes
- **Search** — Find any memory instantly
- **PWA** — Install as app on your phone

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Styling with custom theme |
| **Supabase** | Database & authentication |
| **OpenStreetMap** | Free embedded map |
| **Lucide React** | Professional icons |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works great!)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/two-souls-on-the-road.git
   cd two-souls-on-the-road
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up Supabase database**

   Run the SQL migrations in order:
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_auth_and_settings.sql
   ```

   Required tables:
   - `chapters` — Travel chapters
   - `app_auth` — Password storage
   - `user_sessions` — Device sessions (who is logged in)
   - `app_settings` — Anniversary, birthdays, etc.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## Project Structure

```
two-souls-on-the-road/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── chapter/[id]/      # Chapter detail & print
│   ├── new-chapter/       # Create new chapter
│   ├── map/               # Travel map
│   ├── search/            # Search memories
│   ├── settings/          # App settings
│   └── globals.css        # Global styles & theme
├── components/            # React components
│   ├── AuthProvider.tsx   # Password auth & user session
│   ├── BottomNav.tsx
│   ├── DarkModeProvider.tsx
│   ├── DayEntryCard.tsx
│   ├── LettersSection.tsx
│   ├── MoodPicker.tsx
│   ├── NotificationProvider.tsx
│   ├── SecretLoveNote.tsx
│   ├── TimeCapsuleSection.tsx
│   ├── TravelMap.tsx
│   └── ui/                # Reusable UI components
│       ├── Button.tsx
│       ├── icons.tsx      # Lucide icon exports
│       └── index.tsx
├── lib/                   # Utilities & types
│   ├── auth.ts            # Auth functions
│   ├── settings.ts        # Settings sync
│   ├── storage.ts         # Supabase + localStorage
│   ├── supabase.ts        # Supabase client
│   ├── types.ts           # TypeScript types
│   └── useAutoSave.tsx    # Auto-save hook
├── supabase/
│   └── migrations/        # SQL migrations
└── public/                # Static assets
    ├── favicon.ico
    ├── manifest.json      # PWA manifest
    └── sw.js              # Service worker
```

---

## Design System

### Color Palette

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Parchment** | `#F8F6FA` | `#0F0D14` | Background |
| **Plum** | `#4A2F6B` | `#B8A5D6` | Primary |
| **Lavender** | `#9D8EC2` | `#9D8EC2` | Accent |
| **Moonlight** | `#E8E4F5` | `#1E1A26` | Cards |
| **Midnight** | `#1A1622` | `#F0ECF8` | Text |

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Libre Baskerville (text)

### Icons
All icons use **Lucide React** for a professional, consistent look.

---

## Authentication

Simple password-based protection:

1. **First visit** — Create a shared password and choose who you are (Ива/Мео)
2. **Login** — Enter password and select your name
3. **Session** — System remembers who is logged in from each device
4. **Logout** — Available in Settings

Password is hashed and stored in Supabase `app_auth` table.

---

## Data Storage

The app uses a **hybrid storage** approach:

1. **Supabase** (primary) — Cloud database for permanent storage
2. **localStorage** (fallback) — Works offline, automatic fallback

### Supabase Tables
- `chapters` — All travel chapters with moments, letters, etc.
- `app_auth` — Hashed password
- `user_sessions` — Device ID + user mapping
- `app_settings` — Anniversary date, birthdays

---

## PWA Support

Install the app on your phone:
1. Open in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. Enjoy the full-screen experience!

---

## Privacy

- **Private by design** — Password protected, only you and your partner
- **No analytics** — We don't track you
- **Your data** — Stored in your own Supabase instance
- **Self-hostable** — Full control over your data

---

## License

MIT License — Feel free to use this for your own love story!

---

## Credits

Built with love for **Ива** on her birthday.

*"Every journey is better with you."*

---

<div align="center">

Made with love

**Ива & Мео**

</div>
