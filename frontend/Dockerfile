FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
RUN npm ci -w frontend
COPY frontend frontend
RUN npm run build -w frontend

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

