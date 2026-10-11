import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class PlayerControls {
  constructor(camera, domElement, obstacles, mapBoundary) {
    this.camera = camera;
    this.obstacles = obstacles || [];
    this.mapBoundary = mapBoundary || 240;
    this.keys = {};
    this.yaw = 0;
    this.pitch = 0;
    this.moveX = 0;
    this.moveY = 0;

    window.addEventListener('keydown', (e) => (this.keys[e.code] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.code] = false));

    this.touchId = null;
    this.lastTouch = { x: 0, y: 0 };

    document.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.onTouchEnd(e));

    this.setupJoystick();
  }

  setupJoystick() {
    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    if (!base || !knob) return;

    const maxDist = 40;
    let stickId = null;
    let center = { x: 0, y: 0 };

    const start = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const t = e.changedTouches[0];
      const rect = base.getBoundingClientRect();
      center.x = rect.left + rect.width / 2;
      center.y = rect.top + rect.height / 2;
      stickId = t.identifier;
    };

    const move = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== stickId) continue;
        e.preventDefault();
        e.stopPropagation();
        let dx = t.clientX - center.x;
        let dy = t.clientY - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
        }
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        this.moveX = dx / maxDist;
        this.moveY = dy / maxDist;
      }
    };

    const end = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier !== stickId) continue;
        stickId = null;
        knob.style.transform = 'translate(-50%, -50%)';
        this.moveX = 0;
        this.moveY = 0;
      }
    };

    base.addEventListener('touchstart', start, { passive: false });
    base.addEventListener('touchmove', move, { passive: false });
    base.addEventListener('touchend', end);
    base.addEventListener('touchcancel', end);
  }

  onTouchStart(e) {
    const target = e.target;
    if (target.id === 'joystick-base' || target.id === 'joystick-knob' || target.id === 'jump-btn') return;

    for (const touch of e.changedTouches) {
      if (touch.clientX > window.innerWidth * 0.5) {
        this.touchId = touch.identifier;
        this.lastTouch.x = touch.clientX;
        this.lastTouch.y = touch.clientY;
      }
    }
  }

  onTouchMove(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.touchId) {
        const dx = touch.clientX - this.lastTouch.x;
        const dy = touch.clientY - this.lastTouch.y;
        this.yaw -= dx * 0.005;
        this.pitch -= dy * 0.005;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.lastTouch.x = touch.clientX;
        this.lastTouch.y = touch.clientY;
      }
    }
  }

  onTouchEnd(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.touchId) this.touchId = null;
    }
  }

  update(dt, state) {
    const speed = 4;
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const move = new THREE.Vector3();

    if (Math.abs(this.moveX) > 0.05 || Math.abs(this.moveY) > 0.05) {
      move.add(forward.clone().multiplyScalar(-this.moveY));
      move.add(right.clone().multiplyScalar(this.moveX));
    }

    if (this.keys['KeyW']) move.add(forward);
    if (this.keys['KeyS']) move.sub(forward);
    if (this.keys['KeyD']) move.add(right);
    if (this.keys['KeyA']) move.sub(right);

    if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

    let newX = this.camera.position.x + move.x;
    let newZ = this.camera.position.z + move.z;

    // Cek dinding tak terlihat (batas map)
    const B = this.mapBoundary;
    if (newX > B) newX = B;
    if (newX < -B) newX = -B;
    if (newZ > B) newZ = B;
    if (newZ < -B) newZ = -B;

    // Cek collision dengan pohon
    if (!this.isBlocked(newX, newZ)) {
      this.camera.position.x = newX;
      this.camera.position.z = newZ;
    } else {
      // Sliding: coba geser hanya di sumbu X atau Z
      if (!this.isBlocked(newX, this.camera.position.z)) {
        this.camera.position.x = newX;
      } else if (!this.isBlocked(this.camera.position.x, newZ)) {
        this.camera.position.z = newZ;
      }
    }

    state.playerPos.copy(this.camera.position);

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  isBlocked(x, z) {
    const playerRadius = 0.5;
    for (const obs of this.obstacles) {
      const dx = x - obs.x;
      const dz = z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < obs.radius + playerRadius) {
        return true;
      }
    }
    return false;
  }
}
