export type FocalPoint = `${number}% ${number}%`
export interface ImageSource { src: string; width: number; format: 'avif' | 'webp' | 'jpeg' }
export interface ImageAsset {
  id: string
  src: string
  mobileSrc?: string
  mobileWidth?: number
  mobileHeight?: number
  width: number
  height: number
  alt: string
  sources: ImageSource[]
  focal: { desktop: FocalPoint; phone: FocalPoint }
  monochrome: boolean
  provenance: { sourceUrl: string | null; status: 'supplied' | 'usable-original' | 'unsplash-substitute'; credit: string }
}
export interface ProfileRecord {
  id: 'bride' | 'groom'
  role: string
  nickname: string
  fullName: string
  parentLines: [string, string, string]
  imageId: string
  socialHandle: string | null
  socialUrl: string | null
}
export interface ChapterRecord { id: string; year: string; title: string; paragraphs: string[] }
export interface ScheduleRow {
  id: 'matrimony' | 'reception'
  label: string
  lines: string[]
  action: { label: string; url: string } | null
  colors: { label: string; value: string }[]
}
export interface BankRecord { id: string; bank: string; holder: string; account: string }
export interface WishRecord { id: string; name: string; dateLabel: string; message: string }
export interface CalendarRecord { uid: string; title: string; startsAt: string; endsAt: string; location: string }
export interface ClaireContent {
  cover: { imageId: string; eyebrow: string; names: string; dateLabel: string; apology: string }
  hero: { posterId: string; foregroundId?: string; videoSrc: string | null; audioSrc: string | null; occasion: string; names: string; dateLabel: string; scripture: string; attribution: string }
  quote: { text: string; imageIds: [string, string, string] }
  profiles: [ProfileRecord, ProfileRecord]
  story: { caption: string; imageIds: string[]; chapters: [ChapterRecord, ChapterRecord, ChapterRecord] }
  celebration: { imageId: string; ribbon: string; calendar: CalendarRecord | null }
  events: { label: string; weekday: string; dateLabel: string; rows: ScheduleRow[] }
  gift: { introduction: string; imageId: string; banks: BankRecord[] }
  rsvp: { introduction: string; imageId: string; wishes: WishRecord[]; pageSize: 7 }
  video: { posterId: string; source: { kind: 'file' | 'youtube'; value: string } | null }
  gallery: { heading: string; imageIds: string[] }
  closing: { imageId: string; blessing: string; names: string; credits: { label: string; url: string | null }[] }
  navigationImageId: string
}
