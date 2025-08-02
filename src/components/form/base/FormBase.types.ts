export type InputType = 'text' | 'email' | 'textarea'

export type FormField = {
  name: string
  label: string
  type: InputType
  required?: boolean
  minLength?: number
  placeholder?: string
}

export interface FormBaseProps {
  fields: FormField[]
  onSubmit: (formData: Record<string, string>) => void
  submitLabel?: string
  isSubmitting?: boolean
}
