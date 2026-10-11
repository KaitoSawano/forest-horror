import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/DRACOLoader.js';

export function createHouse(scene, obstacles, mapBoundary) {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  return new Promise((resolve) => {
    loader.load(
      './assets/abandoned-house.glb',
      (gltf) => {
        const house = gltf.scene;

        // Posisi: jauh dari spawn, di pinggir hutan
        const angle = Math.PI * 0.75;
        const dist = 60;
        const houseX = Math.cos(angle) * dist;
        const houseZ = Math.sin(angle) * dist;

        house.position.set(houseX, 0, houseZ);

        // Skala
        const scale = 2.5;
        house.scale.set(scale, scale, scale);

        // Rotasi supaya pintu menghadap ke arah spawn
        house.rotation.y = -angle + Math.PI / 2;

        // Aktifkan shadow
        house.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(house);

        // Obstacle
        obstacles.push({
          x: houseX,
          z: houseZ,
          radius: 5 * scale / 2,
        });

        // Cahaya redup dari dalam rumah
        const houseLight = new THREE.PointLight(0xff8844, 1.2, 12, 2);
        houseLight.position.set(houseX, 3 * scale, houseZ);
        scene.add(houseLight);

        console.log('Rumah muncul di:', houseX.toFixed(0), houseZ.toFixed(0));
        resolve(house);
      },
      undefined,
      (err) => {
        console.warn('Gagal load abandoned-house.glb:', err);
        resolve(null);
      }
    );
  });
}
