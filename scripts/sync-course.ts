/**
 * sync-course.ts
 *
 * Fetches a course's YouTube playlist and appends any new videos
 * (not already in the JSON) to the last module. Never modifies
 * existing lessons, module structure, descriptions, or flags.
 *
 * Prerequisites:
 *   - YOUTUBE_API_KEY set in .env.local
 *
 * Usage:
 *   npx ts-node scripts/sync-course.ts <slug>
 *
 * Examples:
 *   npx ts-node scripts/sync-course.ts builders-philosophy
 *   npx ts-node scripts/sync-course.ts nextjs-mastery
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length && !key.startsWith('#')) {
      process.env[key.trim()] ??= rest.join('=').trim()
    }
  }
}

const API_KEY = process.env.YOUTUBE_API_KEY
const [, , SLUG] = process.argv

// ── Validation ──────────────────────────────────────────────────────────────

if (!API_KEY) {
  console.error('Error: YOUTUBE_API_KEY is not set in .env.local')
  process.exit(1)
}

if (!SLUG) {
  console.error('Usage: npx ts-node scripts/sync-course.ts <slug>')
  process.exit(1)
}

const jsonPath = path.join(process.cwd(), 'data', 'courses', 'detail', `${SLUG}.json`)
if (!fs.existsSync(jsonPath)) {
  console.error(`Error: ${jsonPath} not found.`)
  console.error('  Use scaffold-course.ts to create a new course.')
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
  snippet: { title: string; resourceId: { videoId: string } }
}

interface VideoDetail {
  id: string
  contentDetails: { duration: string }
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
  const course = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

  if (!course.playlistId) {
    console.error('Error: course JSON has no playlistId field.')
    console.error('  Add "playlistId": "PLxxxxxxx" to the JSON and re-run.')
    process.exit(1)
  }

  console.log(`\nSyncing: ${course.title ?? SLUG}`)
  console.log(`Playlist: ${course.playlistId}`)

  // Collect all existing video IDs so we don't duplicate
  const existingIds = new Set<string>(
    course.modules.flatMap((m: { lessons: { videoId: string }[] }) =>
      m.lessons.map((l: { videoId: string }) => l.videoId).filter(Boolean)
    )
  )
  console.log(`  Existing lessons: ${existingIds.size}`)

  const items = await fetchAllPlaylistItems(course.playlistId)
  const newItems = items.filter(i => !existingIds.has(i.snippet.resourceId.videoId))

  if (newItems.length === 0) {
    console.log('\n✓ Already up to date — no new videos found.')
    return
  }

  console.log(`  New videos found: ${newItems.length}`)
  console.log('  Fetching durations…')

  const newIds = newItems.map(i => i.snippet.resourceId.videoId)
  const durations = await fetchDurations(newIds)

  // Find the highest existing lesson id number across all modules
  const allLessonIds = course.modules.flatMap((m: { lessons: { id: string }[] }) =>
    m.lessons.map((l: { id: string }) => parseInt(l.id.replace('l', '')) || 0)
  )
  let nextId = allLessonIds.length > 0 ? Math.max(...allLessonIds) + 1 : 1

  const newLessons = newItems.map(item => ({
    id:       `l${nextId++}`,
    title:    item.snippet.title,
    duration: durations[item.snippet.resourceId.videoId] ?? '0:00',
    videoId:  item.snippet.resourceId.videoId,
    free:     false,
  }))

  // Append to last module
  const lastModule = course.modules[course.modules.length - 1]
  lastModule.lessons.push(...newLessons)

  fs.writeFileSync(jsonPath, JSON.stringify(course, null, 2))

  console.log(`\n✓ Added ${newLessons.length} new lesson${newLessons.length !== 1 ? 's' : ''} to module "${lastModule.title}"`)
  console.log('\nNext steps:')
  console.log('  1. Move new lessons to the correct module if needed')
  console.log('  2. Set free: true on any publicly accessible lessons')
  console.log('  3. Add descriptions or notes if applicable\n')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
