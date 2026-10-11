import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

export function createForest(scene) {
  // Tanah
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

  loader.load('./assets/tree.glb', (gltf) => {
    const template = gltf.scene;

    // Skala pohon — sesuaikan kalau terlalu besar/kecil
    const baseScale = 2.0;

    for (let i = 0; i < 60; i++) {
      // Clone model — pakai SkeletonUtils kalau ada animasi,
      // tapi karena statis, clone biasa cukup
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

    console.log('Berhasil spawn 60 pohon');
  }, undefined, (err) => {
    console.error('Gagal load tree.glb:', err);
  });
}
