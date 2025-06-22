class FocusManager {
    constructor() {
        this.totalTime = 90 * 60; // 90分钟转换为秒
        this.currentTime = this.totalTime;
        this.isRunning = false;
        this.isPaused = false;
        this.timer = null;
        this.soundTimer = null;
        this.restTimer = null;
        this.restCount = 0;
        this.todayFocus = 0;
        this.totalFocusTime = 0;
          // 随机提示音间隔 (3-5分钟，转换为秒)
        this.minSoundInterval = 3 * 60;
        this.maxSoundInterval = 5 * 60;
        this.nextSoundTime = 0;
        this.soundPauseTime = 0; // 暂停时的剩余提示音时间
        this.soundStartTime = 0; // 提示音开始时间
          // 移动端相关
        this.isMobile = this.detectMobile();
        this.wakeLock = null;
        this.isVisible = true;
        
        // 配置相关
        this.config = {
            soundType: 'bell',
            volume: 0.7,
            showNextTime: true,
            enableVibration: true,
            enableNotifications: false,
            theme: 'default'
        };
        
        // 音效生成器
        this.soundGenerators = {
            bell: this.generateBellSound.bind(this),
            chime: this.generateChimeSound.bind(this),
            beep: this.generateBeepSound.bind(this),
            nature: this.generateNatureSound.bind(this),
            zen: this.generateZenSound.bind(this)
        };
          this.initElements();
        this.initEventListeners();
        this.initMobileFeatures();
        this.loadConfig();
        this.loadStats();
        this.generateBellSound();
        this.updateNextSoundTime();
        this.updateNextTimeVisibility();
        this.checkStartFromShortcut();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               'ontouchstart' in window || 
               navigator.maxTouchPoints > 0;
    }
    
    initElements() {
        // 主要元素
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // 状态显示
        this.restStatus = document.getElementById('restStatus');
        this.restTimer = document.getElementById('restTimer');
        this.soundStatus = document.getElementById('soundStatus');
        this.nextSound = document.getElementById('nextSound');
        
        // 进度条
        this.progressFill = document.getElementById('progressFill');
        this.progressPercent = document.getElementById('progressPercent');
        
        // 统计
        this.todayFocusEl = document.getElementById('todayFocus');
        this.totalTimeEl = document.getElementById('totalTime');
        this.restCountEl = document.getElementById('restCount');
        
        // 模态框
        this.restModal = document.getElementById('restModal');
        this.restCountdown = document.getElementById('restCountdown');
        this.restProgress = document.getElementById('restProgress');
        this.completeModal = document.getElementById('completeModal');
        this.finalRestCount = document.getElementById('finalRestCount');
        this.efficiency = document.getElementById('efficiency');
        this.startBreakBtn = document.getElementById('startBreakBtn');
        this.closeCompleteBtn = document.getElementById('closeCompleteBtn');
          // 音频
        this.bellSound = document.getElementById('bellSound');
        
        // 配置界面元素
        this.soundConfigBtn = document.getElementById('soundConfigBtn');
        this.toggleNextTimeBtn = document.getElementById('toggleNextTimeBtn');
        this.nextSoundContainer = document.getElementById('nextSoundContainer');
        this.configModal = document.getElementById('configModal');
        this.closeConfigBtn = document.getElementById('closeConfigBtn');
        this.saveConfigBtn = document.getElementById('saveConfigBtn');
        this.resetConfigBtn = document.getElementById('resetConfigBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeValue = document.getElementById('volumeValue');
    }
    
    initEventListeners() {        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.startBreakBtn.addEventListener('click', () => this.startBreak());
        this.closeCompleteBtn.addEventListener('click', () => this.closeComplete());
        
        // 配置界面事件
        this.soundConfigBtn.addEventListener('click', () => this.openConfig());
        this.toggleNextTimeBtn.addEventListener('click', () => this.toggleNextTimeDisplay());
        this.closeConfigBtn.addEventListener('click', () => this.closeConfig());
        this.saveConfigBtn.addEventListener('click', () => this.saveConfig());
        this.resetConfigBtn.addEventListener('click', () => this.resetConfig());
        
        // 音量滑块事件
        this.volumeSlider.addEventListener('input', (e) => {
            this.volumeValue.textContent = e.target.value + '%';
        });
        
        // 音效试听按钮事件
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const soundType = btn.dataset.sound;
                this.previewSound(soundType);
            });
        });
        
        // 主题选择事件
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.config.theme = option.dataset.theme;
                this.applyTheme(this.config.theme);
            });
        });
        
        // 模态框点击外部关闭
        this.restModal.addEventListener('click', (e) => {
            if (e.target === this.restModal) {
                this.closeRestModal();
            }
        });
          this.completeModal.addEventListener('click', (e) => {
            if (e.target === this.completeModal) {
                this.closeComplete();
            }
        });
        
        this.configModal.addEventListener('click', (e) => {
            if (e.target === this.configModal) {
                this.closeConfig();
            }
        });
    }
    
    generateBellSound() {
        // 生成一个简单的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
      playBellSound() {
        try {
            // 移动端振动反馈
            if (this.enableVibration) {
                navigator.vibrate([200, 100, 200]); // 振动模式：震-停-震
            }
            
            // 使用Web Audio API生成提示音
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 创建一个悦耳的铃声
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } catch (error) {
            console.warn('无法播放提示音:', error);
        }
    }    start() {
        if (!this.isRunning || this.isPaused) {
            const wasePaused = this.isPaused;
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            // 移动端启用屏幕常亮
            if (this.isMobile) {
                this.requestWakeLock();
            }
            
            // 开始主计时器
            this.timer = setInterval(() => this.tick(), 1000);
            
            // 设置随机提示音
            this.setSoundTimer();
            
            // 更新状态
            this.restStatus.textContent = '专注中...';
            this.soundStatus.textContent = '随机提示音已激活';
            this.timerDisplay.classList.add('active');
            
            if (wasePaused) {
                console.log('恢复专注模式');
            } else {
                console.log('开始90分钟专注模式');
            }
        }
    }
      pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            
            clearInterval(this.timer);
            clearTimeout(this.soundTimer);
            
            // 计算剩余的提示音时间
            if (this.soundStartTime > 0) {
                const elapsed = (Date.now() - this.soundStartTime) / 1000;
                this.soundPauseTime = Math.max(0, this.nextSoundTime - elapsed);
            } else {
                this.soundPauseTime = this.nextSoundTime;
            }
            
            this.restStatus.textContent = '暂停中...';
            this.soundStatus.textContent = '提示音已暂停';
            this.timerDisplay.classList.remove('active');
            
            console.log('专注已暂停，剩余提示音时间:', this.soundPauseTime + '秒');
        }
    }    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = this.totalTime;
        this.restCount = 0;
        this.soundPauseTime = 0;
        this.soundStartTime = 0;
        
        clearInterval(this.timer);
        clearTimeout(this.soundTimer);
        clearInterval(this.restTimer);
        
        // 释放屏幕常亮
        this.releaseWakeLock();
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        this.updateDisplay();
        this.updateProgress();
        this.restStatus.textContent = '等待开始...';
        this.soundStatus.textContent = '随机模式';
        this.restCountEl.textContent = this.restCount;
        this.timerDisplay.classList.remove('active');
        this.updateNextSoundTime();
        
        // 关闭模态框
        this.restModal.style.display = 'none';
        this.completeModal.style.display = 'none';
        
        console.log('专注计时器已重置');
    }
    
    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            this.updateDisplay();
            this.updateProgress();
        } else {
            this.complete();
        }
    }
      setSoundTimer() {
        let timeToWait;
        
        // 如果有暂停时保存的剩余时间，使用它
        if (this.soundPauseTime > 0) {
            timeToWait = this.soundPauseTime;
            this.soundPauseTime = 0; // 清除暂停时间
        } else {
            // 生成新的随机间隔
            if (this.nextSoundTime <= 0) {
                this.updateNextSoundTime();
            }
            timeToWait = this.nextSoundTime;
        }
        
        // 记录开始时间
        this.soundStartTime = Date.now();
        
        this.soundTimer = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.playConfiguredSound();
                this.showRestModal();
                this.updateNextSoundTime();
                this.soundStartTime = 0; // 重置开始时间
                console.log('提示音响起，开始10秒休息');
            }
        }, timeToWait * 1000);
    }
    
    updateNextSoundTime() {
        // 生成3-5分钟的随机间隔
        this.nextSoundTime = Math.floor(Math.random() * (this.maxSoundInterval - this.minSoundInterval + 1)) + this.minSoundInterval;
        this.nextSound.textContent = this.formatTime(this.nextSoundTime);
    }
    
    showRestModal() {
        this.restModal.style.display = 'block';
        let countdown = 10;
        this.restCountdown.textContent = countdown;
        this.restProgress.style.width = '100%';
        
        this.restTimer = setInterval(() => {
            countdown--;
            this.restCountdown.textContent = countdown;
            this.restProgress.style.width = (countdown / 10 * 100) + '%';
            
            if (countdown <= 0) {
                this.closeRestModal();
            }
        }, 1000);
    }
    
    closeRestModal() {
        this.restModal.style.display = 'none';
        clearInterval(this.restTimer);
        this.restCount++;
        this.restCountEl.textContent = this.restCount;
        
        // 继续设置下一个提示音
        if (this.isRunning && !this.isPaused) {
            this.setSoundTimer();
        }
        
        console.log('休息结束，继续专注');
    }
    
    complete() {
        this.isRunning = false;
        clearInterval(this.timer);
        clearTimeout(this.soundTimer);
        
        this.todayFocus++;
        this.totalFocusTime += 90;
        this.saveStats();
        this.updateStats();
        
        // 显示完成模态框
        this.finalRestCount.textContent = this.restCount;
        const efficiency = Math.max(0, 100 - (this.restCount * 2)); // 简单的效率计算
        this.efficiency.textContent = efficiency + '%';
        this.completeModal.style.display = 'block';
        
        this.timerDisplay.classList.remove('active');
        this.restStatus.textContent = '专注完成！';
        this.soundStatus.textContent = '恭喜完成90分钟专注';
        
        console.log('90分钟专注完成！');
    }
    
    startBreak() {
        this.completeModal.style.display = 'none';
        alert('开始20分钟休息时间！\n\n建议：\n• 远离电子设备\n• 适当运动或伸展\n• 补充水分和钠钾离子\n• 让大脑完全放松');
        this.reset();
    }
    
    closeComplete() {
        this.completeModal.style.display = 'none';
        this.reset();
    }
    
    updateDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.currentTime);
    }
    
    updateProgress() {
        const progress = ((this.totalTime - this.currentTime) / this.totalTime) * 100;
        this.progressFill.style.width = progress + '%';
        this.progressPercent.textContent = Math.round(progress) + '%';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    loadStats() {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('focusDate');
        
        if (savedDate === today) {
            this.todayFocus = parseInt(localStorage.getItem('todayFocus') || '0');
        } else {
            this.todayFocus = 0;
            localStorage.setItem('focusDate', today);
        }
        
        this.totalFocusTime = parseInt(localStorage.getItem('totalFocusTime') || '0');
        this.updateStats();
    }
    
    saveStats() {
        const today = new Date().toDateString();
        localStorage.setItem('focusDate', today);
        localStorage.setItem('todayFocus', this.todayFocus.toString());
        localStorage.setItem('totalFocusTime', this.totalFocusTime.toString());
    }
    
    updateStats() {
        this.todayFocusEl.textContent = this.todayFocus;
        this.totalTimeEl.textContent = this.totalFocusTime;
        this.restCountEl.textContent = this.restCount;
    }
    
    initMobileFeatures() {
        if (this.isMobile) {
            // 阻止屏幕休眠
            this.requestWakeLock();
            
            // 移动端振动反馈
            this.enableVibration = 'vibrate' in navigator;
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                this.isVisible = !document.hidden;
                if (!this.isVisible && this.isRunning && !this.isPaused) {
                    // 页面隐藏时，可选择是否暂停
                    // this.pause(); // 可取消注释以自动暂停
                }
            });
            
            // 移动端双击防止缩放
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (event) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
            
            // 添加移动端指示器
            document.body.classList.add('mobile-device');
            
            // 移动端触摸手势支持
            let touchStartY = 0;
            let touchEndY = 0;
            
            document.addEventListener('touchstart', (e) => {
                touchStartY = e.changedTouches[0].screenY;
            });
            
            document.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].screenY;
                handleSwipe();
            });
            
            const handleSwipe = () => {
                const swipeThreshold = 50;
                const difference = touchStartY - touchEndY;
                
                if (Math.abs(difference) > swipeThreshold) {
                    if (difference > 0) {
                        // 向上滑动 - 开始专注
                        const startBtn = document.getElementById('startBtn');
                        if (!startBtn.disabled) {
                            startBtn.click();
                        }
                    } else {
                        // 向下滑动 - 暂停/重置
                        const pauseBtn = document.getElementById('pauseBtn');
                        const resetBtn = document.getElementById('resetBtn');
                        if (!pauseBtn.disabled) {
                            pauseBtn.click();
                        } else {
                            resetBtn.click();
                        }
                    }
                }
            };
        }
    }
    
    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('屏幕常亮已启用');
            }
        } catch (err) {
            console.warn('无法启用屏幕常亮:', err);
        }
    }
    
    async releaseWakeLock() {
        if (this.wakeLock) {
            await this.wakeLock.release();
            this.wakeLock = null;
            console.log('屏幕常亮已禁用');
        }
    }
      checkStartFromShortcut() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'start') {
            // 从PWA快捷方式启动，自动开始专注
            setTimeout(() => {
                this.start();
            }, 1000);
        }
    }
    
    // 配置相关方法
    openConfig() {
        this.configModal.style.display = 'block';
        this.loadConfigToUI();
    }
    
    closeConfig() {
        this.configModal.style.display = 'none';
    }
    
    loadConfigToUI() {
        // 加载音效设置
        document.querySelector(`input[name="soundType"][value="${this.config.soundType}"]`).checked = true;
        this.volumeSlider.value = this.config.volume * 100;
        this.volumeValue.textContent = Math.round(this.config.volume * 100) + '%';
        
        // 加载显示设置
        document.getElementById('showNextTime').checked = this.config.showNextTime;
        document.getElementById('enableVibration').checked = this.config.enableVibration;
        document.getElementById('enableNotifications').checked = this.config.enableNotifications;
        
        // 加载主题设置
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === this.config.theme);
        });
    }
    
    saveConfig() {
        // 保存音效设置
        this.config.soundType = document.querySelector('input[name="soundType"]:checked').value;
        this.config.volume = this.volumeSlider.value / 100;
        
        // 保存显示设置
        this.config.showNextTime = document.getElementById('showNextTime').checked;
        this.config.enableVibration = document.getElementById('enableVibration').checked;
        this.config.enableNotifications = document.getElementById('enableNotifications').checked;
        
        // 保存到本地存储
        localStorage.setItem('focusManagerConfig', JSON.stringify(this.config));
        
        // 应用配置
        this.updateNextTimeVisibility();
        this.applyTheme(this.config.theme);
        
        // 请求通知权限
        if (this.config.enableNotifications && 'Notification' in window) {
            Notification.requestPermission();
        }
        
        this.closeConfig();
        this.showConfigSavedMessage();
    }
    
    resetConfig() {
        this.config = {
            soundType: 'bell',
            volume: 0.7,
            showNextTime: true,
            enableVibration: true,
            enableNotifications: false,
            theme: 'default'
        };
        this.loadConfigToUI();
        this.updateNextTimeVisibility();
        this.applyTheme(this.config.theme);
    }
    
    loadConfig() {
        const savedConfig = localStorage.getItem('focusManagerConfig');
        if (savedConfig) {
            this.config = { ...this.config, ...JSON.parse(savedConfig) };
        }
        this.applyTheme(this.config.theme);
    }
    
    toggleNextTimeDisplay() {
        this.config.showNextTime = !this.config.showNextTime;
        this.updateNextTimeVisibility();
        localStorage.setItem('focusManagerConfig', JSON.stringify(this.config));
    }
    
    updateNextTimeVisibility() {
        if (this.config.showNextTime) {
            this.nextSoundContainer.style.display = 'block';
            this.toggleNextTimeBtn.innerHTML = '<i class="fas fa-eye"></i>';
            this.toggleNextTimeBtn.title = '隐藏下次时间';
        } else {
            this.nextSoundContainer.style.display = 'none';
            this.toggleNextTimeBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            this.toggleNextTimeBtn.title = '显示下次时间';
        }
    }
    
    showConfigSavedMessage() {
        const message = document.createElement('div');
        message.className = 'config-saved-message';
        message.innerHTML = '<i class="fas fa-check"></i> 配置已保存';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #84fab0, #8fd3f4);
            color: #333;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 1001;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2s forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2500);
    }
      // 音效试听方法
    previewSound(soundType) {
        if (this.soundGenerators[soundType]) {
            this.soundGenerators[soundType]();
        }
    }
    
    // 播放配置的音效
    playConfiguredSound() {
        if (this.soundGenerators[this.config.soundType]) {
            this.soundGenerators[this.config.soundType]();
        }
        
        // 如果启用了振动
        if (this.config.enableVibration && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // 如果启用了通知
        if (this.config.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('专注提醒', {
                body: '请休息10秒，让大脑进行神经重放',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPgo8L3N2Zz4KPC9zdmc+'
            });
        }
    }
    
    // 音效生成方法
    generateChimeSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const frequencies = [523, 659, 784]; // C, E, G
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.3, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.8);
            }, index * 200);
        });
    }
    
    generateBeepSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.2, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    generateNatureSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 模拟鸟叫声
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sine';
                const freq = 1200 + Math.random() * 800;
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + 0.2);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.2, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 150);
        }
    }
    
    generateZenSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 创建钟磬音效
        const frequencies = [256, 341, 426]; // 低音钟声
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.4, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 2);
            }, index * 300);
        });
    }
      applyTheme(theme) {
        document.body.className = theme !== 'default' ? `theme-${theme}` : '';
        this.config.theme = theme;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.focusManager = new FocusManager();
    
    // 显示移动端提示
    if (window.focusManager.isMobile) {
        const mobileTip = document.querySelector('.mobile-tip');
        if (mobileTip) {
            mobileTip.style.display = 'block';
        }
        
        // 显示移动端操作提示
        setTimeout(() => {
            showMobileHints('向上滑动开始专注，向下滑动暂停');
        }, 2000);
    }
    
    console.log('90分钟专注管理器已启动');
    console.log('设备类型:', window.focusManager.isMobile ? '移动设备' : '桌面设备');
});

function showMobileHints(message) {
    // 创建移动端提示元素
    let hintsEl = document.querySelector('.mobile-hints');
    if (!hintsEl) {
        hintsEl = document.createElement('div');
        hintsEl.className = 'mobile-hints';
        document.body.appendChild(hintsEl);
    }
    
    hintsEl.textContent = message;
    hintsEl.classList.add('show');
    
    setTimeout(() => {
        hintsEl.classList.remove('show');
    }, 3000);
}

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else if (!pauseBtn.disabled) {
            pauseBtn.click();
        }
    }
    
    if (e.key === 'Escape') {
        const resetBtn = document.getElementById('resetBtn');
        resetBtn.click();
    }
});

// 页面可见性API - 当用户切换标签页时暂停
document.addEventListener('visibilitychange', () => {
    const pauseBtn = document.getElementById('pauseBtn');
    if (document.hidden && !pauseBtn.disabled) {
        // 用户切换到其他标签页，自动暂停
        // pauseBtn.click(); // 可选：是否自动暂停
    }
});

// 防止意外关闭页面
window.addEventListener('beforeunload', (e) => {
    const startBtn = document.getElementById('startBtn');
    if (startBtn.disabled) {
        e.preventDefault();
        e.returnValue = '专注计时正在进行中，确定要离开吗？';
        return e.returnValue;
    }
});

// PWA安装提示
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 显示安装提示
    if (focusManager.isMobile) {
        setTimeout(() => {
            showInstallPrompt();
        }, 3000);
    }
});

function showInstallPrompt() {
    if (deferredPrompt && !localStorage.getItem('installPromptShown')) {
        const install = confirm('将专注管理器添加到主屏幕，随时开始专注训练？');
        if (install) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('用户安装了PWA');
                }
                deferredPrompt = null;
            });
        }
        localStorage.setItem('installPromptShown', 'true');
    }
}

// 移动端长按菜单支持
document.addEventListener('contextmenu', (e) => {
    if (focusManager.isMobile && e.target.closest('.timer-display')) {
        e.preventDefault();
        showQuickActions();
    }
});

function showQuickActions() {
    const actions = [
        '开始专注',
        '暂停',
        '重置',
        '查看统计'
    ];
    
    const action = prompt('选择操作:\n' + actions.map((a, i) => `${i + 1}. ${a}`).join('\n'));
    const index = parseInt(action) - 1;
    
    if (index >= 0 && index < actions.length) {
        switch (index) {
            case 0:
                document.getElementById('startBtn').click();
                break;
            case 1:
                document.getElementById('pauseBtn').click();
                break;
            case 2:
                document.getElementById('resetBtn').click();
                break;
            case 3:
                alert(`今日专注: ${focusManager.todayFocus}次\n累计时间: ${focusManager.totalFocusTime}分钟\n当前休息: ${focusManager.restCount}次`);
                break;
        }
    }
}
