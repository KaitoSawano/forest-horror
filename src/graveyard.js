import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createGraveyard(scene, obstacles, mapBoundary) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/graveyard2.glb',
      (gltf) => {
        const graveyard = gltf.scene;

        const angle = Math.PI * 0.25;
        const dist = 22;
        const graveX = Math.cos(angle) * dist;
        const graveZ = Math.sin(angle) * dist;

        graveyard.position.set(graveX, 0.05, graveZ);

        const scale = 0.4;
        graveyard.scale.set(scale, scale, scale);

        graveyard.rotation.y = angle + Math.PI;

        graveyard.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(graveyard);

        // Hitung bounding box untuk tahu ukuran asli kuburan setelah scale
        const box = new THREE.Box3().setFromObject(graveyard);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('Ukuran kuburan:', size.x.toFixed(2), 'x', size.z.toFixed(2));
        console.log('Pusat kuburan:', center.x.toFixed(0), center.z.toFixed(0));

        // Radius = setengah dari ukuran terbesar + margin
        const maxSize = Math.max(size.x, size.z);
        const radius = maxSize / 2;

        obstacles.push({
          x: center.x,
          z: center.z,
          radius: radius,
        });

        console.log('Obstacle kuburan: radius', radius.toFixed(2));

        const graveLight = new THREE.PointLight(0x6688cc, 1.5, 25, 2);
        graveLight.position.set(graveX, 10, graveZ);
        scene.add(graveLight);

        resolve(graveyard);
      },
      undefined,
      (err) => {
        console.warn('Gagal load graveyard2.glb:', err);
        resolve(null);
      }
    );
  });
}
