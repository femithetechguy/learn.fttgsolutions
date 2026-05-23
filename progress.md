# learn.fttgsolutions.com — Project Progress

**Project:** FTTG Learn — Content Creator & Training Platform
**Owner:** Adefemi Kolawole (Femi) · FTTG Solutions LLC · McDonough, GA
**Started:** May 2026
**Status:** 🟡 Frontend scaffold complete — backend integration pending

---

## Overview

A Next.js 14 training platform hosted at `learn.fttgsolutions.com`, built as part of the broader FTTG Solutions content creator strategy. The platform covers three content pillars — **App Development**, **Data & BI**, and **Philosophy of Building** — with a crossover series tying them together.

---

## Strategy & Planning ✅

### Content Strategy
- [x] Defined three-pillar model: App Development · Data & BI · Philosophy of Building
- [x] Identified philosophy direction: Jim Rohn, Napoleon Hill, Earl Nightingale, Joseph Murphy — timeless success principles applied to the builder's life
- [x] Identified brand differentiator: **The Crossover** — nobody else sits at the intersection of enterprise BI consulting, full-stack dev, and classical success philosophy
- [x] Mapped content formats: long-form YouTube (10–30 min), short-form Shorts/Reels (60–90 sec), written articles on learn site, paid products (Month 6+)

### Series Concepts Defined
- [x] **The Builder's Philosophy** — short-form, one principle per episode from the classics
- [x] **Think & Build Rich** — long-form YouTube, chapter-by-chapter Napoleon Hill
- [x] **One Principle, One Week** — weekly short, one timeless idea in 60–90 seconds
- [x] **The Crossover** — long and short-form connecting BI/dev with philosophy

### 30-Day Launch Calendar
- [x] Week 1 (Days 1–7): Foundation + batch record — no publishing yet, build buffer of 5–7 videos
- [x] Week 2 (Days 8–14): Go live — first long-form + shorts published, rhythm established
- [x] Week 3 (Days 15–21): Build rhythm — all three pillars active, crossover video published
- [x] Week 4 (Days 22–30): Full stride — DAX series launched, 30-day review, reflection short
- [x] 30-day targets: 7 long-form videos · 10 shorts · 5+ learn site articles · 3 pillars active

### Documents Produced
- [x] `FTTG_Content_Strategy.docx` — full strategy doc (Source Sans Pro, 5 sections, US Letter)

---

## Frontend — learn.fttgsolutions.com ✅

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS 3
- Lucide React icons
- Source Sans Pro + Playfair Display (Google Fonts) — matching Grill & Glam repo pattern
- Playwright — E2E testing (`tests/e2e/`, `playwright.config.ts`, `npm run test:e2e`)

### Design Tokens (from fttgsolutions.com + grillandglam repo)
| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#080808` | Page background |
| `bg-secondary` | `#111111` | Nav, panels |
| `bg-card` | `#161616` | Course cards |
| `bg-elevated` | `#1e1e1e` | Form inputs |
| `gold` | `#D4AF37` | Primary accent |
| `gold-light` | `#E8CC6A` | Hover states |
| `gold-dark` | `#A8891E` | Active states |
| `text-primary` | `#F0EDE6` | Main copy |
| `text-secondary` | `#A0998E` | Supporting copy |
| `text-muted` | `#5A5550` | Labels, hints |
| `accent-bi` | `#1D9E75` | Data & BI pillar |
| `accent-dev` | `#378ADD` | App Dev pillar |
| `accent-phil` | `#EF9F27` | Philosophy pillar |
| `accent-cross` | `#7F77DD` | Crossover pillar |

### Files Delivered

| File | Path | Status |
|---|---|---|
| `page.tsx` | `src/app/page.tsx` | ✅ Done |
| `layout.tsx` | `src/app/layout.tsx` | ✅ Done — explicit favicon metadata added |
| `globals.css` | `src/app/globals.css` | ✅ Done |
| `LoginPage.tsx` | `src/components/LoginPage.tsx` | ✅ Done |
| `Dashboard.tsx` | `src/components/Dashboard.tsx` | ✅ Done |
| `Logo.tsx` | `src/components/Logo.tsx` | ✅ Done |
| `auth-context.tsx` | `src/lib/auth-context.tsx` | ✅ Done |
| `tailwind.config.js` | root | ✅ Done |
| `package.json` | root | ✅ Done |

### Features Implemented

**Login Page (`LoginPage.tsx`)**
- [x] Split-panel layout: left = brand/pillars, right = form
- [x] Email + password fields with show/hide toggle
- [x] "Sign In" primary button with loading spinner
- [x] "Continue as Guest" secondary button — allows access without account
- [x] Forgot password link (stub)
- [x] Create account link (stub)
- [x] Back to fttgsolutions.com link
- [x] Error state display
- [x] Pillar cards on left panel (App Dev · Data & BI · Philosophy · Crossover)
- [x] Stats row: 3 pillars · 50+ lessons · Free guest access
- [x] Animated entrance (fade-in + slide-up)
- [x] Noise texture overlay, ambient glow effects, gold grid background

**Dashboard (`Dashboard.tsx`)**
- [x] Sticky dark nav with Logo, nav links, user state, sign-out
- [x] Mobile-responsive hamburger menu
- [x] Personalised hero: "Hey, {name}" for members, guest banner for guests
- [x] Stats row: 50+ lessons · 27h content · 3 pillars · Free guest access
- [x] Filter pills: All · Data & BI · App Dev · Philosophy · Crossover · Free
- [x] 7 sample courses across all 4 pillars
- [x] Course cards: pillar badge · free/member tag · description · lesson count · duration · level · CTA button
- [x] Featured course highlighting (gold glow border + "Featured" badge)
- [x] Guest lock state: member-only courses show lock icon + disabled CTA
- [x] Guest upsell banner at bottom
- [x] Footer with LLC info + email

**Logo (`Logo.tsx`)**
- [x] Gold square mark with "F"
- [x] FTTG wordmark + "Learn" label + "Solutions" sub-label
- [x] Three sizes: `sm` · `md` · `lg`
- [x] `showLearn` prop for footer variant

**Auth (`auth-context.tsx` + `page.tsx`)**
- [x] `AuthProvider` context with `login`, `continueAsGuest`, `logout`
- [x] Stub `login()` function — ready to replace with real API call
- [x] Guest flow: sets `role: 'guest'`, unlocks free content only
- [x] Member flow: sets `role: 'member'`, unlocks all content
- [x] State orchestrated in `page.tsx` — swaps `<LoginPage>` ↔ `<Dashboard>` on auth change

---

## Pending — Backend Integration 🔴

> These are stubs in the current frontend — Femi will wire these to the NestJS backend.

### Auth
- [ ] Replace `login()` stub in `auth-context.tsx` with real `POST /api/auth/login`
- [ ] Integrate NextAuth.js or custom JWT session
- [ ] Implement token storage (httpOnly cookie recommended)
- [ ] Add `POST /api/auth/register` for account creation
- [ ] Add `POST /api/auth/forgot-password` flow
- [ ] Protect dashboard route with middleware (`src/middleware.ts`)

### Courses
- [ ] Replace hardcoded `COURSES` array in `Dashboard.tsx` with `GET /api/courses`
- [ ] Add course detail page: `src/app/courses/[id]/page.tsx`
- [ ] Add lesson player page: `src/app/courses/[id]/lessons/[lessonId]/page.tsx`
- [ ] Wire progress tracking: `POST /api/progress` on lesson completion
- [ ] Display real progress bar on course cards

### User Account
- [ ] Add profile page: `src/app/profile/page.tsx`
- [ ] Add settings page: `src/app/settings/page.tsx`
- [ ] Add enrollment endpoint: `POST /api/enroll`

### Content Management
- [ ] Wire YouTube embed for video lessons
- [ ] Connect learn site articles (MDX or CMS)
- [ ] Add search: `GET /api/courses/search?q=`

---

## Pending — Pages & Features 🟡

- [ ] Course detail page (description, syllabus, instructor, enroll CTA)
- [ ] Lesson player page (video embed, notes, next/prev navigation)
- [ ] Articles index page (`/articles`)
- [ ] Individual article page (`/articles/[slug]`)
- [ ] Profile / account page
- [ ] Pricing / upgrade page (guest → member conversion)
- [ ] Search functionality
- [ ] Email capture / newsletter signup

---

## Pending — Infrastructure 🟡

- [x] Deploy to Vercel under `learn.fttgsolutions.com`
- [x] Created `.env.example` (tracked) and `.env.local` (gitignored) with `NEXT_PUBLIC_SITE_URL`
- [x] Fixed Vercel project icon — added `public/favicon.svg` + explicit `type: 'image/svg+xml'` in layout metadata (same pattern as fttgsolutions repo)
- [ ] Add DNS CNAME: `learn` → `cname.vercel-dns.com`
- [ ] Configure `next.config.js` with production image domains
- [ ] Add environment variables: `NEXTAUTH_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`

---

## Project File Structure

```
learn-fttg/
├── src/
│   ├── app/
│   │   ├── globals.css           # Global styles, Google Fonts, custom utilities
│   │   ├── layout.tsx            # Root layout with metadata
│   │   └── page.tsx              # Auth state orchestrator
│   ├── components/
│   │   ├── LoginPage.tsx         # Split-panel login + guest button
│   │   ├── Dashboard.tsx         # Course grid, filters, guest/member states
│   │   └── Logo.tsx              # FTTG Learn mark + wordmark
│   └── lib/
│       └── auth-context.tsx      # Auth context (stub — wire backend here)
├── public/                       # Static assets (favicon, og-image)
├── tailwind.config.js            # FTTG color tokens, fonts, animations
├── next.config.js                # Image domains config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── progress.md                   # This file
```

---

## Next Steps (Priority Order)

1. **Drop files into local Next.js repo** — `npm install && npm run dev`
2. **Deploy to Vercel** — connect repo, set `learn.fttgsolutions.com` subdomain
3. **Wire auth** — replace `login()` stub with real NestJS endpoint or NextAuth
4. **Replace hardcoded courses** — pull from `GET /api/courses`
5. **Build course detail + lesson player pages**
6. **Add MDX articles** — first 5 articles matching 30-day calendar content

---

*Last updated: 23 May 2026 · FTTG Solutions LLC*
