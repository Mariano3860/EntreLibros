export type SuggestionItem = {
  id: string
  user: string
  avatar: string
}

export const suggestionsMock: SuggestionItem[] = Array.from({ length: 5 }).map(
  (_, idx) => ({
    id: `s${idx}`,
    user: `Reader ${idx + 1}`,
    avatar: `https://i.pravatar.cc/100?img=${idx + 11}`,
  })
)

export default suggestionsMock
