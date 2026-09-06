# ==========================================
# 办公助手 - 多阶段生产环境 Docker 构建文件
# ==========================================

# 阶段 1: 依赖安装与前端生产构建
FROM node:20-alpine AS builder
WORKDIR /app

# 优先复制依赖声明文件以利用 Docker 缓存层
COPY package*.json ./
RUN npm install

# 复制工程源码并构建
COPY . .
RUN npm run build

# 阶段 2: 轻量级 Alpine Nginx 镜像部署
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# 清除 Nginx 默认初始文件
RUN rm -rf ./*

# 从 builder 阶段复制打包产物 dist
COPY --from=builder /app/dist .

# 复制定制化 SPA 路由及 Gzip 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露标准 HTTP 服务端口
EXPOSE 80

# 容器健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
