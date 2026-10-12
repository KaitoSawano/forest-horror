import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createGraveyard(scene, obstacles, mapBoundary) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/graveyard.glb',
      (gltf) => {
        const graveyard = gltf.scene;

        const angle = Math.PI * 0.25;
        const dist = 20;
        const graveX = Math.cos(angle) * dist;
        const graveZ = Math.sin(angle) * dist;

        graveyard.position.set(graveX, 0.05, graveZ);

        const scale = 2.0;
        graveyard.scale.set(scale, scale, scale);

        graveyard.rotation.y = angle + Math.PI;

        // Jangan override material — biarkan tekstur asli muncul
        graveyard.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(graveyard);

        const graveLight = new THREE.PointLight(0x6688cc, 1.5, 25, 2);
        graveLight.position.set(graveX, 10, graveZ);
        scene.add(graveLight);

        console.log('Kuburan muncul di:', graveX.toFixed(0), graveZ.toFixed(0));
        resolve(graveyard);
      },
      undefined,
      (err) => {
        console.warn('Gagal load graveyard.glb:', err);
        resolve(null);
      }
    );
  });
}
