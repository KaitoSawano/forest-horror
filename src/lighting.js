import * as THREE from 'three';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x223344, 0x000000, 0.08);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x4466aa, 0.1);
  moon.position.set(50, 100, -50);
  scene.add(moon);
}
