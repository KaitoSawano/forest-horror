export class HUD {
  constructor() {
    this.posEl = document.getElementById('hud-pos');
    this.timeEl = document.getElementById('hud-time');
    this.hpEl = document.getElementById('hud-hp');
    this.booksEl = document.getElementById('hud-books');
  }

  update(state) {
    const h = Math.floor(state.time / 60);
    const m = Math.floor(state.time % 60);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    if (this.posEl) {
      this.posEl.textContent =
        `X: ${state.playerPos.x.toFixed(0)} | ` +
        `Z: ${state.playerPos.z.toFixed(0)} | ` +
        `Y: ${state.playerPos.y.toFixed(1)}`;
    }

    if (this.timeEl) {
      this.timeEl.textContent = timeStr;
    }

    if (this.hpEl) {
      this.hpEl.textContent = `HP: ${Math.floor(state.hp)}/100`;
    }

    if (this.booksEl && state.books) {
      this.booksEl.textContent = `Buku: ${state.books.collected}/${state.books.total}`;
    }
  }
}
