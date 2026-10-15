// Upgraded Games Engine: 
// 1. Memory Match Cards (Replaces falling emoji catcher - 100% smooth, interactive & romantic)
// 2. Silky-Smooth Interpolated Foil Scratcher

class GamesEngine {
    constructor() {
        this.key1Unlocked = false;
        this.key2Unlocked = false;

        // Memory Match state
        this.memoryCards = [
            { id: 1, pair: 'A', icon: '💃', title: 'Dance Queen' },
            { id: 2, pair: 'A', icon: '💃', title: 'Dance Queen' },
            { id: 3, pair: 'B', icon: '☕', title: 'Boba Date' },
            { id: 4, pair: 'B', icon: '☕', title: 'Boba Date' },
            { id: 5, pair: 'C', icon: '💖', title: 'Forever Us' },
            { id: 6, pair: 'C', icon: '💖', title: 'Forever Us' },
        ];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.canFlip = true;

        // Scratch card state
        this.scratchCells = new Set();
        this.scratchThreshold = 14; // Quick smooth reveal
        this.lastX = null;
        this.lastY = null;
    }

    // ==========================================
    // MINI-GAME 1: LOVE MEMORY MATCH (Replaced Emoji Catcher)
    // ==========================================
    startMemoryGame() {
        const modal = document.getElementById('game1-modal');
        if (!modal) return;
        modal.classList.add('open');

        this.matchedPairs = 0;
        this.flippedCards = [];
        this.canFlip = true;
        this.renderMemoryBoard();
    }

    closeMemoryGame() {
        const modal = document.getElementById('game1-modal');
        if (modal) modal.classList.remove('open');
    }

    renderMemoryBoard() {
        const grid = document.getElementById('memory-grid');
        if (!grid) return;
        grid.innerHTML = '';

        // Shuffle cards
        const shuffled = [...this.memoryCards].sort(() => Math.random() - 0.5);

        shuffled.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'mem-card';
            cardEl.dataset.pair = card.pair;
            cardEl.dataset.index = index;

            cardEl.innerHTML = `
                <div class="mem-card-inner">
                    <div class="mem-card-front">✨</div>
                    <div class="mem-card-back">
                        <span class="mem-icon">${card.icon}</span>
                        <span class="mem-label">${card.title}</span>
                    </div>
                </div>
            `;

            cardEl.onclick = () => this.handleCardClick(cardEl);
            grid.appendChild(cardEl);
        });

        this.updateMemoryHUD();
    }

    handleCardClick(cardEl) {
        if (!this.canFlip || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
            return;
        }

        if (window.soundManager) window.soundManager.playPop();
        cardEl.classList.add('flipped');
        this.flippedCards.push(cardEl);

        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            const [c1, c2] = this.flippedCards;

            if (c1.dataset.pair === c2.dataset.pair) {
                // Match!
                setTimeout(() => {
                    c1.classList.add('matched');
                    c2.classList.add('matched');
                    this.matchedPairs++;
                    if (window.soundManager) window.soundManager.playChime();
                    this.flippedCards = [];
                    this.canFlip = true;
                    this.updateMemoryHUD();

                    if (this.matchedPairs === 3) {
                        this.finishMemoryGame();
                    }
                }, 400);
            } else {
                // No match, flip back
                setTimeout(() => {
                    c1.classList.remove('flipped');
                    c2.classList.remove('flipped');
                    this.flippedCards = [];
                    this.canFlip = true;
                }, 850);
            }
        }
    }

    updateMemoryHUD() {
        const hud = document.getElementById('memory-score');
        if (hud) hud.innerText = `${this.matchedPairs} / 3 Pairs`;
    }

    finishMemoryGame() {
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
            this.closeMemoryGame();
            if (window.app) window.app.showToast('🎉 Key 1 Granted! Perfect Memory!');
            this.checkVaultReady();
        }, 900);
    }

    // ==========================================
    // MINI-GAME 2: BUTTERY-SMOOTH SCRATCH CARD
    // ==========================================
    openScratchModal() {
        const modal = document.getElementById('scratch-modal');
        const canvas = document.getElementById('scratch-canvas');
        if (!modal || !canvas) return;

        modal.classList.add('open');
        this.scratchCells.clear();
        this.lastX = null;
        this.lastY = null;
        this.initSmoothScratchFoil(canvas);
    }

    closeScratchModal() {
        const modal = document.getElementById('scratch-modal');
        if (modal) modal.classList.remove('open');
    }

    initSmoothScratchFoil(canvas) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = 320;
        const h = 190;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        canvas.style.opacity = '1';
        ctx.scale(dpr, dpr);

        // Metallic rose-gold foil gradient
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#d89ea8');
        grad.addColorStop(0.2, '#fbe0e8');
        grad.addColorStop(0.4, '#e8a8b8');
        grad.addColorStop(0.7, '#fadee7');
        grad.addColorStop(1, '#c78598');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Gold glitter pattern overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 28; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Instructional text
        ctx.fillStyle = '#611f37';
        ctx.font = 'bold 15px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨ Swipe to scratch & reveal ✨', w / 2, h / 2);

        let isDown = false;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const scratchStroke = (currentPos) => {
            if (this.key2Unlocked) return;

            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 42;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            if (this.lastX !== null && this.lastY !== null) {
                ctx.moveTo(this.lastX, this.lastY);
                ctx.lineTo(currentPos.x, currentPos.y);
            } else {
                ctx.arc(currentPos.x, currentPos.y, 21, 0, Math.PI * 2);
            }
            ctx.stroke();

            this.lastX = currentPos.x;
            this.lastY = currentPos.y;

            // Track coverage with smooth grid
            const col = Math.floor((currentPos.x / w) * 8);
            const row = Math.floor((currentPos.y / h) * 6);
            if (col >= 0 && col < 8 && row >= 0 && row < 6) {
                this.scratchCells.add(`${col},${row}`);
                if (this.scratchCells.size >= this.scratchThreshold) {
                    this.revealScratchKey();
                }
            }
        };

        canvas.onmousedown = (e) => {
            isDown = true;
            this.lastX = null;
            this.lastY = null;
            scratchStroke(getPos(e));
        };
        window.onmouseup = () => {
            isDown = false;
            this.lastX = null;
            this.lastY = null;
        };
        canvas.onmousemove = (e) => {
            if (isDown) scratchStroke(getPos(e));
        };

        canvas.ontouchstart = (e) => {
            e.preventDefault();
            isDown = true;
            this.lastX = null;
            this.lastY = null;
            if (e.touches[0]) scratchStroke(getPos(e));
        };
        window.ontouchend = () => {
            isDown = false;
            this.lastX = null;
            this.lastY = null;
        };
        canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (isDown && e.touches[0]) scratchStroke(getPos(e));
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
            if (window.app) window.app.showToast('🎉 Key 2 Granted! August 20th Forever!');
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
