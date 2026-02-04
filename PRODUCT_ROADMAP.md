# Two Souls on the Road - Product Roadmap

## Overview

A private, romantic travel journal web app for couples to document their adventures, create time capsules, exchange secret messages, and preserve memories together.

---

## Current Features (v1.0)

### Core Features
- **Chapter System**: Create travel chapters with destinations, dates, moods
- **Moments**: Photo-based memories with captions and authors
- **Day Entries**: Daily journal with thoughts and gratitude
- **Letters**: Secret messages between partners with reveal mechanics
- **Time Capsules**: Future-dated content that unlocks on specific dates
- **Random Memory**: "Surprise Me" feature to resurface old memories

### Design & UX
- Witchy/bookish aesthetic with purple-silver theme
- Light and dark mode support
- Responsive design for mobile and desktop
- Beautiful animations and transitions

### Security & Privacy
- PIN lock screen with SHA-256 hashing
- Session-based authentication
- Lockout protection (5 attempts, 5-minute cooldown)
- Local-first data storage (localStorage)

### PWA Features
- Installable as mobile app
- Service worker for offline support
- Push notification infrastructure
- Background sync capability

---

## Pricing Strategy

### Recommended Pricing Tiers

#### 1. Basic (Free / Freemium)
- 1 active chapter
- 10 moments per chapter
- Basic themes
- Local storage only
- No cloud backup

#### 2. Lovers ($4.99/month or $39.99/year)
- Unlimited chapters
- Unlimited moments
- Premium themes & customization
- Cloud backup & sync
- Priority support
- Custom couple names

#### 3. Forever ($99.99 one-time)
- Everything in Lovers tier
- Lifetime access
- Printed book export (1 per year)
- Video memory compilation
- Premium anniversary features
- Early access to new features

### Alternative Models

**Gift Model**:
- $29.99 one-time purchase as a gift
- Includes setup wizard for the recipient
- Gift card/code redemption system
- Perfect for Valentine's Day, anniversaries, birthdays

**Wedding/Anniversary Package**: $149.99
- Pre-wedding countdown features
- Wedding day timeline
- Honeymoon journal
- Physical keepsake options

---

## Features to Add for Commercial Release

### Priority 1 - Essential for Launch

#### User Authentication & Accounts
- [ ] Email/password registration
- [ ] Social login (Google, Apple)
- [ ] Couple linking system (invite partner)
- [ ] Account recovery

#### Cloud Infrastructure (Supabase already integrated)
- [x] Supabase backend (already set up)
- [ ] Photo storage migration to Supabase Storage
- [ ] Real-time sync between devices
- [ ] Automatic cloud backup

#### Payment Integration
- [ ] Stripe payment processing
- [ ] Subscription management
- [ ] Gift code system
- [ ] Upgrade/downgrade flows

### Priority 2 - Competitive Advantage

#### Enhanced Memories
- [ ] Video moment support
- [ ] Voice memo recordings
- [ ] Spotify song linking
- [ ] Location tagging with maps
- [ ] Weather data integration

#### Social Features
- [ ] Shared wishlists (places to visit)
- [ ] Milestone celebrations
- [ ] Relationship timeline view
- [ ] "This Day Last Year" reminders

#### Personalization
- [ ] Custom color themes
- [ ] Font selections
- [ ] Avatar/profile photos
- [ ] Cover photo for chapters
- [ ] Custom ornament designs

### Priority 3 - Delight Features

#### Export & Printing
- [ ] PDF book export
- [ ] Integration with print services (Blurb, Shutterfly)
- [ ] Instagram-style square exports
- [ ] Shareable memory cards

#### AI Features
- [ ] AI writing suggestions
- [ ] Photo enhancement
- [ ] Memory summaries
- [ ] Sentiment analysis of entries

#### Gamification
- [ ] Achievement badges
- [ ] Streak tracking (daily journaling)
- [ ] Couple challenges
- [ ] Memory milestones

---

## Technical Requirements for Production

### Infrastructure
- **Frontend**: Next.js (already using)
- **Backend**: Supabase or Firebase
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage or Cloudinary
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: SendGrid or Resend
- **Analytics**: Plausible or Mixpanel
- **Error Tracking**: Sentry

### Performance Optimizations
- [ ] Image compression pipeline
- [ ] Lazy loading for images
- [ ] Infinite scroll for moments
- [ ] Service worker caching strategy
- [ ] CDN for static assets

### Security Hardening
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] Content Security Policy
- [ ] Regular security audits

---

## Marketing Strategy

### Target Audiences
1. **Couples in Long-Distance Relationships**
   - Need digital connection tools
   - Value sentimental features

2. **Travel Enthusiasts**
   - Document adventures together
   - Create travel memories

3. **Newlyweds / Engaged Couples**
   - Document relationship milestones
   - Wedding memories

4. **Anniversary Gift Buyers**
   - Looking for unique, personalized gifts
   - Willing to pay premium

### Marketing Channels
- Instagram (visual content)
- TikTok (relationship content)
- Pinterest (gift ideas, wedding planning)
- Reddit (r/LongDistance, r/relationships)
- Influencer partnerships
- App Store optimization

### Key Selling Points
- "A love letter that grows with your relationship"
- "Your private digital memory book"
- "Time capsules for your future selves"
- "Not social media - just you and them"

---

## Development Timeline

### Phase 1: MVP Stabilization (2-4 weeks)
- Fix any remaining bugs
- Performance optimization
- Complete icon replacement
- Comprehensive testing

### Phase 2: Backend Integration (4-6 weeks)
- Set up Supabase
- Migrate from localStorage
- Implement authentication
- Add cloud backup

### Phase 3: Payment & Subscriptions (2-3 weeks)
- Stripe integration
- Subscription management
- Gift code system

### Phase 4: Enhanced Features (4-6 weeks)
- Video support
- Print export
- Advanced customization

### Phase 5: Launch (2 weeks)
- App Store submission
- Marketing campaign
- Customer support setup

---

## Revenue Projections

### Conservative Estimates (Year 1)
- 1,000 free users
- 100 paid subscribers (10% conversion)
- Average $5/month = $6,000 annual recurring
- 50 lifetime purchases = $5,000
- **Total: ~$11,000**

### Moderate Estimates (Year 1)
- 5,000 free users
- 500 paid subscribers
- Average $5/month = $30,000 annual recurring
- 200 lifetime purchases = $20,000
- Gift purchases (holidays) = $10,000
- **Total: ~$60,000**

### Optimistic Estimates (Year 1)
- 20,000 free users
- 2,000 paid subscribers
- Average $5/month = $120,000 annual recurring
- 500 lifetime purchases = $50,000
- Gift/special packages = $30,000
- **Total: ~$200,000**

---

## Competitive Analysis

### Direct Competitors
- **Between** (couple app): More messaging focused
- **Paired** (couple app): Focuses on relationship health
- **Couple** (couple app): Similar memory features

### Indirect Competitors
- Instagram Close Friends
- Private photo albums (Google/Apple)
- Paper journals

### Our Differentiation
- Unique witchy/bookish aesthetic
- Time capsule feature
- Secret letters mechanic
- Travel/adventure focused
- Privacy-first (no social features)
- Beautiful offline experience

---

## Next Steps

1. **Immediate**: Finish current feature implementations
2. **This Week**: Set up Supabase project and plan migration
3. **This Month**: Implement user authentication
4. **Next Month**: Add payment processing
5. **Q2**: Beta launch with early adopters
6. **Q3**: Public launch

---

*Last Updated: February 2026*
