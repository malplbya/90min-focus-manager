@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                    90分钟专注管理器                              ║
echo ║                基于神经重放原理的专注训练系统                    ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 启动选项：
echo   [1] 本地访问 (默认)
echo   [2] 生成二维码 (移动端扫码访问)
echo   [3] 查看部署指南
echo   [4] 直接启动
echo.
set /p choice="请选择 (1-4，回车默认为4): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto qrcode
if "%choice%"=="3" goto deploy
if "%choice%"=="" goto start
if "%choice%"=="4" goto start
goto start

:local
echo.
echo 📍 本地访问模式
echo 正在启动浏览器...
start "" "index.html"
goto info

:qrcode
echo.
echo 📱 移动端二维码访问
echo.
echo 请先确保：
echo   1. 电脑和手机在同一网络
echo   2. 电脑防火墙允许访问
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "ipv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo 🌐 局域网地址: http://%%b:8080
        echo.
        echo 📱 用手机扫描二维码访问：
        echo https://api.qrserver.com/v1/create-qr-code/?size=150x150^&data=http://%%b:8080
        echo.
        goto startserver
    )
)

:startserver
echo 🔧 启动简单HTTP服务器...
python -m http.server 8080 2>nul || (
    echo ❌ Python未安装，无法启动服务器
    echo 💡 请安装Python或使用选项1本地访问
    pause
    exit /b
)
goto end

:deploy
echo.
echo 📖 部署指南
echo.
echo 查看以下文件获取详细部署说明：
echo   📄 Ubuntu部署手册.md - 详细的Ubuntu服务器部署指南
echo   🚀 快速部署指南.md - 快速部署步骤
echo   🐳 Docker部署指南.md - 使用Docker容器部署
echo.
echo 💡 提示：部署到服务器后，可通过域名或IP全球访问
pause
goto start

:start
echo 🚀 正在启动专注管理器...
start "" "index.html"

:info
echo.
echo ✅ 专注管理器已启动！
echo.
echo 💡 使用提示：
echo   桌面端：
echo     • 空格键：开始/暂停专注
echo     • ESC键：重置计时器
echo.
echo   移动端：
echo     • 向上滑动：开始专注
echo     • 向下滑动：暂停/重置
echo     • 长按计时器：快捷菜单
echo     • 可添加到主屏幕使用
echo.
echo 🧠 专注原理：
echo   • 90分钟最佳专注时长
echo   • 随机提示音强化记忆
echo   • 10秒眯眼促进神经重放
echo.
echo 📚 科学依据：
echo   • 基于大脑90分钟工作周期
echo   • 变比率强化心理学原理
echo   • 神经重放速度快20倍理论
echo.

:end
echo 按任意键退出...
pause >nul
