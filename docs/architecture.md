# Arquitectura del Frontend

Este documento describe cómo está organizado el proyecto y las tecnologías clave que utiliza.

## Stack principal

- **React 19** y **TypeScript** para el desarrollo de la interfaz.
- **Rsbuild** como bundler y herramienta de desarrollo.
- **React Router** para la navegación entre páginas.
- **TanStack Query** para la gestión de datos remotos y caché.
- **i18next** para internacionalización.
- **SCSS Modules** con soporte de temas claro/oscuro.
- **MSW** para simular la API durante el desarrollo.

## Cliente HTTP

Las peticiones al backend se realizan mediante `axios` configurado en `src/api/axios.ts`. Todas las rutas relativas se centralizan en `src/api/routes.ts` para facilitar su mantenimiento.

## Estructura de carpetas

```text
src/
├── api/            # Servicios y tipos de la API
├── assets/         # Recursos estáticos (iconos, traducciones, etc.)
├── components/     # Componentes reutilizables
├── constants/      # Constantes compartidas
├── contexts/       # Contextos de React
├── hooks/          # Hooks personalizados
├── pages/          # Páginas asociadas a rutas
├── routes/         # Configuración de rutas
└── shared/         # Estilos globales y tipos comunes
```

## Pruebas

Las pruebas se ejecutan con **Vitest** y **Testing Library**. Para ejecutar toda la suite:

```bash
npm test
```

## Estilos y theming

Los estilos se escriben en archivos SCSS con módulos. El tema (claro u oscuro) se controla mediante contextos de React y variables CSS.

## Mock de API

Durante el desarrollo se utiliza **MSW** para interceptar las solicitudes y devolver respuestas simuladas. Esto permite trabajar sin depender de un backend real y facilita el desarrollo paralelo del servidor.
