import data from '../../data/guides.json'

export interface Guide {
  slug:       string
  title:      string
  subtitle:   string
  pillar:     'data-bi' | 'app-dev' | 'philosophy' | 'crossover'
  date:       string
  readTime:   number
  src:        string
  author?:    string
  video_url?: string
  thumbnail?: string
}

export interface GuidesData {
  comingSoon:         boolean
  comingSoonHeading?: string
  comingSoonMessage?: string
  comingSoonSubtext?: string
  guides:             Guide[]
}

const guidesData = data as unknown as GuidesData

export const GUIDES: Guide[] = guidesData.guides
export default guidesData
