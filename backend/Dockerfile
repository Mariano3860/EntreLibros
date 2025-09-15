FROM node:24 AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend ./backend
RUN npm ci --workspace=backend
RUN npm run build -w backend

FROM node:24
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace=backend
COPY --from=build /app/backend/dist ./backend/dist
CMD ["node", "backend/dist/index.js"]
