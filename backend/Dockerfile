# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
RUN npm ci --workspace backend
COPY backend ./backend
RUN npm run build -w backend

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
RUN npm ci --omit=dev --workspace backend
COPY --from=builder /app/backend/dist ./backend/dist
CMD ["node", "backend/dist/index.js"]
