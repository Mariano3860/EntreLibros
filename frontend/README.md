# 📚 EntreLibros Frontend

Aplicación web en **React 19 + TypeScript** para la plataforma colaborativa de intercambio de libros _EntreLibros_. El proyecto utiliza **Rsbuild** como bundler, **React Router** para las rutas, **TanStack Query** para el manejo de datos remotos e **i18next** para internacionalización.

---

## 🚀 Requisitos

- [Node.js](https://nodejs.org/) 22.19.0
- [npm](https://www.npmjs.com/) (incluido con Node)

---

## 🛠️ Instalación y puesta en marcha

```bash
git clone https://github.com/tu-usuario/entreLibros_frontend.git
cd entreLibros_frontend
npm install

# variables de entorno (opcional; /api y mocks desactivados son los defaults)
cp .env.example .env.local

# levantar el servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://localhost:3000`. De forma predeterminada
consume `/api` en el mismo origen y no habilita MSW. Para un backend en otro
origen, crea `.env.local` con
`PUBLIC_API_BASE_URL=http://localhost:4000/api`. Los mocks solo se activan de
forma explícita con `PUBLIC_API_USE_MOCKS=true`.

---

## 📦 Scripts disponibles

| Comando                  | Descripción                                          |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Inicia el entorno de desarrollo con recarga en vivo. |
| `npm run start`          | Sirve la aplicación ya construida.                   |
| `npm run build`          | Genera la build de producción en `dist/`.            |
| `npm test`               | Ejecuta las pruebas con Vitest una sola vez.         |
| `npm run test:watch`     | Ejecuta las pruebas en modo watch.                   |
| `npm run lint`           | Analiza el código con ESLint.                        |
| `npm run stylelint`      | Revisa estilos SCSS/CSS.                             |
| `npm run format`         | Verifica el formateo con Prettier.                   |
| `npm run typecheck`      | Comprueba tipos con TypeScript.                      |
| `npm run complete-check` | Ejecuta todos los chequeos anteriores en secuencia.  |

---

## 📂 Estructura del proyecto

```text
entreLibros_frontend/
├── public/            # Archivos estáticos
├── src/
│   ├── api/           # Cliente HTTP y servicios
│   ├── assets/        # Recursos (iconos, traducciones, etc.)
│   ├── components/    # Componentes reutilizables
│   ├── constants/     # Constantes compartidas
│   ├── contexts/      # Contextos de React (tema, etc.)
│   ├── hooks/         # Hooks personalizados
│   ├── pages/         # Páginas asociadas a rutas
│   ├── routes/        # Configuración de rutas
│   └── shared/        # Estilos globales y tipos
├── mocks/             # Handlers de MSW para APIs simuladas
├── tests/             # Pruebas con Vitest y Testing Library
├── rsbuild.config.ts  # Configuración de Rsbuild
└── vitest.config.ts   # Configuración de pruebas
```

---

## 🔧 Variables de entorno

Las variables se pueden definir en archivos `.env.*`:

- `PUBLIC_API_BASE_URL`: base de API; usa `/api` por defecto y conserva ese
  prefijo en overrides cross-origin.
- `PUBLIC_API_USE_MOCKS`: activa MSW solo con `true`.
- `PUBLIC_MSW_FORCE_AUTH`: controla la sesión simulada (`auto`, `logged-in`,
  `logged-out`) cuando MSW está activo.

---

## 🧪 Pruebas

Las pruebas se ejecutan con [Vitest](https://vitest.dev/) y [Testing Library](https://testing-library.com/).

```bash
npm test          # ejecutar todas las pruebas una vez
npm run test:ui   # interfaz interactiva de Vitest
```

## 📡 API

Las llamadas al backend disponibles se encuentran documentadas en [docs/backend-calls.md](docs/backend-calls.md).

---

## 🧩 Tecnologías clave

- **React 19** + **TypeScript**
- **Rsbuild** (bundler)
- **TanStack Query**
- **React Router**
- **SCSS modules** con theming claro/oscuro
- **i18next** para traducciones
- **MSW** para mock de API
- **Vitest** + **Testing Library**

---

## 🐳 Docker (opcional)

Este repositorio incluye un `Dockerfile` y un `docker-compose.yml` de ejemplo para levantar el frontend junto a un backend compatible.

```bash
docker-compose up --build
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Abre un _issue_ o envía un _pull request_ con tus mejoras o correcciones.

---

## 📄 Licencia

La licencia definitiva del proyecto se definirá en etapas posteriores.
