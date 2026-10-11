import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Flashlight {
  constructor(camera) {
    this.light = new THREE.SpotLight(0xfff0d0, 3, 30, Math.PI / 6, 0.4, 1);
    this.light.position.set(0.2, -0.1, 0);
    this.light.target.position.set(0, 0, -1);

    camera.add(this.light);
    camera.add(this.light.target);
  }

  update(dt, state, hud) {
    // Senter nyala terus, tidak ada baterai
    this.light.intensity = 3;
  }
}
