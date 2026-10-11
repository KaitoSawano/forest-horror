export class HUD {
  constructor() {
    this.posEl = document.getElementById('hud-pos');
    this.timeEl = document.getElementById('hud-time');
    this.hpEl = document.getElementById('hud-hp');
  }

  update(state) {
    const h = Math.floor(state.time / 60);
    const m = Math.floor(state.time % 60);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    this.posEl.textContent = `X: ${state.playerPos.x.toFixed(0)} | Z: ${state.playerPos.z.toFixed(0)} | Y: ${state.playerPos.y.toFixed(1)}`;
    this.timeEl.textContent = timeStr;
    this.hpEl.textContent = `HP: ${Math.floor(state.hp)}/100`;

    if (state.hp < 30) {
      this.hpEl.classList.add('low-hp');
    } else {
      this.hpEl.classList.remove('low-hp');
    }
  }
}
