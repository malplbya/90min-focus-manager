#!/bin/bash

# 90分钟专注管理器 - 一键部署脚本
# 适用于 Ubuntu/CentOS 等 Linux 服务器

echo "🚀 开始部署90分钟专注管理器..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 权限运行此脚本"
    echo "使用方法: sudo bash deploy.sh"
    exit 1
fi

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装 Docker
echo "🐳 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # 启动 Docker 服务
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 安装 Docker Compose
echo "📦 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# 创建项目目录
PROJECT_DIR="/opt/focus-manager"
echo "📁 创建项目目录: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
mkdir -p $PROJECT_DIR/logs

# 检查当前目录是否包含项目文件
if [ -f "index.html" ] && [ -f "Dockerfile" ]; then
    echo "📋 复制项目文件..."
    cp -r * $PROJECT_DIR/
    cd $PROJECT_DIR
elif [ -d "/tmp/focus-manager" ]; then
    echo "📋 从临时目录复制项目文件..."
    cp -r /tmp/focus-manager/* $PROJECT_DIR/
    cd $PROJECT_DIR
else
    echo "❌ 未找到项目文件"
    echo "请确保："
    echo "1. 在项目根目录运行此脚本，或"
    echo "2. 将项目文件上传到 /tmp/focus-manager/ 目录"
    exit 1
fi

# 设置防火墙
echo "🔥 配置防火墙..."
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 构建并启动容器
echo "🏗️ 构建 Docker 镜像..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache

echo "🚀 启动服务..."
docker-compose up -d

# 检查服务状态
echo "🔍 检查服务状态..."
sleep 5
if docker-compose ps | grep -q "Up"; then
    echo "✅ 服务启动成功！"
    
    # 获取服务器IP
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || hostname -I | awk '{print $1}')
    
    echo ""
    echo "🎉 部署完成！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 访问地址："
    echo "   本地: http://localhost"
    echo "   外网: http://$SERVER_IP"
    echo ""
    echo "🔧 管理命令："
    echo "   查看状态: docker-compose ps"
    echo "   查看日志: docker-compose logs -f"
    echo "   重启服务: docker-compose restart"
    echo "   停止服务: docker-compose down"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ 服务启动失败，请检查错误日志："
    docker-compose logs
    exit 1
fi
