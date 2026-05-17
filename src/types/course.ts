export interface Lesson {
  id: string
  title: string
  duration: string
  videoId: string
  free: boolean
  description?: string
}

export interface CourseModule {
  id: string
  title: string
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
