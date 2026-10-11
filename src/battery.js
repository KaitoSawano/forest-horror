import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Flashlight {
  constructor(camera) {
    this.light = new THREE.SpotLight(0xfff0d0, 3, 25, Math.PI / 7, 0.4, 1);
    this.light.position.set(0.2, -0.1, 0);
    this.light.target.position.set(0, 0, -1);

    camera.add(this.light);
    camera.add(this.light.target);

    this.isOn = true;
    this.flickerTimer = 0;
  }

  update(dt, state, hud) {
    if (!this.isOn) {
      this.light.intensity = 0;
      return;
    }

    state.battery -= (dt / 3) * 100;
    if (state.battery <= 0) {
      state.battery = 0;
      this.isOn = false;
    }

    if (state.battery < 30) {
      this.flickerTimer += dt;
      const flicker = Math.sin(this.flickerTimer * 30) > 0 ? 1 : 0.3;
      this.light.intensity = 3 * flicker * (state.battery / 30);
    } else {
      this.light.intensity = 3;
    }
  }
}
