import { useQuery } from '@tanstack/react-query'

import { fetchUserBooks } from '@src/api/books/userBooks.service'

export const useUserBooks = () => {
  return useQuery({ queryKey: ['userBooks'], queryFn: fetchUserBooks })
}
