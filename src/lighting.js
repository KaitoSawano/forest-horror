import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createLighting(scene) {
  // Ambient sangat rendah — hampir tidak terlihat
  const ambient = new THREE.HemisphereLight(0x1a2233, 0x000000, 0.06);
  scene.add(ambient);

  // Sedikit cahaya bulan dari atas, sangat redup
  const moon = new THREE.DirectionalLight(0x334466, 0.08);
  moon.position.set(30, 80, -30);
  scene.add(moon);
}
