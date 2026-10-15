// Modern, Zero-Glitch Mini-Games Engine (No file:// CORS issues, High-DPI Canvas)

class GamesEngine {
    constructor() {
        this.key1Unlocked = false;
        this.key2Unlocked = false;
        this.game1Running = false;
        this.game1Score = 0;
        this.game1Target = 5;
        this.game1Items = [];
        this.playerX = 170;
        this.basketWidth = 72;
        this.basketHeight = 26;
        this.animId = null;

        // Scratch card grid tracking (100% immune to file:// getImageData security blocks)
        this.scratchCells = new Set();
        this.totalRequiredCells = 16; // Out of 48 grid cells
    }

    // ==========================================
    // MINI-GAME 1: DANCE KEEPSAKES RUSH
    // ==========================================
    startCatchGame() {
        const modal = document.getElementById('game1-modal');
        const canvas = document.getElementById('game-canvas');
        if (!modal || !canvas) return;

        modal.classList.add('open');
        this.game1Score = 0;
        this.game1Items = [];
        this.game1Running = true;
        this.updateHUD();

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayW = Math.min(340, window.innerWidth - 60);
        const displayH = 320;

        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
        ctx.scale(dpr, dpr);

        this.playerX = displayW / 2;

        const updateBasket = (clientX) => {
            if (!this.game1Running) return;
            const cRect = canvas.getBoundingClientRect();
            const relX = clientX - cRect.left;
            this.playerX = Math.max(this.basketWidth / 2, Math.min(displayW - this.basketWidth / 2, relX));
        };

        this.moveHandler = (e) => updateBasket(e.clientX);
        this.touchHandler = (e) => {
            if (e.touches && e.touches[0]) {
                e.preventDefault();
                updateBasket(e.touches[0].clientX);
            }
        };

        window.addEventListener('mousemove', this.moveHandler);
        window.addEventListener('touchmove', this.touchHandler, { passive: false });

        let lastSpawn = 0;
        const emojis = ['💃', '💖', '☕', '🎁', '✨'];

        const loop = (timestamp) => {
            if (!this.game1Running) return;

            ctx.clearRect(0, 0, displayW, displayH);

            // Spawn falling keepsakes
            if (timestamp - lastSpawn > 550) {
                lastSpawn = timestamp;
                const isBad = Math.random() < 0.18;
                this.game1Items.push({
                    x: Math.random() * (displayW - 40) + 20,
                    y: -20,
                    speed: Math.random() * 1.8 + 2.4,
                    char: isBad ? '⏰' : emojis[Math.floor(Math.random() * emojis.length)],
                    isBad: isBad,
                    rot: (Math.random() - 0.5) * 0.2
                });
            }

            // Draw modern glowing basket
            const basketY = displayH - 42;
            const bx = this.playerX - this.basketWidth / 2;

            ctx.save();
            ctx.shadowColor = 'rgba(255, 77, 121, 0.6)';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ff4d79';
            ctx.beginPath();
            ctx.roundRect 
                ? ctx.roundRect(bx, basketY, this.basketWidth, this.basketHeight, 10)
                : ctx.rect(bx, basketY, this.basketWidth, this.basketHeight);
            ctx.fill();

            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText('🧺 Catch', this.playerX, basketY + 18);
            ctx.restore();

            // Draw & update items
            for (let i = this.game1Items.length - 1; i >= 0; i--) {
                const it = this.game1Items[i];
                it.y += it.speed;

                ctx.save();
                ctx.font = '26px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(it.char, it.x, it.y);
                ctx.restore();

                // Catch detection
                if (it.y >= basketY - 10 && it.y <= basketY + this.basketHeight + 10 &&
                    it.x >= bx - 10 && it.x <= bx + this.basketWidth + 10) {
                    
                    if (it.isBad) {
                        this.game1Score = Math.max(0, this.game1Score - 1);
                        if (window.soundManager) window.soundManager.playPop();
                        this.shakeCanvas(canvas);
                    } else {
                        this.game1Score++;
                        if (window.soundManager) window.soundManager.playChime();
                        if (window.particles) window.particles.burst(cRect.left + it.x, cRect.top + it.y, 18);
                    }
                    this.game1Items.splice(i, 1);
                    this.updateHUD();

                    if (this.game1Score >= this.game1Target) {
                        this.finishCatchGame(true);
                        return;
                    }
                    continue;
                }

                if (it.y > displayH + 30) {
                    this.game1Items.splice(i, 1);
                }
            }

            this.animId = requestAnimationFrame(loop);
        };

        this.animId = requestAnimationFrame(loop);
    }

    shakeCanvas(canvas) {
        canvas.style.transform = 'translateX(8px)';
        setTimeout(() => canvas.style.transform = 'translateX(-8px)', 60);
        setTimeout(() => canvas.style.transform = 'translateX(0)', 120);
    }

    updateHUD() {
        const hud = document.getElementById('game1-score');
        if (hud) hud.innerText = `${this.game1Score} / ${this.game1Target}`;
    }

    finishCatchGame(won) {
        this.game1Running = false;
        cancelAnimationFrame(this.animId);
        window.removeEventListener('mousemove', this.moveHandler);
        window.removeEventListener('touchmove', this.touchHandler);

        if (won) {
            this.key1Unlocked = true;
            if (window.soundManager) window.soundManager.playFanfare();
            if (window.particles) window.particles.fireworks();

            const slot = document.getElementById('key-slot-1');
            if (slot) {
                slot.classList.add('unlocked');
                slot.querySelector('.slot-icon').innerText = '🔑';
                slot.querySelector('.slot-status').innerText = 'UNLOCKED! ✨';
            }

            setTimeout(() => {
                document.getElementById('game1-modal').classList.remove('open');
                if (window.app) window.app.showToast('🎉 Key 1 Granted! Dance reflexes: 10/10!');
                this.checkVaultReady();
            }, 800);
        }
    }

    closeCatchGame() {
        this.game1Running = false;
        cancelAnimationFrame(this.animId);
        window.removeEventListener('mousemove', this.moveHandler);
        window.removeEventListener('touchmove', this.touchHandler);
        document.getElementById('game1-modal').classList.remove('open');
    }

    // ==========================================
    // MINI-GAME 2: SHIMMERING SCRATCH CARD
    // ==========================================
    openScratchModal() {
        const modal = document.getElementById('scratch-modal');
        const canvas = document.getElementById('scratch-canvas');
        if (!modal || !canvas) return;

        modal.classList.add('open');
        this.scratchCells.clear();
        this.initFoil(canvas);
    }

    closeScratchModal() {
        document.getElementById('scratch-modal').classList.remove('open');
    }

    initFoil(canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 300;
        const h = 180;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.style.opacity = '1';
        ctx.scale(dpr, dpr);

        // Metallic rose-gold foil
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#d49ba8');
        grad.addColorStop(0.25, '#f7d6e0');
        grad.addColorStop(0.5, '#e5a4b8');
        grad.addColorStop(0.75, '#fad2e1');
        grad.addColorStop(1, '#c07e93');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Sparkle shimmer stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Text instruction
        ctx.fillStyle = '#611f37';
        ctx.font = 'bold 15px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Scratch here with your finger ✨', w / 2, h / 2);

        let isScratching = false;

        const scratchAt = (clientX, clientY) => {
            if (this.key2Unlocked) return;
            const rect = canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();

            // Track coverage using 8x6 grid (immune to file:// security CORS blocks)
            const col = Math.floor((x / w) * 8);
            const row = Math.floor((y / h) * 6);
            if (col >= 0 && col < 8 && row >= 0 && row < 6) {
                this.scratchCells.add(`${col},${row}`);
                if (this.scratchCells.size >= this.totalRequiredCells) {
                    this.revealScratchKey();
                }
            }
        };

        canvas.onmousedown = (e) => {
            isScratching = true;
            scratchAt(e.clientX, e.clientY);
        };
        window.onmouseup = () => isScratching = false;
        canvas.onmousemove = (e) => {
            if (isScratching) scratchAt(e.clientX, e.clientY);
        };

        canvas.ontouchstart = (e) => {
            e.preventDefault();
            isScratching = true;
            if (e.touches[0]) scratchAt(e.touches[0].clientX, e.touches[0].clientY);
        };
        window.ontouchend = () => isScratching = false;
        canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (isScratching && e.touches[0]) scratchAt(e.touches[0].clientX, e.touches[0].clientY);
        };
    }

    revealScratchKey() {
        if (this.key2Unlocked) return;
        this.key2Unlocked = true;
        const canvas = document.getElementById('scratch-canvas');
        if (canvas) {
            canvas.style.transition = 'opacity 0.6s ease';
            canvas.style.opacity = '0';
        }

        if (window.soundManager) window.soundManager.playFanfare();
        if (window.particles) window.particles.fireworks();

        const slot = document.getElementById('key-slot-2');
        if (slot) {
            slot.classList.add('unlocked');
            slot.querySelector('.slot-icon').innerText = '🔑';
            slot.querySelector('.slot-status').innerText = 'UNLOCKED! ✨';
        }

        setTimeout(() => {
            this.closeScratchModal();
            if (window.app) window.app.showToast('🎉 Key 2 Granted! Forever unlocked!');
            this.checkVaultReady();
        }, 900);
    }

    checkVaultReady() {
        if (this.key1Unlocked && this.key2Unlocked) {
            const vaultBtn = document.getElementById('btn-open-vault');
            if (vaultBtn) {
                vaultBtn.removeAttribute('disabled');
                vaultBtn.classList.remove('btn-secondary');
                vaultBtn.classList.add('btn-primary');
                vaultBtn.innerHTML = '✨ Open The Love Vault 🗝️';
            }
        }
    }
}

window.gamesEngine = new GamesEngine();
