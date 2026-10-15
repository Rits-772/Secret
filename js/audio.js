// Audio & Sound Effects Manager using Web Audio API + HTML5 Audio

class SoundManager {
    constructor() {
        this.ctx = null;
        this.bgAudio = new Audio('assets/audio/rehbara.mp3');
        this.bgAudio.loop = true;
        this.bgAudio.volume = 0.65;
        this.isPlaying = false;
        this.hasUnlocked = false;

        this.initVinylControls();
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    unlockAndPlay() {
        this.initContext();
        if (!this.hasUnlocked) {
            this.hasUnlocked = true;
            this.playBgMusic();
        }
    }

    playBgMusic() {
        this.bgAudio.play().then(() => {
            this.isPlaying = true;
            this.updateVinylUI(true);
        }).catch(err => {
            console.log("Audio autoplay prevented, awaiting user gesture.");
        });
    }

    pauseBgMusic() {
        this.bgAudio.pause();
        this.isPlaying = false;
        this.updateVinylUI(false);
    }

    toggleBgMusic() {
        if (this.isPlaying) {
            this.pauseBgMusic();
        } else {
            this.playBgMusic();
        }
    }

    updateVinylUI(playing) {
        const vinyl = document.getElementById('vinyl-disc');
        const playBtn = document.getElementById('music-toggle-btn');
        if (vinyl) {
            if (playing) vinyl.classList.add('spinning');
            else vinyl.classList.remove('spinning');
        }
        if (playBtn) {
            playBtn.innerHTML = playing ? '❚❚' : '▶';
        }
    }

    initVinylControls() {
        document.addEventListener('DOMContentLoaded', () => {
            const toggleBtn = document.getElementById('music-toggle-btn');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.initContext();
                    this.toggleBgMusic();
                });
            }
        });
    }

    // Synthesized Sound Effects
    playPop() {
        try {
            this.initContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (e) {}
    }

    playChime() {
        try {
            this.initContext();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08); // A5
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.35);
        } catch (e) {}
    }

    playVaultUnlock() {
        try {
            this.initContext();
            // Mechanical clunk followed by angelic chime chord
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.07));
                gain.gain.setValueAtTime(0.22, this.ctx.currentTime + (idx * 0.07));
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (idx * 0.07) + 0.8);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + (idx * 0.07));
                osc.stop(this.ctx.currentTime + (idx * 0.07) + 0.8);
            });
        } catch (e) {}
    }

    playCrack() {
        try {
            this.initContext();
            // Noise burst for wax break
            const bufferSize = this.ctx.sampleRate * 0.12;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start();
        } catch (e) {}
    }

    playFanfare() {
        try {
            this.initContext();
            const chord = [440, 554.37, 659.25, 880];
            chord.forEach((freq) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.7);
            });
        } catch (e) {}
    }
}

window.soundManager = new SoundManager();
