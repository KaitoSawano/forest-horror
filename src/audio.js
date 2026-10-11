export class ForestAudio {
  constructor() {
    this.audio = null;
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.started = true;

    this.audio = new Audio('./assets/night-forest.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.4;

    this.audio.play().catch((err) => {
      console.warn('Audio gagal play:', err);
      this.started = false;
    });
  }

  update(dt) {
    // Tidak ada yang perlu di-update
  }
}
