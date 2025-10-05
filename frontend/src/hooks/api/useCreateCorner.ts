import { createCorner } from '@api/community/corners.service'
import {
  PublishCornerPayload,
  PublishCornerResponse,
} from '@api/community/corners.types'
import { mapKeys } from '@api/map/mapApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useCreateCorner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PublishCornerPayload) => createCorner(payload),
    onSuccess: (data: PublishCornerResponse) => {
      void queryClient.invalidateQueries({ queryKey: mapKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['community', 'corners'] })
      return data
    },
  })
}
