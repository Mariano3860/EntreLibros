import type {
  CommunityCornerMap,
  CommunityCornerSummary,
} from '@src/api/community/corners.types'
import { prototypeCatalog } from '@src/features/prototype/catalog'

let additionalCorners: CommunityCornerSummary[] = []

const baseCorners = (): CommunityCornerSummary[] =>
  prototypeCatalog.corners.map((corner) => ({
    id: corner.id,
    name: corner.name,
    imageUrl: '/prototype/community-reading.svg',
    distanceKm: Number(
      corner.distance.replace(',', '.').replace(/[^\d.]/g, '')
    ),
    activityLabel: corner.activity,
  }))

export const generateCornerSummaries = (): CommunityCornerSummary[] => [
  ...additionalCorners,
  ...baseCorners(),
]

export const generateCornersMap = (): CommunityCornerMap => ({
  description: 'Explorá los rincones activos cerca tuyo.',
  pins: [
    ...additionalCorners.map((corner, index) => ({
      id: corner.id,
      name: corner.name,
      x: 18 + index * 8,
      y: 22 + index * 7,
      status: 'active' as const,
    })),
    ...prototypeCatalog.corners.map((corner) => ({
      id: corner.id,
      name: corner.name,
      x: corner.x,
      y: corner.y,
      status: 'active' as const,
    })),
  ],
})

export const registerCorner = (corner: CommunityCornerSummary) => {
  additionalCorners = [
    corner,
    ...additionalCorners.filter((item) => item.id !== corner.id),
  ]
}
