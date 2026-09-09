# EntreLibros

EntreLibros es una plataforma colaborativa para publicar, descubrir e
intercambiar libros, encontrar Rincones y coordinar acuerdos mediante
mensajería privada.

## Empezar a estudiar

- [Tour del proyecto](docs/project-tour.md)
- [Arquitectura](docs/architecture.md)
- [Modelo de dominio](docs/domain-model.md)
- [Mapa de cambios](docs/change-map.md)

## Stack

React/Rsbuild, TypeScript, Express, Socket.IO, PostgreSQL/PostGIS, Docker y
Playwright. La aplicación en ejecución usa siempre la API y Socket.IO reales;
MSW queda aislado al arnés de tests.

## Ejecutar y verificar

```bash
npm install
npm run migrate
npm run seed:local
npm run seed:local:verify
npm run dev
npm run test:backend
npm run test:frontend
npm run typecheck:backend
npm run typecheck:frontend
npm run build:backend
npm run build:frontend
npm run verify:e2e
```

Para poblar el recorrido local de defensa, usa `npm run seed:local`; para
retirarlo sin tocar otros datos, usa `npm run seed:local:cleanup`. Consulta
[Testing](docs/testing.md), [Local dataset](docs/local-dataset.md) y
[Deployment and Operation](docs/deployment-and-operation.md) para límites y
prerrequisitos de cada verificación.
