import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Flashlight {
  constructor(camera) {
    this.light = new THREE.SpotLight(
      0xffe8b0,       // warna hangat
      18,             // intensitas
      45,             // jarak jangkauan lebih jauh
      Math.PI / 3,    // sudut 60 derajat — jauh lebih lebar
      0.5,            // penumbra — pinggiran sangat lembut
      0.8             // decay — pelan melemah
    );
    this.light.position.set(0.1, -0.1, 0);
    this.light.target.position.set(0, 0, -1);
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 512;
    this.light.shadow.mapSize.height = 512;
    this.light.shadow.camera.near = 0.5;
    this.light.shadow.camera.far = 45;
    this.light.shadow.bias = -0.001;

    camera.add(this.light);
    camera.add(this.light.target);

    // Cahaya pendukung di sekitar kamera
    this.fill = new THREE.PointLight(0xffe8b0, 2, 10, 1.2);
    this.fill.position.set(0, 0, 0);
    camera.add(this.fill);
  }

  update(dt, state, hud) {
    this.light.intensity = 18;
    this.fill.intensity = 2;
  }
}
