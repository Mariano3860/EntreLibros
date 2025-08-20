export type EventStatus = 'upcoming' | 'past' | 'ongoing'

export interface ApiEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  status: EventStatus
  imageUrl: string
}

export interface ApiEventsMetrics {
  eventsThisMonth: number
  hostHouses: number
  confirmedUsers: number
}
