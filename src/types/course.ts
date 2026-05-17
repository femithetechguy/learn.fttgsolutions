export interface Lesson {
  id: string
  title: string
  duration: string
  videoId: string
  free: boolean
  description?: string
  transcript?: string   // full transcript text; shown in the player transcript panel
}

export interface CourseDownload {
  name: string
  url: string
  size?: string   // e.g. "2.3 MB"
}

export interface CourseModule {
  id: string
  title: string
  description?: string        // intro text shown above the video when in this module
  hasDownloads?: boolean
  downloads?: CourseDownload[]
  lessons: Lesson[]
}

export interface CourseDetail {
  slug: string
  title: string
  subtitle: string
  pillar: string
  pillarLabel: string
  pillarColor: string
  level: string
  totalDuration: string
  free: boolean
  playlistId?: string
  links?: string | null
  modules: CourseModule[]
}
