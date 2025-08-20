import { BookFeedCard } from './cards/BookFeedCard'
import { EventCard } from './cards/EventCard'
import { ForSaleCard } from './cards/ForSaleCard'
import { HouseCard } from './cards/HouseCard'
import { PeopleCard } from './cards/PeopleCard'
import { ReviewCard } from './cards/ReviewCard'
import { SeekingCard } from './cards/SeekingCard'
import { SwapProposalCard } from './cards/SwapProposalCard'
import type { FeedItem } from './FeedItem.types'

interface Props {
  items: FeedItem[]
}

export const FeedList = ({ items }: Props) => {
  return (
    <div>
      {items.map((item) => {
        switch (item.type) {
          case 'book':
            return <BookFeedCard key={item.id} item={item} />
          case 'swap':
            return <SwapProposalCard key={item.id} item={item} />
          case 'sale':
            return <ForSaleCard key={item.id} item={item} />
          case 'seeking':
            return <SeekingCard key={item.id} item={item} />
          case 'review':
            return <ReviewCard key={item.id} item={item} />
          case 'event':
            return <EventCard key={item.id} item={item} />
          case 'house':
            return <HouseCard key={item.id} item={item} />
          case 'person':
            return <PeopleCard key={item.id} item={item} />
          default:
            return null
        }
      })}
    </div>
  )
}
