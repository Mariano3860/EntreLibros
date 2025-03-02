export type LoginCredentials = {
  email: string
  password: string
}

export type LoginFormProps = {
  onSubmit: (credentials: LoginCredentials) => void
  isLoading?: boolean
  errorMessage?: string
}
