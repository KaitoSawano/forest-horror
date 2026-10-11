import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x334455, 0x000000, 0.25);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x6688cc, 0.3);
  moon.position.set(50, 100, -50);
  scene.add(moon);
}
