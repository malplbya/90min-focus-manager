@echo off
chcp 65001 >nul
title 90分钟专注管理器 - 快速部署向导

echo 🚀 90分钟专注管理器 - 快速部署向导
echo ==================================
echo.

:: 获取服务器信息
set /p SERVER_IP="请输入您的服务器IP地址: "
set /p SSH_USER="请输入SSH用户名 (默认: root): "
if "%SSH_USER%"=="" set SSH_USER=root

echo.
echo 📦 正在打包项目文件...

:: 使用 tar 命令打包（需要 Windows 10 1803+ 或安装 Git Bash）
tar -czf focus-manager.tar.gz ^
    index.html ^
    style.css ^
    script.js ^
    manifest.json ^
    README.md ^
    Dockerfile ^
    docker-compose.yml ^
    deploy-server.sh ^
    docker ^
    *.md

if %errorlevel% neq 0 (
    echo ❌ 打包失败，请确保安装了 tar 工具
    echo 💡 建议安装 Git for Windows 或使用 WSL
    pause
    exit /b 1
)

echo ✅ 打包完成

echo.
echo 📤 正在上传到服务器...
scp focus-manager.tar.gz %SSH_USER%@%SERVER_IP%:/tmp/

if %errorlevel% neq 0 (
    echo ❌ 上传失败，请检查网络连接和SSH配置
    pause
    exit /b 1
)

echo ✅ 上传完成

echo.
echo 🚀 正在远程部署...
ssh %SSH_USER%@%SERVER_IP% "cd /tmp && tar -xzf focus-manager.tar.gz && chmod +x deploy-server.sh && ./deploy-server.sh"

if %errorlevel% neq 0 (
    echo ❌ 部署失败，请查看错误信息
    pause
    exit /b 1
)

echo.
echo 🎉 部署完成！
echo 访问地址: http://%SERVER_IP%
echo.
echo 管理命令：
echo ssh %SSH_USER%@%SERVER_IP% "cd /opt/focus-manager && docker-compose ps"
echo ssh %SSH_USER%@%SERVER_IP% "cd /opt/focus-manager && docker-compose logs -f"

:: 清理临时文件
del focus-manager.tar.gz

echo.
echo ✨ 部署向导执行完成！
pause
