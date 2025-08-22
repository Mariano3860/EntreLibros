# Form Components

Este documento describe los componentes de formularios reutilizables dentro de la aplicación **EntreLibros**.

## FormBase

Componente genérico que renderiza campos de formulario a partir de una definición declarativa. Su implementación se encuentra en `src/components/forms/base/FormBase.tsx`.

### Props principales

- `fields`: arreglo de objetos `FormField` que define los campos a mostrar.
- `onSubmit(formData)`: función llamada cuando el formulario pasa las validaciones.
- `submitLabel`: clave de traducción opcional para el texto del botón.
- `isSubmitting`: deshabilita campos y botón durante el envío.

### Validaciones

- Campos requeridos.
- Formato de correo usando la expresión regular `EMAIL_REGEX`.
- Longitud mínima especificada en cada campo.

### API imperativa

El componente expone el método `resetForm` mediante una `ref` para limpiar valores y errores.

```tsx
const formRef = useRef<FormBaseRef>(null)

<FormBase
  ref={formRef}
  fields={fields}
  onSubmit={handleSubmit}
/>

// Para reiniciar el formulario
formRef.current?.resetForm()
```

## ContactForm

Ejemplo de uso que extiende `FormBase` con campos específicos para la página de contacto. Se encuentra en `src/components/forms/contact/ContactForm.tsx`.
