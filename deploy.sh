#!/bin/bash

# 90分钟专注管理器 - Ubuntu自动部署脚本
# 使用方法: sudo bash deploy.sh [域名]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行，请使用 sudo"
        exit 1
    fi
}

# 检查Ubuntu版本
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_error "此脚本仅支持Ubuntu系统"
        exit 1
    fi
    
    local version=$(lsb_release -rs)
    log_info "检测到Ubuntu版本: $version"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update -y
    apt upgrade -y
    apt install -y curl wget unzip git nano
    log_success "系统更新完成"
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_success "Nginx安装完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    ufw --force enable
    ufw allow ssh
    ufw allow 'Nginx Full'
    log_success "防火墙配置完成"
}

# 创建项目目录
create_project_dir() {
    log_info "创建项目目录..."
    mkdir -p /var/www/focus-manager
    log_success "项目目录创建完成"
}

# 部署项目文件
deploy_files() {
    log_info "部署项目文件..."
    
    # 检查当前目录是否包含项目文件
    if [[ ! -f "index.html" ]]; then
        log_error "未找到index.html，请在项目目录中运行此脚本"
        exit 1
    fi
    
    # 复制文件
    cp -r ./* /var/www/focus-manager/
    
    # 设置权限
    chown -R www-data:www-data /var/www/focus-manager
    chmod -R 755 /var/www/focus-manager
    
    log_success "项目文件部署完成"
}

# 配置Nginx虚拟主机
configure_nginx() {
    local domain=$1
    log_info "配置Nginx虚拟主机..."
    
    # 确定server_name
    local server_name="localhost"
    if [[ -n "$domain" ]]; then
        server_name="$domain www.$domain"
    fi
    
    # 创建Nginx配置
    cat > /etc/nginx/sites-available/focus-manager << EOF
server {
    listen 80;
    server_name $server_name;
    
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
        try_files \$uri \$uri/ =404;
        
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
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/focus-manager /etc/nginx/sites-enabled/
    
    # 移除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试配置
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 安装SSL证书
install_ssl() {
    local domain=$1
    
    if [[ -z "$domain" ]]; then
        log_warning "未提供域名，跳过SSL证书配置"
        return
    fi
    
    log_info "安装SSL证书..."
    
    # 安装Certbot
    apt install -y certbot python3-certbot-nginx
    
    # 获取证书
    certbot --nginx --non-interactive --agree-tos --email webmaster@$domain -d $domain -d www.$domain
    
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL证书安装完成"
}

# 创建备份脚本
create_backup_script() {
    log_info "创建备份脚本..."
    
    cat > /usr/local/bin/backup-focus-manager.sh << 'EOF'
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
EOF
    
    chmod +x /usr/local/bin/backup-focus-manager.sh
    
    # 设置定时备份
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-focus-manager.sh") | crontab -
    
    log_success "备份脚本创建完成"
}

# 显示部署信息
show_deployment_info() {
    local domain=$1
    local server_ip=$(curl -s ifconfig.me || echo "获取失败")
    
    echo
    echo "========================================"
    log_success "部署完成！"
    echo "========================================"
    echo
    echo "访问信息："
    echo "  服务器IP: $server_ip"
    
    if [[ -n "$domain" ]]; then
        echo "  HTTP:  http://$domain"
        echo "  HTTPS: https://$domain"
    else
        echo "  HTTP:  http://$server_ip"
    fi
    
    echo
    echo "管理命令："
    echo "  重启Nginx: sudo systemctl restart nginx"
    echo "  查看日志: sudo tail -f /var/log/nginx/access.log"
    echo "  手动备份: sudo /usr/local/bin/backup-focus-manager.sh"
    echo
    echo "项目目录: /var/www/focus-manager"
    echo "配置文件: /etc/nginx/sites-available/focus-manager"
    echo
}

# 主函数
main() {
    local domain=$1
    
    echo "========================================"
    echo "90分钟专注管理器 - 自动部署脚本"
    echo "========================================"
    
    check_root
    check_ubuntu
    
    log_info "开始部署..."
    
    update_system
    install_nginx
    setup_firewall
    create_project_dir
    deploy_files
    configure_nginx "$domain"
    
    if [[ -n "$domain" ]]; then
        read -p "是否安装SSL证书？(y/N): " install_ssl_choice
        if [[ "$install_ssl_choice" =~ ^[Yy]$ ]]; then
            install_ssl "$domain"
        fi
    fi
    
    create_backup_script
    show_deployment_info "$domain"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$1"
fi
