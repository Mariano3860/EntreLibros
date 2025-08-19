declare module '*.module.scss' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.json' {
  const value: Record<string, string>
  export default value
}

declare module '*.svg' {
  import React from 'react'
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
  const src: string
  export default src
}

// Variables de entorno públicas expuestas por Rsbuild (lado del cliente)
// TODO: revisar otras variables públicas necesarias y evaluar si se pueden usar types
declare interface ImportMetaEnv {
  readonly PUBLIC_MSW_FORCE_AUTH?: 'auto' | 'logged-in' | 'logged-out'
  readonly PUBLIC_API_BASE_URL?: string
}
declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
