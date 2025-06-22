# Docker部署指南

## 🐳 使用Docker部署90分钟专注管理器

### 前置要求

- Ubuntu 18.04+ 或其他Linux发行版
- Docker 和 Docker Compose

### 安装Docker

```bash
# 更新包列表
sudo apt update

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker
```

## 🚀 部署方式

### 方式1：使用Docker Compose（推荐）

```bash
# 上传项目文件到服务器
scp -r focus-manager/ username@your-server-ip:/opt/

# SSH连接到服务器
ssh username@your-server-ip

# 进入项目目录
cd /opt/focus-manager

# 构建并启动服务
docker-compose up -d

# 查看运行状态
docker-compose ps
```

### 方式2：使用Docker命令

```bash
# 构建镜像
docker build -t focus-manager .

# 运行容器
docker run -d \
  --name focus-manager \
  -p 80:80 \
  --restart unless-stopped \
  focus-manager

# 查看容器状态
docker ps
```

## 🔐 HTTPS配置

### 1. 准备SSL证书

```bash
# 创建SSL目录
mkdir -p ssl/certs

# 将证书文件放入ssl/certs/目录
# - your-domain.crt (证书文件)
# - your-domain.key (私钥文件)
```

### 2. 配置SSL代理

创建 `ssl/nginx-ssl.conf`：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/certs/your-domain.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://focus-manager;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. 启用HTTPS

```bash
# 使用SSL配置启动
docker-compose --profile ssl up -d
```

## 📊 管理命令

```bash
# 查看日志
docker-compose logs -f focus-manager

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新应用
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 备份数据
docker run --rm -v focus-manager_logs:/backup ubuntu tar czf /backup/logs-$(date +%Y%m%d).tar.gz /backup

# 清理旧镜像
docker image prune -f
```

## 🔧 自定义配置

### 修改端口

在 `docker-compose.yml` 中修改：

```yaml
ports:
  - "8080:80"  # 将80改为8080或其他端口
```

### 添加环境变量

```yaml
environment:
  - TZ=Asia/Shanghai
  - NGINX_WORKER_PROCESSES=auto
  - NGINX_WORKER_CONNECTIONS=1024
```

### 持久化日志

```yaml
volumes:
  - ./logs:/var/log/nginx
  - ./access-logs:/var/log/nginx/access.log
```

## 🛡️ 安全建议

### 1. 网络隔离

```yaml
networks:
  focus-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 2. 资源限制

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### 3. 健康检查

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

## 🚀 生产环境部署

### 完整的docker-compose.yml示例

```yaml
version: '3.8'

services:
  focus-manager:
    build: .
    container_name: focus-manager
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/nginx
    environment:
      - TZ=Asia/Shanghai
    networks:
      - focus-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  nginx-proxy:
    image: nginx:alpine
    container_name: focus-manager-proxy
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl/certs:/etc/ssl/certs
      - ./logs:/var/log/nginx
    depends_on:
      - focus-manager
    networks:
      - focus-network

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_SCHEDULE=0 2 * * *

networks:
  focus-network:
    driver: bridge
```

## 📋 部署检查清单

- [ ] Docker和Docker Compose已安装
- [ ] 项目文件已上传到服务器
- [ ] 防火墙已配置（开放80/443端口）
- [ ] 域名DNS已指向服务器IP
- [ ] SSL证书已准备（如需要）
- [ ] 容器运行正常
- [ ] 网站可正常访问
- [ ] 移动端PWA功能正常
- [ ] 日志轮转已配置
- [ ] 监控已设置

## 🎯 优势

Docker部署的优势：

1. **环境一致性** - 开发和生产环境完全一致
2. **快速部署** - 一键启动所有服务
3. **易于扩展** - 可以轻松添加负载均衡、缓存等
4. **版本控制** - 可以快速回滚到之前的版本
5. **资源隔离** - 不会影响宿主机其他服务

---

**使用Docker，您可以在几分钟内完成专注管理器的部署！** 🐳✨
