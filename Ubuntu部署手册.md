# 90分钟专注管理器 - Ubuntu服务器部署手册

## 📋 部署概述

本手册将指导您将90分钟专注管理器部署到Ubuntu服务器上，使其可以通过互联网访问。

## 🔧 服务器要求

### 系统要求
- Ubuntu 18.04 LTS 或更高版本
- 至少 1GB RAM
- 至少 10GB 可用磁盘空间
- 网络连接

### 必需软件
- Nginx (Web服务器)
- Let's Encrypt (SSL证书，可选)
- UFW (防火墙，推荐)

## 🚀 部署步骤

### 第一步：连接到服务器

```bash
# 通过SSH连接到您的Ubuntu服务器
ssh username@your-server-ip

# 或者如果使用密钥文件
ssh -i /path/to/your-key.pem username@your-server-ip
```

### 第二步：更新系统

```bash
# 更新包列表
sudo apt update

# 升级系统包
sudo apt upgrade -y

# 安装必要的工具
sudo apt install -y curl wget unzip git
```

### 第三步：安装Nginx

```bash
# 安装Nginx
sudo apt install -y nginx

# 启动Nginx服务
sudo systemctl start nginx

# 设置开机自启
sudo systemctl enable nginx

# 检查Nginx状态
sudo systemctl status nginx
```

### 第四步：配置防火墙

```bash
# 安装并启用UFW防火墙
sudo ufw enable

# 允许SSH连接（重要！）
sudo ufw allow ssh

# 允许HTTP和HTTPS流量
sudo ufw allow 'Nginx Full'

# 检查防火墙状态
sudo ufw status
```

### 第五步：上传项目文件

#### 方法1：使用SCP（推荐）

在您的本地计算机上运行：

```bash
# 打包项目文件
cd /path/to/focus-manager
tar -czf focus-manager.tar.gz *

# 上传到服务器
scp focus-manager.tar.gz username@your-server-ip:/tmp/

# 或者直接上传整个目录
scp -r focus-manager/ username@your-server-ip:/tmp/
```

#### 方法2：使用Git（如果代码在Git仓库中）

```bash
# 在服务器上克隆代码
cd /tmp
git clone https://github.com/yourusername/focus-manager.git
```

#### 方法3：使用SFTP

```bash
# 使用SFTP客户端（如FileZilla）上传文件到服务器
# 目标目录：/tmp/focus-manager/
```

### 第六步：部署文件到Web目录

```bash
# 创建项目目录
sudo mkdir -p /var/www/focus-manager

# 解压或复制文件（如果使用tar包）
cd /tmp
sudo tar -xzf focus-manager.tar.gz -C /var/www/focus-manager/

# 或者复制文件（如果直接上传目录）
sudo cp -r /tmp/focus-manager/* /var/www/focus-manager/

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/focus-manager
sudo chmod -R 755 /var/www/focus-manager
```

### 第七步：配置Nginx虚拟主机

```bash
# 创建Nginx配置文件
sudo nano /etc/nginx/sites-available/focus-manager
```

将以下内容添加到配置文件中：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/focus-manager;
    index index.html;
    
    # 启用Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # 主页面
    location / {
        try_files $uri $uri/ =404;
        
        # 添加安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; font-src 'self' https: data:; img-src 'self' https: data: blob:;" always;
    }
    
    # 缓存静态文件
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 缓存JSON文件
    location ~* \.json$ {
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # 隐藏版本信息
    server_tokens off;
    
    # 错误页面
    error_page 404 /index.html;
}
```

### 第八步：启用站点配置

```bash
# 创建符号链接启用站点
sudo ln -s /etc/nginx/sites-available/focus-manager /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 重新加载Nginx配置
sudo systemctl reload nginx
```

### 第九步：配置域名（如果有域名）

如果您有域名，需要：

1. **配置DNS记录**
   ```
   A记录: your-domain.com -> your-server-ip
   A记录: www.your-domain.com -> your-server-ip
   ```

2. **等待DNS生效**（通常需要几分钟到几小时）

### 第十步：配置SSL证书（推荐）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 验证部署

### 检查服务状态

```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查端口监听
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 检查文件权限
ls -la /var/www/focus-manager/
```

### 测试访问

```bash
# 本地测试
curl -I http://localhost
curl -I http://your-server-ip

# 如果配置了域名
curl -I http://your-domain.com
curl -I https://your-domain.com
```

## 📊 监控和维护

### 查看日志

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

### 性能优化

#### 1. 启用HTTP/2（需要SSL）

在Nginx配置中添加：
```nginx
listen 443 ssl http2;
```

#### 2. 配置缓存

```bash
# 创建缓存目录
sudo mkdir -p /var/cache/nginx/focus-manager

# 在Nginx配置中添加缓存设置
```

#### 3. 压缩优化

已在配置文件中包含Gzip压缩设置。

### 备份策略

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-focus-manager.sh
```

添加以下内容：

```bash
#!/bin/bash
BACKUP_DIR="/backup/focus-manager"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份网站文件
tar -czf $BACKUP_DIR/focus-manager_$DATE.tar.gz -C /var/www focus-manager

# 备份Nginx配置
cp /etc/nginx/sites-available/focus-manager $BACKUP_DIR/nginx_config_$DATE

# 清理旧备份（保留7天）
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "nginx_config_*" -mtime +7 -delete

echo "备份完成: $DATE"
```

```bash
# 设置执行权限
sudo chmod +x /usr/local/bin/backup-focus-manager.sh

# 设置定时备份（每天凌晨2点）
sudo crontab -e
# 添加：0 2 * * * /usr/local/bin/backup-focus-manager.sh
```

## 🐛 故障排除

### 常见问题

#### 1. 403 Forbidden错误
```bash
# 检查文件权限
sudo chown -R www-data:www-data /var/www/focus-manager
sudo chmod -R 755 /var/www/focus-manager
```

#### 2. 502 Bad Gateway错误
```bash
# 重启Nginx
sudo systemctl restart nginx

# 检查配置语法
sudo nginx -t
```

#### 3. SSL证书问题
```bash
# 重新获取证书
sudo certbot --nginx --force-renewal -d your-domain.com
```

#### 4. 防火墙问题
```bash
# 检查防火墙状态
sudo ufw status

# 开放端口
sudo ufw allow 80
sudo ufw allow 443
```

### 调试命令

```bash
# 检查系统资源
top
df -h
free -h

# 检查网络连接
netstat -tulnp
ss -tulnp

# 检查进程
ps aux | grep nginx
```

## 📈 性能优化建议

### 1. 服务器优化

```bash
# 优化系统参数
echo 'net.core.somaxconn = 65535' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv4.tcp_max_tw_buckets = 400000' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Nginx优化

在 `/etc/nginx/nginx.conf` 中优化：

```nginx
worker_processes auto;
worker_connections 1024;

# 启用高效文件传输
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# 优化缓冲区
client_body_buffer_size 128k;
client_max_body_size 10m;
```

### 3. 内容分发网络（CDN）

考虑使用CDN服务如Cloudflare来加速全球访问。

## 🔒 安全建议

### 1. 定期更新

```bash
# 设置自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### 2. 限制访问

```bash
# 限制SSH访问
sudo nano /etc/ssh/sshd_config
# 修改：PermitRootLogin no

# 安装fail2ban防止暴力破解
sudo apt install -y fail2ban
```

### 3. 监控

```bash
# 安装系统监控工具
sudo apt install -y htop iotop
```

## 📞 技术支持

如果遇到问题，请检查：

1. **服务器日志**: `/var/log/nginx/error.log`
2. **系统日志**: `sudo journalctl -xe`
3. **防火墙状态**: `sudo ufw status`
4. **服务状态**: `sudo systemctl status nginx`

## 🎉 部署完成

完成以上步骤后，您的90分钟专注管理器应该已经成功部署到Ubuntu服务器上！

访问地址：
- HTTP: `http://your-server-ip` 或 `http://your-domain.com`
- HTTPS: `https://your-domain.com` （如果配置了SSL）

现在任何人都可以通过互联网访问您的专注管理器，享受科学的90分钟专注训练！
