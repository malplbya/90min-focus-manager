@echo off
chcp 65001 >nul

echo 🚀 开始部署90分钟专注管理器...
echo.

:: 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker 已安装

:: 检查 Docker 是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 服务未运行，请启动 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 服务正在运行

:: 停止并删除旧容器
echo 🛑 停止旧容器...
docker-compose down 2>nul

:: 构建镜像
echo 🏗️ 构建 Docker 镜像...
docker-compose build --no-cache

if %errorlevel% neq 0 (
    echo ❌ 镜像构建失败
    pause
    exit /b 1
)

:: 启动服务
echo 🚀 启动服务...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ 服务启动失败
    docker-compose logs
    pause
    exit /b 1
)

:: 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 5 /nobreak >nul

:: 检查服务状态
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo 🎉 部署完成！
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 📱 访问地址: http://localhost
    echo.
    echo 🔧 管理命令：
    echo    查看状态: docker-compose ps
    echo    查看日志: docker-compose logs -f
    echo    重启服务: docker-compose restart
    echo    停止服务: docker-compose down
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo.
    echo 🌐 正在打开浏览器...
    start http://localhost
) else (
    echo ❌ 服务启动失败，查看错误日志：
    docker-compose logs
)

pause
