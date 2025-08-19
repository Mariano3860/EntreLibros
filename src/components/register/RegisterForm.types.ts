export type RegisterFormProps = {
  onSubmit?: (data: unknown) => void
}

export type FormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}
