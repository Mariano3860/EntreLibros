/**
 * Tipos relacionados con el formulario de contacto.
 * TODO: agregar validaciones más estrictas para los campos.
 */
export type ContactFormData = {
  name: string
  email: string
  message: string
}

export type ContactFormMessage = {
  id: number
  name: string
  email: string
  message: string
  createdAt: string
  updatedAt: string
}

export type ContactFormResponse = {
  message: string
  contact: ContactFormMessage
}
