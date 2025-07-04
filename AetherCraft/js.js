// 使用模块化方式组织代码
(function() {
    // 初始化函数
    document.addEventListener('DOMContentLoaded', () => {
        // 显示加载界面
        const loader = document.getElementById('loader');
        
        // 设置15秒超时定时器
        const timeout = setTimeout(() => {
            console.warn('资源加载超时，强制显示页面');
            forceShowPage();
        }, 15000); // 15秒超时
        
        // 强制显示页面的函数
        const forceShowPage = () => {
            clearTimeout(timeout);
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
            
            // 初始化基本功能
            ProgressBar.init();
            Theme.init();
            DigitalClock.init();
            
            // 显示加载超时提示
            const timeoutMessage = document.createElement('div');
            timeoutMessage.className = 'load-timeout-message';
            timeoutMessage.innerHTML = `
                <div class="timeout-content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>部分资源加载缓慢，页面可能不完整</p>
                    <button class="btn" onclick="this.parentNode.parentNode.remove()">我知道了</button>
                </div>
            `;
            document.body.appendChild(timeoutMessage);
        };
        
        // 等待所有关键资源加载完成
        Promise.all([
            // 等待字体加载
            document.fonts.ready,
            
            // 等待图标库加载
            new Promise((resolve) => {
                const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
                if (fontAwesomeLink) {
                    if (fontAwesomeLink.sheet) {
                        resolve(); // 如果已经加载完成
                    } else {
                        fontAwesomeLink.onload = resolve;
                    }
                } else {
                    resolve();
                }
            }),
            
            // 等待Google字体加载
            new Promise((resolve) => {
                const googleFontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
                if (googleFontLink) {
                    if (googleFontLink.sheet) {
                        resolve(); // 如果已经加载完成
                    } else {
                        googleFontLink.onload = resolve;
                    }
                } else {
                    resolve();
                }
            }),
            
            // 等待粒子画布初始化
            new Promise((resolve) => setTimeout(resolve, 500)),
            
            // 等待CSS文件加载
            new Promise((resolve) => {
                const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                const cssLoaded = cssLinks.every(link => link.sheet);
                
                if (cssLoaded) {
                    resolve();
                } else {
                    let loadedCount = 0;
                    cssLinks.forEach(link => {
                        if (link.sheet) {
                            loadedCount++;
                        } else {
                            link.onload = () => {
                                loadedCount++;
                                if (loadedCount === cssLinks.length) resolve();
                            };
                        }
                    });
                    
                    // 如果所有CSS都已加载或没有CSS链接
                    if (loadedCount === cssLinks.length) resolve();
                }
            })
        ]).then(() => {
            // 清除超时定时器
            clearTimeout(timeout);
            
            // 所有资源加载完成后，隐藏加载界面
            loader.classList.add('hidden');
            
            // 初始化其他功能
            ProgressBar.init();
            Theme.init();
            CardAnimation.init();
            Hitokoto.init();
            DigitalClock.init();
            Particles.init();
            Navigation.init();
            ScrollSpy.init();
            
            // 移除加载界面（可选）
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }).catch((error) => {
            console.error('资源加载出错:', error);
            clearTimeout(timeout);
            forceShowPage();
        });
    });
    
    // 进度条模块
    const ProgressBar = {
        init() {
            const progressBar = document.querySelector('.progress-bar');
            if (!progressBar) return;
            
            progressBar.style.width = '100%';
            setTimeout(() => progressBar.style.opacity = '0', 500);
            
            // 监听页面滚动
            window.addEventListener('scroll', this.handleScroll);
        },
        
        handleScroll() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            const progressBar = document.querySelector('.progress-bar');
            
            if (progressBar) {
                progressBar.style.width = scrolled + '%';
                progressBar.style.opacity = '1';
            }
        }
    };
    
    // 主题切换模块
    const Theme = {
        init() {
            this.themeToggle = document.getElementById('theme-toggle');
            if (!this.themeToggle) return;
            
            this.currentTheme = localStorage.getItem('theme') || 
                               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.body.dataset.theme = this.currentTheme;
            this.updateIcon();
            
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        },
        
        toggleTheme() {
            this.currentTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            document.body.dataset.theme = this.currentTheme;
            localStorage.setItem('theme', this.currentTheme);
            this.updateIcon();
            
            // 重新初始化粒子以适应新主题
            if (Particles.animationId) {
                Particles.init();
            }
        },
        
        updateIcon() {
            if (this.themeToggle) {
                this.themeToggle.innerHTML = `<i class="fas ${this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
            }
        }
    };
    
    // 卡片动画模块
    const CardAnimation = {
        init() {
            this.cards = document.querySelectorAll('.card');
            if (this.cards.length === 0) return;
            
            this.observerOptions = {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            };
            
            this.revealObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        const delay = index * 150;
                        
                        setTimeout(() => {
                            card.classList.add('reveal');
                            card.style.transitionDelay = `${delay}ms`;
                        }, 100);
                        
                        this.revealObserver.unobserve(card);
                    }
                });
            }, this.observerOptions);
            
            this.cards.forEach(card => {
                card.style.transition = 'opacity 0.6s, transform 0.6s, box-shadow 0.3s';
                this.revealObserver.observe(card);
                
                // 添加悬停效果
                card.addEventListener('mousemove', this.handleCardHover);
                card.addEventListener('mouseleave', this.handleCardLeave);
            });
        },
        
        handleCardHover(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.transform = `
                perspective(1000px)
                rotateX(${(y - rect.height/2) / -20}deg)
                rotateY(${(x - rect.width/2) / 20}deg)
                scale(1.02)
            `;
        },
        
        handleCardLeave() {
            this.style.transform = 'none';
        }
    };
    
    // 一言模块
    const Hitokoto = {
        init() {
            this.hitokotoText = document.getElementById('hitokoto-text');
            if (!this.hitokotoText) return;
            
            this.fetchHitokoto();
        },
        
        fetchHitokoto() {
            // 设置5秒超时
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('请求超时')), 5000)
            );
            
            Promise.race([
                fetch('https://v1.hitokoto.cn'),
                timeoutPromise
            ])
            .then(response => {
                if (!response.ok) throw new Error('网络响应不正常');
                return response.json();
            })
            .then(data => {
                this.hitokotoText.textContent = `「${data.hitokoto}」`;
                if (data.from) {
                    this.hitokotoText.textContent += ` —— ${data.from}`;
                }
            })
            .catch(() => {
                this.hitokotoText.textContent = '「世界は美しくなんかない、そしてそれ故に美しい」';
            });
        }
    };
    
    // 数字时钟模块
    const DigitalClock = {
        init() {
            this.clockElement = document.getElementById('digital-clock');
            if (!this.clockElement) return;
            
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
        },
        
        updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.clockElement.textContent = `${hours}:${minutes}:${seconds}`;
        }
    };
    
    // 粒子动画模块
    const Particles = {
        init() {
            this.canvas = document.getElementById('particles');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;
            
            this.resizeCanvas();
            this.createParticles();
            this.animate();
            
            window.addEventListener('resize', () => this.handleResize());
        },
        
        resizeCanvas() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },
        
        createParticles() {
            const particleCount = Math.floor(window.innerWidth / 20);
            this.particles = Array(particleCount).fill().map(() => this.createParticle());
        },
        
        createParticle() {
            const particle = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 3 - 1.5,
                opacity: Math.random() * 0.5 + 0.3,
                canvas: this.canvas
            };
            
            particle.reset = function() {
                this.x = Math.random() * this.canvas.width;
                this.y = Math.random() * this.canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.opacity = Math.random() * 0.5 + 0.3;
            };
            
            particle.update = function() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x > this.canvas.width + 20 || this.x < -20 || 
                    this.y > this.canvas.height + 20 || this.y < -20) {
                    this.reset();
                }
            };
            
            particle.draw = function(ctx) {
                const primaryColor = getComputedStyle(document.body)
                    .getPropertyValue('--primary-color').trim();
                ctx.fillStyle = `rgba(${hexToRgb(primaryColor)}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            };
            
            return particle;
        },
        
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles.forEach(particle => {
                particle.update();
                particle.draw(this.ctx);
            });
            
            this.animationId = requestAnimationFrame(() => this.animate());
        },
        
        handleResize() {
            cancelAnimationFrame(this.animationId);
            this.resizeCanvas();
            this.createParticles();
            this.animate();
        }
    };
    
    // 导航栏模块
    const Navigation = {
        init() {
            this.navbar = document.querySelector('.navbar');
            if (!this.navbar) return;
            
            this.updateNavHeight();
            window.addEventListener('resize', () => this.updateNavHeight());
            
            // 主题切换时更新
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    setTimeout(() => this.updateNavHeight(), 300);
                });
            }
            
            // 使用MutationObserver检测导航栏变化
            const observer = new MutationObserver(() => this.updateNavHeight());
            observer.observe(this.navbar, {
                attributes: true,
                attributeFilter: ['class']
            });
        },
        
        updateNavHeight() {
            const navHeight = this.navbar.offsetHeight;
            document.documentElement.style.setProperty('--nav-height', `${navHeight}px`);
        }
    };
    
    // 滚动监听模块
    const ScrollSpy = {
        init() {
            this.sections = document.querySelectorAll('section');
            this.navLinks = document.querySelectorAll('.nav-link');
            
            if (this.sections.length === 0 || this.navLinks.length === 0) return;
            
            window.addEventListener('scroll', () => this.handleScroll());
        },
        
        handleScroll() {
            let current = '';
            
            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    };
    
    // 辅助函数：十六进制颜色转RGB
    function hexToRgb(hex) {
        // 移除#字符
        hex = hex.replace('#', '');
        
        // 解析RGB值
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
})();
