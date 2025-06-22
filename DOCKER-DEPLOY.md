# 🚀 Docker 快速部署指南

## 📋 部署方案

### 方案一：Windows 本地部署

1. **安装 Docker Desktop**
   - 下载：https://www.docker.com/products/docker-desktop
   - 安装后启动 Docker Desktop

2. **一键部署**
   ```cmd
   # 在项目目录下运行
   deploy-windows.bat
   ```

3. **访问应用**
   - 浏览器打开：http://localhost

### 方案二：Linux 服务器部署

1. **上传项目文件到服务器**
   ```bash
   # 使用 scp 上传
   scp -r focus-manager/ username@your-server-ip:/tmp/
   
   # 或使用 git
   git clone https://github.com/yourusername/focus-manager.git
   ```

2. **一键部署**
   ```bash
   # 进入项目目录
   cd focus-manager
   
   # 设置执行权限
   chmod +x deploy-server.sh manage.sh
   
   # 运行部署脚本
   sudo bash deploy-server.sh
   ```

3. **访问应用**
   - 本地：http://localhost
   - 外网：http://your-server-ip

## 🔧 管理命令

### 日常管理
```bash
# 查看服务状态
./manage.sh status

# 启动服务
./manage.sh start

# 停止服务
./manage.sh stop

# 重启服务
./manage.sh restart

# 查看实时日志
./manage.sh logs

# 实时监控
./manage.sh monitor
```

### 维护操作
```bash
# 更新应用
./manage.sh update

# 备份数据
./manage.sh backup

# 清理无用镜像
./manage.sh cleanup
```

### Docker Compose 命令
```bash
# 基本操作
docker-compose up -d        # 启动服务
docker-compose down         # 停止服务
docker-compose restart      # 重启服务
docker-compose ps           # 查看状态
docker-compose logs -f      # 查看日志

# 构建相关
docker-compose build        # 构建镜像
docker-compose pull         # 拉取镜像
docker-compose up --build   # 重新构建并启动
```

## 🌐 SSL/HTTPS 配置（可选）

1. **准备 SSL 证书**
   ```bash
   mkdir -p ssl/certs
   # 将证书文件放入 ssl/certs/ 目录
   # - your-domain.crt (证书文件)
   # - your-domain.key (私钥文件)
   ```

2. **配置 SSL 代理**
   ```bash
   # 创建 SSL 配置文件
   cp docker/nginx.conf ssl/nginx-ssl.conf
   # 编辑配置文件，添加 SSL 设置
   ```

3. **启用 HTTPS**
   ```bash
   docker-compose --profile ssl up -d
   ```

## 📊 监控和日志

### 查看容器状态
```bash
docker ps                          # 查看运行中的容器
docker stats focus-manager         # 查看资源使用
docker logs focus-manager          # 查看容器日志
```

### 访问日志
```bash
# 查看访问日志
tail -f logs/access.log

# 查看错误日志
tail -f logs/error.log

# 分析访问统计
cat logs/access.log | awk '{print $1}' | sort | uniq -c | sort -nr
```

## 🔒 安全建议

1. **防火墙设置**
   ```bash
   # 只开放必要端口
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

2. **定期更新**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 更新应用
   ./manage.sh update
   ```

3. **监控告警**
   - 设置服务监控
   - 配置日志轮转
   - 定期备份数据

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tulnp | grep :80
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "8080:80"  # 改为其他端口
   ```

2. **容器启动失败**
   ```bash
   # 查看详细错误
   docker-compose logs focus-manager
   
   # 重新构建
   docker-compose build --no-cache
   ```

3. **权限问题**
   ```bash
   # 检查文件权限
   ls -la
   
   # 设置正确权限
   chmod +x *.sh
   ```

## 🎯 性能优化

1. **资源限制**
   - 在 docker-compose.yml 中已配置资源限制
   - 根据服务器性能调整 CPU 和内存限制

2. **缓存优化**
   - Nginx 配置已启用静态文件缓存
   - 启用 Gzip 压缩减少传输大小

3. **网络优化**
   - 使用 CDN 加速访问
   - 配置负载均衡（如需要）

---

**部署完成后，您的90分钟专注管理器就可以在任何设备上访问了！** 🎉
