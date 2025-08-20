export type ActivityItem = {
  id: string
  user: string
  avatar: string
}

export const activityMock: ActivityItem[] = Array.from({ length: 10 }).map((_, idx) => ({
  id: `a${idx}`,
  user: `User ${idx + 1}`,
  avatar: `https://i.pravatar.cc/100?img=${idx + 1}`,
}))

export default activityMock
