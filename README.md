# 📚 EntreLibros Frontend

**EntreLibros** es una plataforma web colaborativa para el intercambio de libros físicos entre personas reales, potenciando la lectura libre mediante geolocalización, reseñas, catálogos personales y conexión social.

Este repositorio contiene el código del frontend desarrollado con **React + Vite + TypeScript**, enfocado en una interfaz limpia, moderna, y con fuerte énfasis en la experiencia de usuario.

---

## 🧭 Visión

EntreLibros busca ser el puente entre el mundo físico de los libros y las herramientas digitales modernas. A través de un mapa interactivo y una comunidad conectada por intereses literarios, la app permite descubrir casitas de intercambio, gestionar tu biblioteca, dejar reseñas y coordinar intercambios directos.

---

## ✨ Funcionalidades principales

✅ Registro y login de usuarios
✅ Geolocalización de casitas de intercambio
✅ Catálogo personal de libros para compartir o buscar
✅ Sistema de reseñas y puntuación
✅ Perfil de usuario con afinidades lectoras
✅ Recomendaciones de usuarios cercanos con gustos similares
✅ Chat entre usuarios que se siguen (premium: iniciar sin aceptación)
✅ Modo claro/oscuro y diseño responsive
✅ Internacionalización (i18n) y accesibilidad básica

---

## 🛠️ Tecnologías utilizadas

| Tecnología                    | Uso principal                                 |
| ----------------------------- | --------------------------------------------- |
| **React + Vite**              | Frontend rápido y modular                     |
| **TypeScript**                | Tipado estricto y mantenibilidad              |
| **TanStack Query**            | Manejo eficiente de datos remotos             |
| **Zustand o Context API**     | Estado global ligero (dependiendo de versión) |
| **React Router**              | Navegación declarativa                        |
| **Vitest + Testing Library**  | Testing unitario e integración                |
| **Mock Service Worker (MSW)** | Mock de API local                             |
| **SCSS**                      | Estilos escalables con soporte de theming     |
| **i18next**                   | Internacionalización                          |
| **GitHub Actions**            | CI/CD y automatización de builds/tests        |

---

## 🏗 Estructura del proyecto

```
entreLibros_frontend/
│── public/                 # Archivos estáticos (index.html, manifest, íconos)
│── src/
│   ├── api/                # Integración con servicios REST
│   ├── assets/             # Imágenes, íconos, fuentes
│   ├── components/         # Componentes reutilizables
│   ├── features/           # Módulos funcionales (auth, books, map, etc.)
│   ├── hooks/              # Hooks personalizados
│   ├── pages/              # Rutas principales (Login, Perfil, Casita, etc.)
│   ├── routes/             # Configuración de rutas
│   ├── styles/             # Estilos globales y variables SCSS
│   ├── translations/       # Archivos de idiomas (JSON)
│   ├── types/              # Tipos globales de TypeScript
│   ├── App.tsx             # Componente raíz
│   └── main.tsx            # Entry point de la app
│── tests/                  # Pruebas automatizadas
│── .github/                # Configuración de workflows CI/CD
│── .env.*                  # Variables de entorno por ambiente
│── Dockerfile              # Configuración para despliegue
│── vitest.config.ts        # Configuración de testing
│── tsconfig.json           # Configuración de TypeScript
│── package.json            # Dependencias y scripts
```

---

## 🚧 Roadmap (MVP)

* [x] Setup de proyecto y dependencias básicas
* [ ] Mapa interactivo de casitas
* [ ] Registro/Login + gestión de perfil
* [ ] Catálogo personal (libros ofrecidos y deseados)
* [ ] Sistema de reseñas
* [ ] Matching de usuarios por afinidad lectora
* [ ] Chat básico entre usuarios que se siguen
* [ ] Internacionalización (ES/EN)
* [ ] Mock API con MSW
* [ ] Deploy automático con GitHub Actions

---

## 📜 Licencia

Este proyecto está en desarrollo académico. La licencia se definirá en la versión final.

---

## 🤝 Contribución

Este repositorio está gestionado como parte de un proyecto de grado. Pull requests están deshabilitados de momento.