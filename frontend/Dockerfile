# Bước 1: Build ứng dụng React với Node.js
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Bước 2: Dùng Nginx để phục vụ các file tĩnh và làm Reverse Proxy
FROM nginx:stable-alpine

# 1. Copy file cấu hình Nginx riêng của bạn vào (DÒNG QUAN TRỌNG NHẤT)
# File này sẽ chứa các đoạn "location /api/auth/" để điều hướng sang Backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy các file từ bước build sang
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]