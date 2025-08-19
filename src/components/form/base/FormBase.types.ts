/**
 * Tipos base para formularios reutilizables.
 * TODO: admitir más tipos de campos y validaciones.
 */
export type InputType = 'text' | 'email' | 'textarea'

export type FormField = {
  name: string
  label: string
  type: InputType
  required?: boolean
  minLength?: number
  placeholder?: string
}

export type FormBaseProps = {
  fields: FormField[]
  onSubmit: (formData: Record<string, string>) => void
  submitLabel?: string
  isSubmitting?: boolean
}

export type FormBaseRef = {
  resetForm: () => void
}
