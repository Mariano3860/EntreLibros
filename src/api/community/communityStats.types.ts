export type TopContributor = {
  username: string
  metric: 'exchanges' | 'books'
  value: number
}

export type HotSearch = {
  term: string
  count: number
}

export type MapPin = {
  top: string
  left: string
}

export type CommunityStats = {
  kpis: {
    exchanges: number
    activeHouses: number
    activeUsers: number
    booksPublished: number
  }
  trendExchanges: number[]
  trendNewBooks: number[]
  topContributors: TopContributor[]
  hotSearches: HotSearch[]
  activeHousesMap: MapPin[]
}
