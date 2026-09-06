# 「办公助手」Docker 云端部署与运维手册

本文档指导如何将「办公助手」多角色协同工作台打包为 Docker 容器，并部署在各大公有云平台（阿里云 ECS、腾讯云 CVM、华为云、各类 Linux VPS）上运行。

---

## 目录
1. [前置环境准备](#1-前置环境准备)
2. [快速启动（Docker Compose 推荐）](#2-快速启动docker-compose-推荐)
3. [单 Docker 命令构建与运行](#3-单-docker-命令构建与运行)
4. [公有云生产环境最佳实践 (域名 + SSL HTTPS)](#4-公有云生产环境最佳实践)
5. [常见问题排查与容器运维](#5-常见问题排查与容器运维)

---

## 1. 前置环境准备

在您的云端服务器（CentOS / Ubuntu / Debian / openEuler / Alpine）上安装 Docker 与 Docker Compose：

### Ubuntu / Debian 一键安装示例：
```bash
# 更新软件包
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# 自动化脚本安装 Docker CE
curl -fsSL https://get.docker.com | bash -s docker

# 启动 Docker 并设置开机自启
sudo systemctl enable --now docker

# 验证 Docker 安装
docker --version
docker compose version
```

---

## 2. 快速启动（Docker Compose 推荐）

代码根目录已包含开箱即用的 `docker-compose.yml`、`Dockerfile` 与 `nginx.conf`。

### 第一步：克隆代码或上传项目压缩包到服务器
```bash
# 将项目上传至服务器目录，例如 /data/apps/office-assistant
cd /data/apps/office-assistant
```

### 第二步：一键构建并启动容器
```bash
# 后台构建并启动
docker compose up -d --build
```

### 第三步：检查运行状态
```bash
docker compose ps
docker compose logs -f office-assistant
```

此时即可在浏览器中通过 `http://<您的服务器公网IP>:8080` 访问办公助手！

> **提示**：如需直接使用 80 端口（浏览器默认端口免输端口号），只需在 `docker-compose.yml` 中将 `"8080:80"` 改为 `"80:80"` 即可。

---

## 3. 单 Docker 命令构建与运行

如果您不使用 Docker Compose，可以直接使用原生 Docker 命令：

### 1. 构建镜像
```bash
docker build -t office-assistant:latest .
```

### 2. 运行容器
```bash
docker run -d \
  --name office_assistant_app \
  --restart always \
  -p 8080:80 \
  office-assistant:latest
```

### 3. 查看运行容器
```bash
docker ps
```

---

## 4. 公有云生产环境最佳实践 (域名 + SSL HTTPS)

在生产环境中，通常配合云服务器外部的 Nginx 反向代理绑定域名，并配置免费 SSL 证书（如 Let's Encrypt）：

### 主机 Nginx 反向代理配置示例 (`/etc/nginx/conf.d/office.conf`)：
```nginx
server {
    listen 80;
    server_name oa.yourcompany.com;

    # 强制跳转 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name oa.yourcompany.com;

    # SSL 证书文件路径 (可通过 certbot 自动申请)
    ssl_certificate /etc/letsencrypt/live/oa.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oa.yourcompany.com/privkey.pem;

    # 推荐 SSL 安全参数
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 反向代理至 Docker 容器
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 支持 WebSocket 与长连接
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 申请免费 SSL 证书：
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d oa.yourcompany.com
```

---

## 5. 常见问题排查与容器运维

### Q1：页面打开提示 404 或白屏？
**原因**：单页应用（SPA）必须配置路由回退。
**解决**：本项目的 `nginx.conf` 已默认配置 `try_files $uri $uri/ /index.html;`，如自定义宿主机 Nginx，请确认代理转发完整。

### Q2：云服务器无法通过公网访问？
**排查步骤**：
1. 检查云厂商（阿里云 / 腾讯云 / 华为云）控制台的 **安全组规则 (Security Group)**，确认是否放行了入方向的 `8080`、`80` 或 `443` 端口；
2. 检查服务器内部防火墙：
   ```bash
   # Ubuntu UFW:
   sudo ufw allow 8080/tcp
   # CentOS Firewalld:
   sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent && sudo firewall-cmd --reload
   ```

### Q3：版本更新与重新部署命令：
```bash
# 1. 拉取最新源码
git pull

# 2. 重新编译镜像并热重启容器
docker compose up -d --build
```

### Q4：容器数据持久性说明：
本平台采用跨端高效的 Web 离线高可用存储方案（用户设置、工作流待办、协同申请与系统品牌），所有修改均在客户端与浏览器环境双向持久化，无需繁琐挂载外部 SQL 数据库即可开箱即用。
