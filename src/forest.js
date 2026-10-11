import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createForest(scene) {
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a1e,
    roughness: 0.95,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });

  for (let i = 0; i < 50; i++) {
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    const angle = Math.random() * Math.PI * 2;
    const dist = 8 + Math.random() * 92;
    trunk.position.set(Math.cos(angle) * dist, 2.5, Math.sin(angle) * dist);
    trunk.castShadow = true;
    scene.add(trunk);
  }
}
