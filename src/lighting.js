import * as THREE from 'three';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x1a2233, 0x000000, 0.08);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x334466, 0.1);
  moon.position.set(30, 80, -30);
  scene.add(moon);

  console.log('Lighting OK');
}
