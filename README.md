# 🧠 90分钟专注管理器

基于神经重放原理的科学专注训练系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

## 🎯 项目简介

90分钟专注管理器是一个基于神经科学研究的专注训练工具。根据研究表明，大脑一次最大可以工作90分钟，这个时长能最大化专注效果。通过随机提示音和短暂休息，利用神经重放原理提升学习和工作效率。

### ✨ 核心特性

- 🧠 **科学原理**：基于神经重放理论，90分钟最佳专注时长
- 🔔 **智能提示**：随机间隔提示音，采用变比率强化
- 👁️ **微休息系统**：10秒闭眼休息，激发神经重放（速度比实际练习快20倍）
- 📱 **PWA支持**：可安装到桌面，支持离线使用
- 🎨 **多主题界面**：4种精美主题可选
- 🔊 **多样音效**：5种音效类型，支持试听和音量调节
- 📊 **数据统计**：专注次数、时间统计、效率分析
- 📲 **移动优化**：触摸手势、振动反馈、屏幕常亮

## 🚀 在线体验

### 方式一：直接访问（部署后）
- 🌐 **在线访问**: [https://your-domain.com](https://your-domain.com)

### 方式二：本地运行
```bash
# 克隆项目
git clone https://github.com/yourusername/focus-manager.git
cd focus-manager

# 方式1：直接打开（需要支持现代浏览器）
open index.html

# 方式2：使用本地服务器
python -m http.server 8080
# 访问 http://localhost:8080
```

## 🐳 Docker 部署

### 快速部署

#### Windows 用户
```cmd
# 克隆项目
git clone https://github.com/yourusername/focus-manager.git
cd focus-manager

# 一键部署
deploy-windows.bat
```

#### Linux 服务器
```bash
# 克隆项目
git clone https://github.com/yourusername/focus-manager.git
cd focus-manager

# 一键部署
chmod +x deploy-server.sh
sudo ./deploy-server.sh
```

#### 使用 Docker Compose
```bash
# 构建并启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

详细部署指南：
- 📖 [Linux 部署指南](Linux部署指南.md)
- 📖 [Docker 部署指南](DOCKER-DEPLOY.md)
- 📖 [Ubuntu 部署手册](Ubuntu部署手册.md)

## 📱 PWA 功能

本应用支持 Progressive Web App (PWA) 功能：

- ✅ **离线使用**：缓存关键资源，网络中断也能使用
- ✅ **桌面安装**：可添加到桌面/主屏幕
- ✅ **推送通知**：专注提醒通知
- ✅ **快速启动**：从主屏幕直接启动专注

## 🎮 使用方法

### 基本操作
1. **开始专注**：点击"开始专注"按钮
2. **随机提示**：系统会在3-5分钟随机间隔播放提示音
3. **微休息**：听到提示音后闭眼休息10秒
4. **继续专注**：休息结束后继续专注
5. **完成训练**：90分钟后查看专注效率

### 移动端手势
- 📱 **向上滑动**：开始专注
- 📱 **向下滑动**：暂停/重置
- 📱 **长按计时器**：显示快捷菜单

### 快捷键
- ⌨️ **空格键**：开始/暂停专注
- ⌨️ **ESC键**：重置计时器

## ⚙️ 配置选项

点击"音效设置"按钮可配置：

### 🔊 音效设置
- **音效类型**：铃声、钟声、蜂鸣、自然、禅音
- **音量控制**：0-100% 可调
- **试听功能**：每种音效都可预览

### 🎨 显示设置
- **下次时间显示**：可隐藏下次提示音时间
- **振动反馈**：移动端振动提醒
- **浏览器通知**：桌面推送通知

### 🎯 主题设置
- **默认蓝紫**：经典渐变主题
- **自然绿色**：护眼绿色主题
- **活力橙色**：energetic 主题
- **深色模式**：暗色主题

## 🧬 科学原理

### 神经重放理论
> 就算只是闭眼休息10秒，大脑都会出现显著且快速的神经重放，速度比实际练习时快20倍。

### 90分钟专注周期
> 基于大脑工作原理，研究表明大脑一次最大可以工作90分钟。这个时长能最大化专注效果。

### 变比率强化
> 通过随机的提示音比固定的更容易让人持续专注，形成良好的行为习惯。

## 🛠️ 技术栈

### 前端技术
- **HTML5**：语义化标记
- **CSS3**：现代样式设计，支持多主题
- **JavaScript ES6+**：现代 JS 特性
- **Web Audio API**：动态音效生成
- **PWA**：离线支持和安装功能

### 部署技术
- **Docker**：容器化部署
- **Nginx**：高性能 Web 服务器
- **Docker Compose**：服务编排

### 浏览器 API
- **Web Audio API**：音效生成
- **Vibration API**：振动反馈
- **Wake Lock API**：屏幕常亮
- **Notification API**：推送通知
- **Service Worker**：PWA 支持

## 📁 项目结构

```
focus-manager/
├── 📄 index.html              # 主页面
├── 🎨 style.css              # 样式文件
├── ⚡ script.js              # 核心逻辑
├── 📱 manifest.json          # PWA 配置
├── 🐳 Dockerfile             # Docker 镜像
├── 🔧 docker-compose.yml     # Docker 编排
├── 📂 docker/
│   └── nginx.conf            # Nginx 配置
├── 🚀 deploy-server.sh       # Linux 部署脚本
├── 🖥️ deploy-windows.bat     # Windows 部署脚本
├── ⚡ quick-deploy.sh        # 快速部署脚本
├── 📊 manage.sh              # 服务管理脚本
└── 📚 docs/                  # 文档目录
    ├── Linux部署指南.md
    ├── Docker部署指南.md
    └── Ubuntu部署手册.md
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发环境
```bash
# 克隆项目
git clone https://github.com/yourusername/focus-manager.git
cd focus-manager

# 本地开发
python -m http.server 8080
```

### 代码规范
- 使用现代 JavaScript ES6+ 语法
- 保持代码简洁和可读性
- 添加必要的注释
- 遵循响应式设计原则

## 📄 开源协议

本项目基于 [MIT 协议](LICENSE) 开源。

## 🙏 致谢

- 神经重放理论研究
- PWA 技术社区
- Docker 容器技术
- 开源社区贡献者

## 📞 联系方式

- 🐛 **问题反馈**：[Issues](https://github.com/yourusername/focus-manager/issues)
- 💡 **功能建议**：[Discussions](https://github.com/yourusername/focus-manager/discussions)
- 📧 **邮件联系**：your-email@example.com

## 🌟 支持项目

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！

---

**让每一个90分钟都成为高效专注的时光！** 🧠✨
