/**
 * scaffold-course.ts
 *
 * Pulls a YouTube playlist and writes a scaffolded course JSON to
 * data/courses/detail/<slug>.json. Video IDs, titles, and durations
 * are filled in automatically. Everything else (module groupings,
 * descriptions, downloads, free flags) you fill in manually.
 *
 * Usage:
 *   YOUTUBE_API_KEY=... npx ts-node scripts/scaffold-course.ts <playlistId> <slug>
 *
 * Example:
 *   YOUTUBE_API_KEY=AIza... npx ts-node scripts/scaffold-course.ts PLxxxxxxx nextjs-mastery
 *
 * Prerequisites:
 *   - YouTube Data API v3 enabled in Google Cloud Console
 *   - API key with YouTube Data API access
 *   - ts-node installed (npx ts-node works without installing globally)
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

const API_KEY   = process.env.YOUTUBE_API_KEY
const [, , PLAYLIST_ID, SLUG] = process.argv

// ── Validation ─────────────────────────────────────────────────────────────

if (!API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable is not set.')
  console.error('  YOUTUBE_API_KEY=AIza... npx ts-node scripts/scaffold-course.ts <playlistId> <slug>')
  process.exit(1)
}

if (!PLAYLIST_ID || !SLUG) {
  console.error('Usage: npx ts-node scripts/scaffold-course.ts <playlistId> <slug>')
  process.exit(1)
}

// ── HTTP helper ─────────────────────────────────────────────────────────────

function get(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

// ── YouTube helpers ─────────────────────────────────────────────────────────

interface PlaylistItem {
  snippet: {
    title: string
    resourceId: { videoId: string }
    position: number
  }
}

interface VideoDetail {
  id: string
  contentDetails: { duration: string }  // ISO 8601: PT1H2M3S
}

async function fetchAllPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = []
  let pageToken = ''

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`
    const data = await get(url) as { items: PlaylistItem[]; nextPageToken?: string; error?: { message: string } }

    if (data.error) {
      console.error('YouTube API error:', data.error.message)
      process.exit(1)
    }

    items.push(...(data.items ?? []))
    pageToken = data.nextPageToken ?? ''
  } while (pageToken)

  return items
}

async function fetchDurations(videoIds: string[]): Promise<Record<string, string>> {
  const durations: Record<string, string> = {}

  // API allows up to 50 IDs per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).join(',')
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunk}&key=${API_KEY}`
    const data = await get(url) as { items: VideoDetail[] }

    for (const v of data.items ?? []) {
      durations[v.id] = parseDuration(v.contentDetails.duration)
    }
  }

  return durations
}

// PT1H2M3S → "1:02:03" | PT4M30S → "4:30"
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  const h = parseInt(match[1] ?? '0')
  const m = parseInt(match[2] ?? '0')
  const s = parseInt(match[3] ?? '0')
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFetching playlist: ${PLAYLIST_ID}`)

  const items = await fetchAllPlaylistItems(PLAYLIST_ID)
  if (items.length === 0) {
    console.error('No videos found. Check the playlist ID and that it is public.')
    process.exit(1)
  }
  console.log(`  Found ${items.length} videos`)

  const videoIds = items.map(i => i.snippet.resourceId.videoId)
  console.log('  Fetching durations…')
  const durations = await fetchDurations(videoIds)

  // Build lessons
  const lessons = items.map((item, idx) => ({
    id:       `l${idx + 1}`,
    title:    item.snippet.title,
    duration: durations[item.snippet.resourceId.videoId] ?? '0:00',
    videoId:  item.snippet.resourceId.videoId,
    free:     false,
  }))

  // Scaffold output — all lessons in one module; split manually afterwards
  const output = {
    slug:          SLUG,
    title:         'TODO: Course Title',
    subtitle:      'TODO: Course subtitle',
    pillar:        'TODO: app-dev | data-bi | philosophy | crossover',
    pillarLabel:   'TODO: App Dev | Data & BI | Philosophy | Crossover',
    pillarColor:   'TODO: #378ADD | #1D9E75 | #EF9F27 | #7F77DD',
    level:         'TODO: Beginner | Intermediate | Advanced | All levels',
    totalDuration: 'TODO: e.g. 8+ hours',
    free:          false,
    playlistId:    PLAYLIST_ID,
    links:         null,
    modules: [
      {
        id:           'm1',
        title:        'TODO: Module title — split lessons across modules as needed',
        description:  'TODO: Module overview text shown before the first lesson.',
        hasDownloads: false,
        lessons,
      },
    ],
  }

  const outPath = path.join(process.cwd(), 'data', 'courses', 'detail', `${SLUG}.json`)
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`\n✓ Scaffolded ${lessons.length} lessons → ${outPath}`)
  console.log('\nNext steps:')
  console.log('  1. Fill in the TODO fields at the top of the JSON')
  console.log('  2. Split lessons into logical modules (copy lesson objects between module blocks)')
  console.log('  3. Write a description for each module')
  console.log('  4. Set free: true on lessons you want publicly accessible')
  console.log('  5. Add the course to src/lib/courses.ts\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
