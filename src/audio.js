export class ForestAudio {
  constructor() {
    this.audio = null;
    this.started = false;
    this.pendingStart = false;

    // Pause saat app jadi background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else if (this.started) {
        this.resume();
      }
    });

    // Pause saat window blur (buat kasus tertentu)
    window.addEventListener('blur', () => this.pause());
    window.addEventListener('focus', () => {
      if (this.started) this.resume();
    });
  }

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

  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  resume() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  update(dt) {
    // Tidak ada yang perlu di-update
  }
}
