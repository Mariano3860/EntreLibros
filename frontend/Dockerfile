FROM node:24 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci -w frontend
COPY frontend frontend
RUN npm run build -w frontend

FROM node:24 AS runner
WORKDIR /app
RUN npm install -g serve@14.2.1
COPY --from=builder /app/frontend/dist ./dist
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]

