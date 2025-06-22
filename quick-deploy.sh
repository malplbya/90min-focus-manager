#!/bin/bash

# 90分钟专注管理器 - 快速部署命令
# 将此文件保存为 quick-deploy.sh 并在您的本地电脑运行

echo "🚀 90分钟专注管理器 - 快速部署向导"
echo "=================================="

# 获取服务器信息
read -p "请输入您的服务器IP地址: " SERVER_IP
read -p "请输入SSH用户名 (默认: root): " SSH_USER
SSH_USER=${SSH_USER:-root}

echo ""
echo "📦 正在打包项目文件..."
tar -czf focus-manager.tar.gz \
    index.html \
    style.css \
    script.js \
    manifest.json \
    README.md \
    Dockerfile \
    docker-compose.yml \
    deploy-server.sh \
    docker/ \
    *.md

echo "✅ 打包完成"

echo ""
echo "📤 正在上传到服务器..."
scp focus-manager.tar.gz $SSH_USER@$SERVER_IP:/tmp/

echo "✅ 上传完成"

echo ""
echo "🚀 正在远程部署..."
ssh $SSH_USER@$SERVER_IP << 'EOF'
cd /tmp
tar -xzf focus-manager.tar.gz
chmod +x deploy-server.sh
./deploy-server.sh
EOF

echo ""
echo "🎉 部署完成！"
echo "访问地址: http://$SERVER_IP"
echo ""
echo "管理命令："
echo "ssh $SSH_USER@$SERVER_IP 'cd /opt/focus-manager && docker-compose ps'"
echo "ssh $SSH_USER@$SERVER_IP 'cd /opt/focus-manager && docker-compose logs -f'"

# 清理临时文件
rm focus-manager.tar.gz

echo ""
echo "✨ 部署向导执行完成！"
