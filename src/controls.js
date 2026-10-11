import * as THREE from 'three';

export class PlayerControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.keys = {};
    this.yaw = 0;
    this.pitch = 0;
    this.touchId = null;
    this.lastTouch = { x: 0, y: 0 };

    window.addEventListener('keydown', (e) => (this.keys[e.code] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.code] = false));

    domElement.addEventListener('touchstart', (e) => this.onTouchStart(e));
    domElement.addEventListener('touchmove', (e) => this.onTouchMove(e));
    domElement.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }

  onTouchStart(e) {
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
    if (this.keys['KeyW']) move.add(forward);
    if (this.keys['KeyS']) move.sub(forward);
    if (this.keys['KeyD']) move.add(right);
    if (this.keys['KeyA']) move.sub(right);

    if (move.length() > 0) move.normalize().multiplyScalar(speed * dt);

    this.camera.position.add(move);
    state.playerPos.copy(this.camera.position);

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
