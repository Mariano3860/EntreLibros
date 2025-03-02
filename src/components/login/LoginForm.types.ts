import { LoginResponse } from '@/api/auth/login.types'

export type LoginFormProps = {
  onSubmit: (credentials: LoginResponse) => void
  isLoading?: boolean
  errorMessage?: string
}
