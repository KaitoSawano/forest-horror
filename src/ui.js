export class HUD {
  constructor() {
    this.el = document.createElement('div');
    this.el.style.cssText = `
      position: fixed; top: 20px; left: 20px;
      color: #fff; font-family: monospace; font-size: 13px;
      background: rgba(0,0,0,0.5); padding: 8px 12px;
      border-radius: 6px; pointer-events: none; z-index: 100;
      max-width: 90vw;
    `;
    document.body.appendChild(this.el);
  }

  update(state) {
    const h = Math.floor(state.time / 60);
    const m = Math.floor(state.time % 60);
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    this.el.textContent =
      `X: ${state.playerPos.x.toFixed(0)} | ` +
      `Z: ${state.playerPos.z.toFixed(0)} | ` +
      `Y: ${state.playerPos.y.toFixed(1)} | ` +
      `${timeStr} | HP: ${Math.floor(state.hp)}/100`;
  }
}
