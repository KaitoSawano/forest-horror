import * as THREE from 'three';

export function createLighting(scene) {
  // Ambient sangat redup — coklat gelap
  const ambient = new THREE.HemisphereLight(0x2a1a10, 0x0a0805, 0.3);
  scene.add(ambient);

  // Cahaya bulan — coklat kekuningan
  const moon = new THREE.DirectionalLight(0x6a4a30, 0.15);
  moon.position.set(30, 80, -30);
  scene.add(moon);

  // Cahaya cakrawala — bikin tanah sedikit terlihat
  const horizon = new THREE.DirectionalLight(0x3a2a1a, 0.1);
  horizon.position.set(0, 50, 100);
  scene.add(horizon);

  // === BINTANG ===
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 500;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.5); // cuma setengah bola atas
    const r = 200;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) + 50;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starsMat = new THREE.PointsMaterial({
    color: 0xaa8866,
    size: 0.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
  });

  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);
}
