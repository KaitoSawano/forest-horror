import * as THREE from 'three';

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x1a2233, 0x000000, 0.08);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x334466, 0.1);
  moon.position.set(30, 80, -30);
  scene.add(moon);

  // === BINTANG ===
  // Pakai shader khusus biar tidak tertutup fog
  const starsGeo = new THREE.BufferGeometry();
  const starsCount = 800;
  const positions = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount; i++) {
    // Distribusi di setengah bola atas
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.7); // 0 sampai ~45 derajat dari atas
    const r = 100;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) + 20;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.3,
    sizeAttenuation: false,   // <-- INI KUNCI: bintang ukuran tetap
    transparent: true,
    opacity: 0.8,
    fog: false,               // <-- bintang tidak terkena fog
  });

  const stars = new THREE.Points(starsGeo, starsMat);
  scene.add(stars);

  console.log('Bintang:', starsCount);
}
