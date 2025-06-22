# Linux 服务器部署指南

## 🖥️ 系统要求

- Ubuntu 18.04+ 或 CentOS 7+
- 至少 1GB RAM
- 至少 10GB 可用磁盘空间
- Root 或 sudo 权限

## 🚀 快速部署（推荐）

### 步骤 1：上传项目文件

#### 方式一：SCP 上传（推荐）

在您的本地电脑上，打开 PowerShell 或命令提示符，进入项目目录：

```powershell
# 打包项目文件
tar -czf focus-manager.tar.gz *

# 上传到服务器
scp focus-manager.tar.gz username@your-server-ip:/tmp/

# 或者直接上传整个目录
scp -r . username@your-server-ip:/tmp/focus-manager/
```

#### 方式二：Git 克隆（如果项目在 Git 仓库中）

```bash
# 在服务器上运行
git clone https://github.com/yourusername/focus-manager.git /tmp/focus-manager
```

#### 方式三：SFTP 客户端

使用 FileZilla、WinSCP 等工具上传整个 focus-manager 文件夹到服务器的 `/tmp/` 目录

### 步骤 2：连接服务器并部署

```bash
# SSH 连接到服务器
ssh username@your-server-ip

# 如果上传了压缩包，先解压
cd /tmp
tar -xzf focus-manager.tar.gz

# 进入项目目录
cd /tmp/focus-manager

# 给部署脚本执行权限
chmod +x deploy-server.sh

# 运行一键部署脚本
sudo ./deploy-server.sh
```

### 步骤 3：等待部署完成

脚本会自动完成以下操作：
- ✅ 更新系统包
- ✅ 安装 Docker 和 Docker Compose
- ✅ 配置防火墙
- ✅ 构建 Docker 镜像
- ✅ 启动服务

## 🎉 部署完成

部署成功后，您会看到类似输出：

```
🎉 部署完成！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 访问地址：
   本地: http://localhost
   外网: http://YOUR_SERVER_IP
```

## 🔧 管理命令

部署完成后，您可以使用以下命令管理服务：

```bash
# 进入项目目录
cd /opt/focus-manager

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

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
```

## 🌐 域名配置（可选）

如果您有域名，可以进行以下配置：

### 1. DNS 设置
在您的域名服务商处添加 A 记录：
```
A记录: yourdomain.com -> YOUR_SERVER_IP
A记录: www.yourdomain.com -> YOUR_SERVER_IP
```

### 2. SSL 证书配置

安装 Certbot 并获取免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 设置自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

## 🛡️ 安全设置

### 1. 防火墙配置

```bash
# 查看防火墙状态
sudo ufw status

# 允许必要端口
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 定期更新

设置自动安全更新：

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## 📊 监控

### 查看系统资源

```bash
# 系统资源使用情况
htop

# 磁盘使用情况
df -h

# Docker 容器资源使用
docker stats

# 查看 Docker 镜像
docker images

# 清理无用的 Docker 资源
docker system prune -f
```

### 日志监控

```bash
# 查看应用日志
tail -f /opt/focus-manager/logs/access.log
tail -f /opt/focus-manager/logs/error.log

# 查看 Docker 日志
docker-compose logs -f focus-manager
```

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 查看 80 端口占用情况
sudo netstat -tlnp | grep :80

# 停止占用端口的服务
sudo systemctl stop apache2  # 如果是 Apache
sudo systemctl stop nginx    # 如果是其他 Nginx
```

#### 2. Docker 服务未启动

```bash
# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 检查 Docker 状态
sudo systemctl status docker
```

#### 3. 权限问题

```bash
# 修复文件权限
sudo chown -R $USER:$USER /opt/focus-manager
sudo chmod -R 755 /opt/focus-manager
```

#### 4. 内存不足

```bash
# 查看内存使用
free -h

# 添加交换空间
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📱 移动端优化

应用已包含 PWA 功能，用户可以：
- 添加到主屏幕
- 离线使用
- 接收推送通知

## 🔄 更新应用

当您有新版本时：

```bash
# 上传新文件到服务器
scp -r . username@your-server-ip:/tmp/focus-manager-new/

# 在服务器上更新
sudo cp -r /tmp/focus-manager-new/* /opt/focus-manager/
cd /opt/focus-manager
sudo docker-compose down
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

## 📞 技术支持

如果遇到问题：

1. 检查防火墙设置
2. 查看 Docker 日志
3. 确认端口没有被占用
4. 检查系统资源使用情况

---

**享受您的 90 分钟专注训练！** 🧠✨
