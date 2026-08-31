export type CommunityStoryPreview = {
  id: string
  storyId: string
  user: string
  avatar: string
  body: string
  image?: string
  time: string
  isFollowing: boolean
}

export type CommunitySuggestion = {
  id: string
  user: string
  avatar: string
  reason: 'nearby' | 'similar_interests' | 'active_reader'
  distanceKm?: number
  commonInterests: string[]
  isFollowing: boolean
}

export type CommunityBookRecommendation = {
  id: string
  title: string
  author: string
  cover: string
  condition?: string
  owner: { id: string; user: string }
  commonInterests: string[]
  isFollowing: boolean
}

export type CommunityDiscovery = {
  stories: CommunityStoryPreview[]
  suggestions: CommunitySuggestion[]
  recommendedBooks: CommunityBookRecommendation[]
}
