export class ForestAudio {
  constructor() {
    this.audio = null;
    this.menuMusic = null;
    this.started = false;
    this.menuStarted = false;
    this.pendingStart = false;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAll();
      } else {
        this.resumeAll();
      }
    });

    window.addEventListener('blur', () => this.pauseAll());
    window.addEventListener('focus', () => this.resumeAll());
  }

  // ===== MUSIK MENU =====
  startMenuMusic() {
    if (this.menuStarted) return;

    if (!this.menuMusic) {
      this.menuMusic = new Audio('./assets/sound/lobby-creepy.mp3');
      this.menuMusic.loop = true;
      this.menuMusic.volume = 0.35;
      this.menuMusic.preload = 'auto';
    }

    this.menuMusic.play().then(() => {
      this.menuStarted = true;
    }).catch(() => {
      // Autoplay diblokir — tunggu gesture
    });
  }

  stopMenuMusic() {
    if (this.menuMusic && !this.menuMusic.paused) {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
      this.menuStarted = false;
    }
  }

  // ===== AMBIENCE HUTAN =====
  tryStart() {
    if (this.started) return;
    if (!this.audio) {
      this.audio = new Audio('./assets/sound/night-forest.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.4;
      this.audio.preload = 'auto';
    }

    const promise = this.audio.play();
    if (promise) {
      promise.then(() => {
        this.started = true;
      }).catch(() => {
        this.pendingStart = true;
      });
    }
  }

  forceStart() {
    if (this.started) return;
    if (!this.audio) {
      this.audio = new Audio('./assets/sound/night-forest.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.4;
      this.audio.preload = 'auto';
    }

    this.audio.play().then(() => {
      this.started = true;
      this.pendingStart = false;
    }).catch((err) => {
      console.warn('Audio gagal play:', err);
    });
  }

  // ===== KONTROL =====
  pauseAll() {
    if (this.menuMusic && !this.menuMusic.paused) this.menuMusic.pause();
    if (this.audio && !this.audio.paused) this.audio.pause();
  }

  resumeAll() {
    if (this.menuStarted && this.menuMusic && this.menuMusic.paused) {
      this.menuMusic.play().catch(() => {});
    }
    if (this.started && this.audio && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  update(dt) {}
}
