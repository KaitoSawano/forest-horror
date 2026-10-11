import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Flashlight {
  constructor(camera) {
    // Cahaya utama senter — kerucut sempit, hangat, dengan bayangan
    this.light = new THREE.SpotLight(
      0xffe8b0,      // warna hangat kekuningan
      8,             // intensitas tinggi
      22,            // jarak jangkauan
      Math.PI / 9,   // sudut sempit (~20 derajat)
      0.25,          // penumbra — pinggiran agak lembut
      1.5            // decay — cepat melemah
    );
    this.light.position.set(0.1, -0.1, 0);
    this.light.target.position.set(0, 0, -1);
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 512;
    this.light.shadow.mapSize.height = 512;
    this.light.shadow.camera.near = 0.5;
    this.light.shadow.camera.far = 25;

    camera.add(this.light);
    camera.add(this.light.target);
  }

  update(dt, state, hud) {
    this.light.intensity = 8;
  }
}
