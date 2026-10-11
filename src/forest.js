import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

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

  const loader = new GLTFLoader();

  loader.load(
    './assets/tree.glb',
    (gltf) => {
      const template = gltf.scene;
      const baseScale = 2.0;

      for (let i = 0; i < 30; i++) {
        const tree = template.clone(true);

        tree.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 92;

        tree.position.set(
          Math.cos(angle) * dist,
          0,
          Math.sin(angle) * dist
        );

        tree.rotation.y = Math.random() * Math.PI * 2;

        const s = baseScale * (0.7 + Math.random() * 0.6);
        tree.scale.set(s, s, s);

        scene.add(tree);
      }

      console.log('Spawn 30 pohon berhasil');
    },
    undefined,
    (err) => {
      console.error('Gagal load tree.glb:', err);
      // Fallback ke pohon primitif kalau gagal
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 6);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a });
      for (let i = 0; i < 50; i++) {
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        const angle = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 92;
        trunk.position.set(Math.cos(angle) * dist, 2, Math.sin(angle) * dist);
        trunk.castShadow = true;
        scene.add(trunk);
      }
    }
  );
}
