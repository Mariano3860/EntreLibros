# Buggies Frontend 🖥️

## Overview

Buggies Frontend is the web-based interface for managing and flashing firmware onto ESP32 devices. It provides an
intuitive UI for authentication, firmware selection, and device interaction. The frontend is built with **modern web
technologies**, ensuring performance, scalability, and maintainability while integrating seamlessly with the backend
API.

## Features

✅ User authentication with JWT & secure session handling  
✅ Two firmware flashing methods: Drag & Drop or automatic update from backend  
✅ Device status monitoring via WebSockets  
✅ Progressive Web App (PWA) for offline support  
✅ Multi-language support (English & Spanish)  
✅ Dark mode & accessibility features  
✅ CI/CD automation for testing & deployments  
✅ Mock API support for local development using MSW  
✅ Responsive UI designed with modern UX principles

## Technologies Used

| Technology                         | Purpose                                             |
| ---------------------------------- | --------------------------------------------------- |
| **React 18 + TypeScript**          | Frontend framework with strong typing & scalability |
| **RSBuild**                        | Ultra-fast bundler for optimized builds             |
| **TanStack Query + Axios**         | Efficient state & API data management               |
| **ESLint, Prettier, Stylelint**    | Code formatting & linting for quality assurance     |
| **SASS (SCSS)**                    | Scalable styling with theme support                 |
| **Vitest + React Testing Library** | Unit & integration testing                          |
| **Mock Service Worker (MSW)**      | API mocking for seamless local development          |
| **Nginx + Docker**                 | Production-ready static file serving                |
| **GitHub Actions**                 | CI/CD automation for builds & deployments           |

## Project Structure 🏗

```
buggies-frontend/
│── public/                     # Static assets (icons, manifest, images, etc.)
│   ├── index.html               # Root HTML file
│   ├── favicon.ico              # Favicon for the app
│   ├── manifest.json            # PWA support
│   ├── robots.txt               # SEO rules
│── src/                         # Source code
│   ├── api/                     # API services (Auth, Firmware, Device)
│   ├── assets/                  # Static assets (SVGs, fonts, etc.)
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Buttons, modals, loaders, etc.
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components (Navbar, Sidebar)
│   ├── context/                 # Global state management (React Context)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries (fetch, storage, helpers)
│   ├── pages/                   # Main application pages
│   │   ├── Home.tsx             # Landing page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Auth.tsx             # Login & Signup pages
│   │   ├── Firmware.tsx         # Firmware flashing UI
│   │   ├── NotFound.tsx         # 404 Page
│   ├── routes/                  # React Router configuration
│   ├── services/                # API service integrations
│   ├── state/                   # State management (if using Redux/Zustand)
│   ├── styles/                  # Global styles (SCSS)
│   ├── translations/            # Multi-language support (i18n JSON)
│   ├── types/                   # TypeScript interfaces & types
│   ├── utils/                   # Helper functions
│   ├── App.tsx                  # Main app component
│   ├── index.tsx                 # App entry point
│── tests/                       # Unit & integration tests
│   ├── components/              # Tests for components
│   ├── pages/                   # Tests for pages
│   ├── api/                     # Tests for API requests
│── mocks/                       # Mock API with MSW
│── .github/                     # GitHub Configurations
│   ├── workflows/               # CI/CD pipeline config
│   │   ├── ci.yml               # Runs tests & linting on PRs
│   │   ├── build.yml            # Build process for deployments
│   │   ├── dependabot-auto-merge.yml  # Auto-merge Dependabot updates
│   ├── dependabot.yml           # Dependabot config for dependencies
│── .vscode/                     # VSCode settings (optional)S
│   ├── settings.json            # Workspace settings
│   ├── extensions.json          # Recommended extensions
│── config/                      # Configuration files
│   ├── env/                     # Environment variables
│   │   ├── .env.development     # Dev environment variables
│   │   ├── .env.production      # Production environment variables
│── .eslintrc.js                 # ESLint configuration
│── .prettierrc                  # Prettier configuration
│── .stylelintrc.js              # Stylelint configuration
│── .gitignore                   # Git ignore rules
│── Dockerfile                   # Containerization for deployment
│── docker-compose.yml           # Multi-service orchestration
│── rsbuild.config.ts            # RSBuild configuration
│── vitest.config.ts             # Vitest configuration
│── tsconfig.json                # TypeScript configuration
│── package.json                 # Project dependencies
│── README.md                    # Documentation
```

## Roadmap 📌

### **Minimum Viable Product (MVP)**

#### **Core Features**

- [x] Set up project structure & dependencies
- [ ] Create Drag & Drop firmware flashing UI
- [ ] Implement API mocking with MSW for local development
- [ ] Implement authentication (JWT-based)
- [ ] CI/CD pipeline for testing & deployment
- [ ] Implement automatic firmware download from backend
- [ ] Add WebSocket support for live device status updates
- [ ] Implement multi-language support

### **Future Enhancements**

#### **Security & Authentication**

- [ ] OAuth2 & social login support
- [ ] Two-factor authentication (2FA)
- [ ] Session management improvements

#### **Performance & Optimization**

- [ ] Implement service worker caching for PWA support
- [ ] Add GraphQL support for flexible API queries
- [ ] Optimize WebSocket connection handling
- [ ] Implement lazy loading for large assets

#### **Additional Features**

- [ ] Dark mode toggle & theme customization
- [ ] Admin dashboard for firmware & user management
- [ ] Device analytics & logs visualization
- [ ] Enhanced accessibility features (keyboard navigation, high contrast mode)

## Contribution Guidelines 🤝

1. Fork the repository & create a feature branch.
2. Follow the coding style & commit guidelines.
3. Submit a PR & wait for review.

## License 📜

Not yet.

---

🚀 **Ready to get started? Follow the setup guide and start contributing!**
