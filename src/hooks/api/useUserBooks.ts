import { fetchUserBooks } from '@api/books/userBooks.service'
import { useQuery } from '@tanstack/react-query'

export const useUserBooks = () => {
  return useQuery({ queryKey: ['userBooks'], queryFn: fetchUserBooks })
}
