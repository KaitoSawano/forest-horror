import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createForest(scene) {
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a1a,
    roughness: 1,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
  const leafGeo = new THREE.ConeGeometry(1.5, 3, 7);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x0a1a0a });

  for (let i = 0; i < 300; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    tree.add(trunk);

    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 4.5;
    tree.add(leaves);

    const angle = Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 100;
    tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.scale.setScalar(0.7 + Math.random() * 0.8);

    scene.add(tree);
  }
}
