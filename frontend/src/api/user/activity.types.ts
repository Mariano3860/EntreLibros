export type UserActivityAction = 'offered' | 'exchanged'

export type UserActivityItem = {
  id: string
  bookTitle: string
  action: UserActivityAction
  coverUrl: string
  timestamp: string
}
