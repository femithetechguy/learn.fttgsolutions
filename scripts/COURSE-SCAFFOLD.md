# Course Scripts

Two scripts for managing course content from YouTube playlists. Both read `YOUTUBE_API_KEY` from `.env.local` — set it once and never touch it again.

---

## Setup (one time only)

### 1. Enable YouTube Data API v3

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or select an existing one)
3. Navigate to **APIs & Services → Library**
4. Search for **YouTube Data API v3** and enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API Key**
6. Name it `fttg-youtube-scaffold-script`, select **YouTube Data API v3** under API restrictions, leave Application restrictions as **None**, click **Create**
7. Copy the key

### 2. Add the key to `.env.local`

```
YOUTUBE_API_KEY=AIzaSy...
```

Done. The key never changes — it works for every pillar and every course.

---

## How to find your Playlist ID

Every YouTube playlist URL looks like this:

```
https://www.youtube.com/playlist?list=PL-kaoXbNQhEqQ5SXhyGquxE2gAktBNU85
```

The part after `list=` is the **Playlist ID**. That is what you pass to the scripts.

---

## How to choose a slug

The slug becomes both the **filename** and the **URL** of the course on the platform.

- Lowercase, hyphens only, no spaces
- Should match the course title closely
- Must be unique across all courses

**Existing slugs (already taken):**
```
builders-philosophy       ← data/courses/detail/builders-philosophy.json
dax-zero-to-advanced
nestjs-api-architecture
nextjs-personal-brand-site
python-etl-for-power-bi
the-crossover-series
think-and-build-rich
```

---

## scaffold-course.ts

Use this for a **brand new course** that has no JSON file yet.

**Command:**
```bash
npx ts-node scripts/scaffold-course.ts <playlistId> <slug>
```

**What the command arguments mean:**
- `<playlistId>` — the ID from your YouTube playlist URL (after `list=`)
- `<slug>` — the name you want to give the course file and URL

**Example — adding a new Philosophy course:**
```bash
npx ts-node scripts/scaffold-course.ts PL-kaoXbNQhEqQ5SXhyGquxE2gAktBNU85 stoic-builder
```

This creates `data/courses/detail/stoic-builder.json` with all video IDs, titles, and durations pre-filled.

**Examples by pillar:**
```bash
# App Dev
npx ts-node scripts/scaffold-course.ts PL-kaoXbNQhEqJjzHBclg7HFKiYeVSkzaf nextjs-mastery

# Data & BI
npx ts-node scripts/scaffold-course.ts PL-kaoXbNQhErED_N27CbkRucIGhGB-C10 dax-fundamentals

# Philosophy
npx ts-node scripts/scaffold-course.ts PL-kaoXbNQhEqQ5SXhyGquxE2gAktBNU85 stoic-builder

# Crossover
npx ts-node scripts/scaffold-course.ts PL-kaoXbNQhEoc3jloM9T5kpwDOgPoO9V_ crossover-series
```

**After the script runs, open the generated JSON and:**

1. Fill in the `TODO` fields at the top — use `builders-philosophy.json` as your reference:
   ```json
   {
     "slug": "stoic-builder",
     "title": "The Stoic Builder",
     "subtitle": "One sentence description of the course.",
     "pillar": "philosophy",
     "pillarLabel": "Philosophy",
     "pillarColor": "#EF9F27",
     "level": "All levels",
     "totalDuration": "20+ hours",
     "free": false,
     "playlistId": "PL-kaoXbNQhEqQ5SXhyGquxE2gAktBNU85",
     "links": null
   }
   ```
2. Split lessons into logical modules — cut and paste lesson objects into separate module blocks
3. Write a `description` for each module (shown as the overview before the first lesson plays)
4. Set `"free": true` on any lessons you want publicly accessible
5. Add the course to `src/lib/courses.ts` so the platform knows it exists

> **Safety:** The script will refuse to run if the file already exists. Pass `--force` only if you intentionally want to wipe and start over.

---

## sync-course.ts

Use this when you **add new videos** to a YouTube playlist for a course that is already live.

**Command:**
```bash
npx ts-node scripts/sync-course.ts <slug>
```

No playlist ID needed — it reads the `playlistId` already stored inside the course JSON.

**Examples:**
```bash
npx ts-node scripts/sync-course.ts builders-philosophy
npx ts-node scripts/sync-course.ts nextjs-mastery
```

**What it does:**
- Fetches the full playlist from YouTube
- Compares against every video ID already in the JSON
- Appends only the new videos to the last module
- Never touches existing lessons, module structure, descriptions, or flags

**After the script runs:**
1. New lessons appear at the bottom of the last module with `"free": false`
2. Move them to a different module if needed
3. Set `"free": true` on any publicly accessible lessons

> **Safety:** Only new video IDs are added. Existing content is never modified or deleted.

---

## Pillar reference

| Pillar | `pillar` value | `pillarLabel` | `pillarColor` |
|--------|---------------|---------------|---------------|
| App Dev | `app-dev` | `App Dev` | `#378ADD` |
| Data & BI | `data-bi` | `Data & BI` | `#1D9E75` |
| Philosophy | `philosophy` | `Philosophy` | `#EF9F27` |
| Crossover | `crossover` | `Crossover` | `#7F77DD` |
