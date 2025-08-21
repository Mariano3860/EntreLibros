import { FeedItem } from '@components/feed/FeedItem.types'
import { faker } from '@faker-js/faker'

const relativeTimeFromNow = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) {
    return `hace ${minutes} minuto${minutes === 1 ? '' : 's'}`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `hace ${hours} hora${hours === 1 ? '' : 's'}`
  }
  const days = Math.floor(hours / 24)
  return `hace ${days} día${days === 1 ? '' : 's'}`
}

const generateItem = (): FeedItem => {
  const base = {
    id: faker.string.uuid(),
    user: faker.person.firstName(),
    avatar: faker.image.avatar(),
    time: relativeTimeFromNow(faker.date.recent({ days: 7 })),
    likes: faker.number.int({ min: 0, max: 100 }),
  }
  const type = faker.helpers.arrayElement(['book', 'swap', 'sale', 'seeking'])
  switch (type) {
    case 'book':
      return {
        ...base,
        type: 'book',
        title: faker.lorem.words(2),
        author: faker.person.fullName(),
        cover: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
      }
    case 'swap':
      return {
        ...base,
        type: 'swap',
        requester: faker.person.firstName(),
        offered: faker.lorem.word(),
        requested: faker.lorem.word(),
      }
    case 'sale':
      return {
        ...base,
        type: 'sale',
        title: faker.lorem.words(2),
        price: faker.number.int({ min: 5, max: 50 }),
        condition: faker.helpers.arrayElement(['new', 'used']),
        cover: `https://picsum.photos/seed/${faker.string.uuid()}/600/400`,
      }
    default:
      return {
        ...base,
        type: 'seeking',
        title: faker.lorem.words(2),
      }
  }
}

export const generateFeedItems = (
  page = 0,
  size = 8,
  seed?: number
): FeedItem[] => {
  faker.locale = faker.helpers.arrayElement(['es', 'en', 'fr'])
  faker.seed(seed ?? page)
  return Array.from({ length: size }).map(generateItem)
}
