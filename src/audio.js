export class ForestAudio {
  constructor() {
    this.audio = null;
    this.started = false;
    this.pendingStart = false;
  }

  // Coba play langsung saat game load
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
        // Browser blokir autoplay — tunggu user gesture
        this.pendingStart = true;
      });
    }
  }

  // Dipanggil saat user gesture pertama
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

  update(dt) {
    // Tidak ada yang perlu di-update
  }
}
