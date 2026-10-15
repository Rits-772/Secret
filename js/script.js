// Master Application State Engine & Interactions

class AppController {
    constructor() {
        this.currentScreen = 1;
        this.nopeDodgeCount = 0;
        this.scaleYes = 1;
        this.ritvikPhone = ""; // Optional: e.g. "91XXXXXXXXXX"

        this.init();
    }

    init() {
        const setup = () => {
            this.initStars();
            this.initRunawayButton();
            this.initChecklist();
            this.initEnvelope();
            this.initVouchers();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    // Screen Transition Engine
    goToScreen(screenTarget) {
        if (window.soundManager) {
            window.soundManager.playPop();
            window.soundManager.unlockAndPlay();
        }

        const currentId = typeof this.currentScreen === 'string' && this.currentScreen.startsWith('screen-') 
            ? this.currentScreen 
            : `screen-${this.currentScreen}`;
            
        const nextId = typeof screenTarget === 'string' && screenTarget.startsWith('screen-') 
            ? screenTarget 
            : `screen-${screenTarget}`;

        const currentEl = document.getElementById(currentId);
        const nextEl = document.getElementById(nextId);

        if (currentEl) {
            currentEl.style.opacity = '0';
            currentEl.style.transform = 'scale(0.96) translateY(-10px)';
            setTimeout(() => {
                currentEl.classList.remove('active');
                if (nextEl) {
                    nextEl.classList.add('active');
                    setTimeout(() => {
                        nextEl.style.opacity = '1';
                        nextEl.style.transform = 'scale(1) translateY(0)';
                    }, 20);
                }
                this.currentScreen = screenTarget;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 280);
        }
    }

    // Runaway "Nope" Button Physics
    initRunawayButton() {
        const nopeBtn = document.getElementById('btn-nope');
        const yesBtn = document.getElementById('btn-yes');
        if (!nopeBtn || !yesBtn) return;

        const sassyMessages = [
            "Galat jawab! Try again 😋",
            "Error 404: Option disabled for Ayushi 🚫",
            "Stop dodging, you're stuck with me now! 💕",
            "Nope is not an option in our forever chapter ✨",
            "Button self-destructing in 3... 2... 1..."
        ];

        const moveButton = (e) => {
            if (e && e.type === 'touchstart') e.preventDefault();
            this.nopeDodgeCount++;
            if (window.soundManager) window.soundManager.playPop();

            const padding = 20;
            const btnW = nopeBtn.offsetWidth;
            const btnH = nopeBtn.offsetHeight;
            const maxX = window.innerWidth - btnW - padding;
            const maxY = window.innerHeight - btnH - padding;

            const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
            const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

            nopeBtn.style.position = 'fixed';
            nopeBtn.style.left = `${randomX}px`;
            nopeBtn.style.top = `${randomY}px`;

            // Escalate Yes button size
            this.scaleYes = Math.min(this.scaleYes + 0.12, 1.8);
            yesBtn.style.transform = `scale(${this.scaleYes})`;

            // Sassy toast
            const msg = sassyMessages[(this.nopeDodgeCount - 1) % sassyMessages.length];
            this.showToast(msg);
        };

        nopeBtn.addEventListener('mouseenter', moveButton);
        nopeBtn.addEventListener('touchstart', moveButton, { passive: false });
    }

    // Toast Notification
    showToast(message) {
        const toast = document.getElementById('toast-notice');
        if (!toast) return;
        toast.innerText = message;
        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    // Screen 4 Choice Alerts
    handleForgivenessChoice(choice) {
        if (window.soundManager) window.soundManager.unlockAndPlay();
        if (choice === 'forgiven') {
            this.showToast("You're the sweetest soul ever... but VIP pampering is still guaranteed! 🥰");
        } else {
            this.showToast("Fair trial! Initiating Ritvik's Emergency Boyfriend Compensation Protocol v2.0... 💸");
        }
        setTimeout(() => this.goToScreen(5), 1100);
    }

    // Terms & Conditions Checklist
    initChecklist() {
        const items = document.querySelectorAll('.check-item');
        items.forEach(item => {
            item.onclick = () => {
                item.classList.toggle('checked');
                if (window.soundManager) window.soundManager.playPop();
            };
        });
    }

    // Screen 6: Open The Love Vault
    unlockLoveVault() {
        if (!window.gamesEngine.key1Unlocked || !window.gamesEngine.key2Unlocked) {
            this.showToast("🔒 Complete both games above to collect Key 1 & Key 2!");
            return;
        }

        if (window.soundManager) window.soundManager.playVaultUnlock();
        this.triggerFireworks();

        const door = document.getElementById('vault-door');
        if (door) {
            door.style.transition = 'transform 0.7s ease, opacity 0.7s ease';
            door.style.transform = 'scale(1.05)';
            door.style.boxShadow = '0 0 45px rgba(249, 212, 35, 0.75)';
        }

        setTimeout(() => {
            this.goToScreen(7); // Memory Lane
        }, 1000);
    }

    // Screen 5: 3D Flip Polaroids
    togglePolaroid(element) {
        if (window.soundManager) window.soundManager.playPop();
        element.classList.toggle('flipped');
    }

    // Screen 6: Wax Seal & Letter
    initEnvelope() {
        const seal = document.getElementById('wax-seal-btn');
        if (seal) {
            seal.onclick = () => this.breakWaxSeal();
        }
    }

    breakWaxSeal() {
        if (window.soundManager) window.soundManager.playCrack();
        const seal = document.getElementById('wax-seal-btn');
        const envelope = document.getElementById('envelope-wrapper');
        const letter = document.getElementById('letter-parchment');

        if (seal) seal.classList.add('broken');

        setTimeout(() => {
            if (envelope) envelope.style.display = 'none';
            if (letter) {
                letter.style.display = 'block';
                this.typewriterEffect();
                this.triggerFireworks();
            }
        }, 450);
    }

    typewriterEffect() {
        const letterBody = document.getElementById('letter-body-text');
        if (!letterBody) return;

        const fullText = `When we parted ways three years ago, I thought our story was just a chapter that ended too soon. But life has a strange, beautiful way of proving that what’s meant for you will always find its way back.

Having you back in my life isn’t just a second chance—it’s the best thing that ever happened to me. You are the purest, kindest, most wonderful soul I know. The way your face lights up when you dance, the sweet way you look up at me, the warmth you bring into every quiet moment—I’ve loved you for years, but loving you today feels brand new.

On August 20th, we were still finding our steps back to each other, and I couldn't celebrate your birthday as your boyfriend. So consider this little world my promise to you: we may have missed the date on the calendar, but every single day from now on, I am going to make sure you know just how deeply, completely, and endlessly you are cherished.

We lost the old photos, Ayushi, but we didn’t lose each other. And starting today, we’re going to make memories that will last a lifetime.

Happy (Late) Birthday, my love.`;

        letterBody.innerHTML = '';
        let index = 0;
        const speed = 18;

        const type = () => {
            if (index < fullText.length) {
                letterBody.innerHTML += fullText.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                const btn = document.getElementById('btn-to-vouchers');
                if (btn) btn.style.display = 'inline-flex';
            }
        };

        type();
    }

    // Screen 7: Love Vouchers & WhatsApp Direct Claim
    initVouchers() {
        const voucherBtns = document.querySelectorAll('.voucher-btn');
        voucherBtns.forEach(btn => {
            btn.onclick = (e) => {
                const ticket = e.target.closest('.voucher-ticket');
                const title = ticket.getAttribute('data-title');
                const msg = ticket.getAttribute('data-msg');
                this.claimVoucher(ticket, title, msg);
            };
        });
    }

    claimVoucher(ticket, title, prefilledMsg) {
        if (window.soundManager) window.soundManager.playFanfare();
        this.triggerFireworks();

        ticket.classList.add('claimed');
        const stamp = ticket.querySelector('.voucher-stamp');
        if (stamp) {
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            stamp.innerText = `CLAIMED • ${today}`;
        }

        this.showToast(`🎉 You claimed: ${title}! Opening WhatsApp...`);

        setTimeout(() => {
            const encoded = encodeURIComponent(prefilledMsg);
            const waUrl = this.ritvikPhone 
                ? `https://wa.me/${this.ritvikPhone}?text=${encoded}`
                : `https://api.whatsapp.com/send?text=${encoded}`;
            window.open(waUrl, '_blank');
        }, 1100);
    }

    // Background Twinkling Stars & Floating Hearts
    initStars() {
        const bg = document.getElementById('stars-bg');
        if (!bg) return;
        bg.innerHTML = '';

        // Generate 60 starry dots
        for (let i = 0; i < 60; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2.5 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 98}%`;
            star.style.top = `${Math.random() * 98}%`;
            star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
            star.style.animationDelay = `${Math.random() * 3}s`;
            bg.appendChild(star);
        }

        // Generate 12 floating gentle hearts & sparkles
        const icons = ['✨', '🌸', '💖', '⭐', '💫'];
        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerText = icons[Math.floor(Math.random() * icons.length)];
            heart.style.left = `${Math.random() * 94}%`;
            heart.style.setProperty('--duration', `${Math.random() * 6 + 7}s`);
            heart.style.setProperty('--size', `${Math.random() * 12 + 14}px`);
            heart.style.animationDelay = `${Math.random() * 6}s`;
            bg.appendChild(heart);
        }
    }

    triggerFireworks() {
        if (window.particles) {
            window.particles.fireworks();
        } else if (typeof confetti === 'function') {
            confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
                colors: ['#ff4d79', '#ffd166', '#ff758f', '#ffffff', '#e61c47']
            });
        }
    }
}

window.app = new AppController();
