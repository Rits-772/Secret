// Pure Vanilla High-Performance Fireworks, Confetti & Stardust Particle Engine (No external libraries needed)

class ParticleEngine {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'fx-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '99999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.trails = [];
        this.animating = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initCursorTrail();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initCursorTrail() {
        let lastX = 0, lastY = 0;
        const addSparkle = (x, y) => {
            if (Math.hypot(x - lastX, y - lastY) > 25) {
                lastX = x;
                lastY = y;
                for (let i = 0; i < 2; i++) {
                    this.trails.push({
                        x: x + (Math.random() - 0.5) * 10,
                        y: y + (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 1.5,
                        vy: (Math.random() - 0.5) * 1.5 - 0.5,
                        size: Math.random() * 3 + 1.5,
                        color: Math.random() > 0.5 ? '#ff4d79' : '#ffd166',
                        alpha: 1,
                        decay: 0.035
                    });
                }
                this.startLoop();
            }
        };

        window.addEventListener('mousemove', (e) => addSparkle(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) addSparkle(e.touches[0].clientX, e.touches[0].clientY);
        });
    }

    burst(x, y, count = 60, options = {}) {
        const colors = options.colors || ['#ff4d79', '#ff758f', '#ffd166', '#ffffff', '#ff9ebb', '#c9184a'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 7 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01,
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                shape: Math.random() > 0.4 ? 'circle' : 'heart'
            });
        }
        this.startLoop();
    }

    fireworks() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.45;
        this.burst(cx - 150, cy, 70);
        this.burst(cx + 150, cy, 70);
        setTimeout(() => this.burst(cx, cy - 80, 100), 250);
        setTimeout(() => this.burst(cx - 220, cy + 50, 60), 500);
        setTimeout(() => this.burst(cx + 220, cy + 50, 60), 650);
    }

    startLoop() {
        if (!this.animating) {
            this.animating = true;
            this.render();
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update cursor sparkles
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const p = this.trails[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.trails.splice(i, 1);
                continue;
            }
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Update burst particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.22; // gravity
            p.vx *= 0.98; // air resistance
            p.rotation += p.vRot;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'heart') {
                const s = p.size;
                this.ctx.beginPath();
                this.ctx.moveTo(0, s / 4);
                this.ctx.quadraticCurveTo(0, 0, s / 4, 0);
                this.ctx.quadraticCurveTo(s / 2, 0, s / 2, s / 3);
                this.ctx.quadraticCurveTo(s / 2, 0, (3 * s) / 4, 0);
                this.ctx.quadraticCurveTo(s, 0, s, s / 4);
                this.ctx.quadraticCurveTo(s, s / 2, (3 * s) / 4, (3 * s) / 4);
                this.ctx.lineTo(s / 2, s);
                this.ctx.lineTo(s / 4, (3 * s) / 4);
                this.ctx.quadraticCurveTo(0, s / 2, 0, s / 4);
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0 || this.trails.length > 0) {
            requestAnimationFrame(() => this.render());
        } else {
            this.animating = false;
        }
    }
}

// Global Fireworks Hook
window.particles = new ParticleEngine();
window.confetti = function(opts) {
    const x = (opts && opts.origin && opts.origin.x) ? opts.origin.x * window.innerWidth : window.innerWidth / 2;
    const y = (opts && opts.origin && opts.origin.y) ? opts.origin.y * window.innerHeight : window.innerHeight * 0.5;
    window.particles.burst(x, y, (opts && opts.particleCount) || 80);
};
