export class Minimap {
  constructor(mapBoundary) {
    this.canvas = document.getElementById('minimap');
    this.ctx = this.canvas.getContext('2d');
    this.mapBoundary = mapBoundary;
    this.visible = false;

    this.canvas.width = 360;
    this.canvas.height = 360;

    this.landmarks = {
      house: null,
      graveyard: null,
    };

    this.books = [];

    this.setupToggle();
  }

  setupToggle() {
    const btn = document.getElementById('map-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      this.visible = !this.visible;
      this.canvas.style.display = this.visible ? 'block' : 'none';
    });
  }

  show() {
    const btn = document.getElementById('map-btn');
    if (btn) btn.style.display = 'block';
  }

  setHouse(x, z) {
    this.landmarks.house = { x, z };
  }

  setGraveyard(x, z, radius) {
    this.landmarks.graveyard = { x, z, radius };
  }

  setBooks(books) {
    this.books = books;
  }

  drawParchment() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, '#c9a875');
    grad.addColorStop(0.7, '#b89968');
    grad.addColorStop(1, '#8a6a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random();
      if (r < 0.5) {
        ctx.fillStyle = 'rgba(80, 50, 20, 0.08)';
      } else {
        ctx.fillStyle = 'rgba(220, 180, 120, 0.06)';
      }
      ctx.fillRect(x, y, 1, 1);
    }

    for (let i = 0; i < 15; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 20 + Math.random() * 40;
      const spot = ctx.createRadialGradient(x, y, 0, x, y, r);
      spot.addColorStop(0, 'rgba(80, 40, 10, 0.15)');
      spot.addColorStop(1, 'rgba(80, 40, 10, 0)');
      ctx.fillStyle = spot;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTrees(center, scale) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(60, 40, 20, 0.35)';

    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.mapBoundary;
      const x = center + Math.cos(angle) * dist * scale;
      const y = center + Math.sin(angle) * dist * scale;

      const size = 3 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * 0.6, y + size * 0.5);
      ctx.lineTo(x + size * 0.6, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawRedCircle(x, y, radius, label) {
    const ctx = this.ctx;

    ctx.strokeStyle = 'rgba(180, 40, 40, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (label === 'house') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.3);
      ctx.fillStyle = '#f0e0c0';
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = 2;
      ctx.fillRect(-12, -8, 24, 16);
      ctx.strokeRect(-12, -8, 24, 16);
      ctx.restore();
    } else if (label === 'grave') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.4);
      ctx.fillStyle = '#e0d0b0';
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-10, -2);
      ctx.arc(0, -2, 10, Math.PI, 0);
      ctx.lineTo(10, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPlayerArrow(x, y, yaw) {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);

    // Konversi yaw Three.js ke rotasi canvas 2D
    // yaw = 0  → hadap -Z dunia → di peta hadap atas
    // yaw +=    → putar kiri di dunia, tapi di canvas putar...
    // Kita pakai rotasi = -yaw + PI (biar panah selalu "naik" saat menghadap ke utara peta)
    ctx.rotate(-yaw);

    ctx.fillStyle = '#2ecc40';
    ctx.strokeStyle = '#0a6a10';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-9, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(9, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawCompass(w, h) {
    const ctx = this.ctx;
    const cx = w - 30;
    const cy = h - 30;
    const r = 18;

    ctx.strokeStyle = 'rgba(80, 40, 10, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(60, 30, 10, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(120, 30, 30, 0.9)';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', cx, cy - r - 6);
  }

  update(state) {
    if (!this.visible) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const center = w / 2;
    const scale = w / (this.mapBoundary * 2.2);

    this.drawParchment();
    this.drawTrees(center, scale);

    if (this.landmarks.house) {
      const hx = center + this.landmarks.house.x * scale;
      const hz = center + this.landmarks.house.z * scale;
      this.drawRedCircle(hx, hz, 28, 'house');
    }

    if (this.landmarks.graveyard) {
      const gx = center + this.landmarks.graveyard.x * scale;
      const gz = center + this.landmarks.graveyard.z * scale;
      this.drawRedCircle(gx, gz, 32, 'grave');
    }

    for (const book of this.books) {
      if (book.collected) continue;
      const bx = center + book.mesh.position.x * scale;
      const bz = center + book.mesh.position.z * scale;

      ctx.strokeStyle = 'rgba(180, 40, 40, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(bx, bz, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const px = center + state.playerPos.x * scale;
    const pz = center + state.playerPos.z * scale;
    this.drawPlayerArrow(px, pz, state.yaw || 0);

    this.drawCompass(w, h);
  }
}
