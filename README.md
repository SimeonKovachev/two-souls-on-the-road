# Two Souls on the Road 🌙✨

> *A living book of our journeys — Ива & Мео*

A beautiful, private travel journal web application designed for couples to document their adventures together. Built with love, magic, and a witchy purple-silver aesthetic.

![Two Souls Banner](./public/images/banner.png)

---

## ✨ Features

### Core Journaling
- **📖 Chapters** — Each trip becomes a chapter in your shared story
- **📝 Daily Entries** — Morning & evening moods, photos, thoughts, gratitude
- **💌 Love Letters** — Private notes between partners, revealed when read
- **⏳ Time Capsules** — Lock messages to be opened on future dates
- **🌟 Moments** — Quick captures of special moments with photos

### Special Features
- **🎂 Birthday Welcome** — Special greeting on your loved one's birthday
- **💕 Anniversary Counter** — Days, months, years together at a glance
- **🎲 Random Memory** — Surprise yourself with a random past moment
- **⭐ Favorites** — Star your most precious memories
- **🗺️ Travel Map** — See all your adventures on an interactive map
- **🔮 Secret Love Notes** — Hidden messages that appear on special dates

### Experience
- **🌙 Dark Mode** — Beautiful witchy night theme
- **📱 Mobile-First** — Optimized for phones, perfect for traveling
- **☁️ Cloud Sync** — Supabase backend with localStorage fallback
- **🖨️ PDF Export** — Print chapters as keepsakes
- **🔍 Search** — Find any memory instantly

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Styling with custom theme |
| **Supabase** | Database, auth, and storage |
| **OpenStreetMap** | Free map integration |

---

## 🚀 Getting Started

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
   - Go to Supabase SQL Editor
   - Run the contents of `supabase-schema.sql`
   - Create a storage bucket named `photos` (public)
   - See `SUPABASE-SETUP.md` for detailed instructions

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

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
│   ├── AnniversaryCounter.tsx
│   ├── BirthdayWelcome.tsx
│   ├── BottomNav.tsx
│   ├── DarkModeProvider.tsx
│   ├── MomentCard.tsx
│   ├── RandomMemory.tsx
│   ├── SecretLoveNote.tsx
│   └── TravelMap.tsx
├── lib/                   # Utilities & types
│   ├── storage.ts         # Supabase + localStorage
│   ├── supabase.ts        # Supabase client
│   ├── types.ts           # TypeScript types
│   └── useAutoSave.tsx    # Auto-save hook
└── public/                # Static assets
    ├── icon.svg           # App icon
    ├── manifest.json      # PWA manifest
    └── images/            # App Images
```

---

## 🎨 Design System

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

---

## 💾 Data Storage

The app uses a **hybrid storage** approach:

1. **Supabase** (primary) — Cloud database for permanent storage
2. **localStorage** (fallback) — Works offline, automatic fallback

### Supabase Free Tier Limits
- 500 MB database — Plenty for text!
- 1 GB storage — ~1000-2000 photos
- 2 GB bandwidth/month — More than enough for 2 users

---

## 📱 PWA Support

Install the app on your phone:
1. Open in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. Enjoy the full-screen experience!

---

## 🔒 Privacy

- **Private by design** — Only you and your partner have access
- **No analytics** — We don't track you
- **Your data** — Export anytime as JSON
- **Self-hostable** — Run your own instance

---

## 🤝 Contributing

This is a personal project built with love, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📜 License

MIT License — Feel free to use this for your own love story! 💜

---

## 💜 Credits

Built with love for **Ива** on her 23rd birthday.

*"Every journey is better with you."*

---

<div align="center">

Made with 💜 and ✨

</div>
