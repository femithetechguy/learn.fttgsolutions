# Course Scripts

Two scripts for managing course content from YouTube playlists. Both read `YOUTUBE_API_KEY` from `.env.local` — set it once and forget it.

---

## Setup

### 1. Enable YouTube Data API v3

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or select an existing one)
3. Navigate to **APIs & Services → Library**
4. Search for **YouTube Data API v3** and enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Copy the key

### 2. Add the key to `.env.local`

```
YOUTUBE_API_KEY=AIzaSy...
```

That's the only setup required. The key never changes between runs.

---

## scaffold-course.ts

Creates a **brand new** course JSON from a YouTube playlist. Use this when starting a course from scratch.

**What it does:**
- Fetches all videos from the playlist (handles pagination automatically)
- Pulls each video's title and duration
- Writes a scaffolded JSON to `data/courses/detail/<slug>.json`
- All videos are placed in one module — you split them manually

**Command:**
```bash
npx ts-node scripts/scaffold-course.ts <playlistId> <slug>
```

**Examples by pillar:**
```bash
# App Dev
npx ts-node scripts/scaffold-course.ts PLxxxxxxxxxxxxxxx nextjs-mastery

# Data & BI
npx ts-node scripts/scaffold-course.ts PLxxxxxxxxxxxxxxx dax-fundamentals

# Philosophy
npx ts-node scripts/scaffold-course.ts PLxxxxxxxxxxxxxxx stoic-builder

# Crossover (when ready)
npx ts-node scripts/scaffold-course.ts PLxxxxxxxxxxxxxxx crossover-series
```

**After the script runs:**

1. Open `data/courses/detail/<slug>.json`
2. Fill in the `TODO` fields at the top:
   ```json
   "title": "Your Course Title",
   "subtitle": "One line description.",
   "pillar": "app-dev",
   "pillarLabel": "App Dev",
   "pillarColor": "#378ADD",
   "level": "Intermediate",
   "totalDuration": "8+ hours",
   ```
3. Split lessons into logical modules — cut and paste lesson objects into separate module blocks
4. Write a `description` for each module (shown as the overview before the first lesson plays)
5. Set `"free": true` on any lessons you want publicly accessible
6. Add the course to `src/lib/courses.ts` so the platform knows it exists

> **Safety:** The script will refuse to run if the file already exists. Pass `--force` only if you intentionally want to wipe and rebuild from scratch.

---

## sync-course.ts

Adds **new videos** to an existing course JSON. Use this when you upload new videos to a YouTube playlist after the course is already live.

**What it does:**
- Reads the `playlistId` already stored in the course JSON
- Fetches the full playlist from YouTube
- Compares against existing lesson video IDs
- Appends only new videos to the last module
- Never touches existing lessons, descriptions, module structure, or flags

**Command:**
```bash
npx ts-node scripts/sync-course.ts <slug>
```

**Examples:**
```bash
npx ts-node scripts/sync-course.ts builders-philosophy
npx ts-node scripts/sync-course.ts nextjs-mastery
```

**After the script runs:**

1. New lessons are appended to the last module with `"free": false` by default
2. Move them to a different module if needed
3. Set `"free": true` on any publicly accessible lessons
4. Add descriptions or notes if applicable

> **Safety:** Only new video IDs are added. Existing content is never modified or deleted.

---

## Pillar colors reference

| Pillar | Color |
|--------|-------|
| App Dev | `#378ADD` |
| Data & BI | `#1D9E75` |
| Philosophy | `#EF9F27` |
| Crossover | `#7F77DD` |
