# Buggies Flasher Frontend 🖥️

## Overview

Buggies Flasher Frontend is the web-based interface for managing and flashing firmware onto ESP32 devices. It provides an intuitive UI for authentication, firmware selection, and device interaction. The frontend is built with **modern web technologies**, ensuring performance, scalability, and maintainability while integrating seamlessly with the backend API.

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
buggies-flasher/
│── public/                   # Static assets
│── src/
│   ├── api/                   # API services (Auth, Firmware, Device)
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Main application pages
│   ├── styles/                # Global styles (SCSS)
│   ├── tests/                 # Unit & integration tests
│   ├── mocks/                 # Mock API with MSW
│   ├── translations/          # Multi-language support
│── .github/workflows/         # CI/CD pipeline config
│── .eslintrc.js               # ESLint configuration
│── .prettierrc                # Prettier configuration
│── .stylelintrc.js            # Stylelint configuration
│── Dockerfile                 # Containerization for deployment
│── docker-compose.yml         # Multi-service orchestration
│── rsbuild.config.ts          # RSBuild configuration
│── README.md                  # Documentation
```

## Roadmap 📌

### **Minimum Viable Product (MVP)**

#### **Core Features**
- [ ] Set up project structure & dependencies  
- [ ] Implement authentication (JWT-based)  
- [ ] Create Drag & Drop firmware flashing UI  
- [ ] Implement automatic firmware download from backend  
- [ ] Add WebSocket support for live device status updates  
- [ ] Implement API mocking with MSW for local development  
- [ ] CI/CD pipeline for testing & deployment  
- [ ] Finalize UI/UX improvements for better accessibility  
- [ ] Implement multi-language support  
- [ ] Optimize frontend build for faster performance  

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

