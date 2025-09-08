FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend ./backend
RUN npm ci --workspace=backend
RUN npm run build -w backend

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace=backend
COPY --from=build /app/backend/dist ./backend/dist
CMD ["node", "backend/dist/index.js"]
