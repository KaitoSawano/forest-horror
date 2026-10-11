import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createHouse(scene, obstacles, mapBoundary) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/house1.glb',
      (gltf) => {
        const house = gltf.scene;

        const angle = Math.PI * 0.75;
        const dist = 60;
        const houseX = Math.cos(angle) * dist;
        const houseZ = Math.sin(angle) * dist;

        house.position.set(houseX, 0, houseZ);

        const scale = 2.5;
        house.scale.set(scale, scale, scale);

        house.rotation.y = -angle + Math.PI / 2;

        house.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(house);

        // Collision: cuma 4 titik sudut rumah (pojok), biar pintu tetap bisa dilewati
        // Ukuran rumah ~10 x 10 unit setelah scale
        const halfW = 4.5;
        const halfD = 4.5;
        const rot = house.rotation.y;

        // Pojok-pojok rumah dalam koordinat lokal
        const corners = [
          { x: -halfW, z: -halfD },
          { x:  halfW, z: -halfD },
          { x: -halfW, z:  halfD },
          { x:  halfW, z:  halfD },
        ];

        for (const c of corners) {
          // Rotasi pojok sesuai rotasi rumah
          const rx = c.x * Math.cos(rot) - c.z * Math.sin(rot);
          const rz = c.x * Math.sin(rot) + c.z * Math.cos(rot);

          obstacles.push({
            x: houseX + rx,
            z: houseZ + rz,
            radius: 1.5,
          });
        }

        const houseLight = new THREE.PointLight(0xff8844, 1.2, 12, 2);
        houseLight.position.set(houseX, 3 * scale, houseZ);
        scene.add(houseLight);

        console.log('Rumah muncul di:', houseX.toFixed(0), houseZ.toFixed(0));
        resolve(house);
      },
      undefined,
      (err) => {
        console.warn('Gagal load house1.glb:', err);
        resolve(null);
      }
    );
  });
}
