import { useQuery } from '@tanstack/react-query'

import { fetchBooks } from '@src/api/books/books.service'

export const useBooks = () => {
  return useQuery({ queryKey: ['books'], queryFn: fetchBooks })
}
