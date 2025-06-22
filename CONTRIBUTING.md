# 贡献指南

感谢您对90分钟专注管理器项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题
- 在提交问题前，请先搜索现有的 Issues
- 使用清晰的标题描述问题
- 提供详细的重现步骤
- 包含您的浏览器和操作系统信息

### 功能建议
- 在 Discussions 中提出新功能想法
- 详细描述功能的用途和价值
- 如果可能，提供设计草图或线框图

### 代码贡献

#### 准备工作
1. Fork 这个仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 在本地测试您的更改

#### 开发规范
- 使用现代 JavaScript ES6+ 语法
- 保持代码简洁和可读性
- 为复杂逻辑添加注释
- 遵循现有的代码风格
- 确保移动端兼容性

#### 提交代码
1. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
2. 推送到分支 (`git push origin feature/AmazingFeature`)
3. 创建 Pull Request

## 📝 代码规范

### JavaScript
```javascript
// 使用 const/let 而不是 var
const timer = document.getElementById('timer');

// 使用箭头函数
const updateTimer = () => {
    // 代码逻辑
};

// 使用模板字符串
const message = `当前时间：${currentTime}`;
```

### CSS
```css
/* 使用 BEM 命名规范 */
.timer-display {}
.timer-display__text {}
.timer-display--active {}

/* 移动端优先的响应式设计 */
@media (min-width: 768px) {
    /* 桌面端样式 */
}
```

### HTML
```html
<!-- 使用语义化标签 -->
<main>
    <section class="timer-section">
        <article class="timer-display">
            <!-- 内容 -->
        </article>
    </section>
</main>
```

## 🧪 测试

### 手动测试清单
- [ ] 基本计时功能正常
- [ ] 提示音能正常播放
- [ ] 移动端手势功能正常
- [ ] PWA 安装功能正常
- [ ] 所有配置选项正常工作
- [ ] 在不同浏览器中测试
- [ ] 移动端和桌面端都能正常使用

### 测试环境
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 移动端浏览器

## 📚 文档

### 更新文档
- 新功能需要更新 README.md
- 部署相关的更改需要更新部署指南
- API 更改需要更新相关文档

### 文档风格
- 使用清晰的标题结构
- 提供代码示例
- 包含截图（如果适用）
- 保持语言简洁明了

## 🔄 发布流程

### 版本管理
- 遵循语义化版本控制 (SemVer)
- 主版本：不兼容的 API 更改
- 次版本：向后兼容的功能添加
- 修订版本：向后兼容的问题修复

### 发布检查
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新

## 🏗️ 开发环境设置

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/yourusername/focus-manager.git
cd focus-manager

# 启动本地服务器
python -m http.server 8080
# 或使用 Node.js
npx http-server -p 8080

# 打开浏览器访问
open http://localhost:8080
```

### Docker 开发
```bash
# 构建开发镜像
docker build -t focus-manager-dev .

# 运行开发容器
docker run -p 8080:80 focus-manager-dev
```

## 🎯 项目路线图

### 近期计划
- [ ] 添加更多音效选项
- [ ] 实现数据导出功能
- [ ] 添加专注目标设置
- [ ] 优化移动端体验

### 长期愿景
- [ ] 多语言支持
- [ ] 团队协作功能
- [ ] 数据分析和报告
- [ ] 与其他生产力工具集成

## 🌟 认可贡献者

我们感谢所有为这个项目做出贡献的人！

## 📞 联系方式

如果您有任何问题，可以通过以下方式联系我们：
- 创建 Issue
- 发起 Discussion
- 发送邮件至：your-email@example.com

---

再次感谢您的贡献！🙏
