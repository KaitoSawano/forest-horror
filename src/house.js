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

        // === HITUNG BOUNDING BOX OTOMATIS ===
        const box = new THREE.Box3().setFromObject(house);
        const min = box.min;
        const max = box.max;

        // Ukuran setelah di-scale
        const width = max.x - min.x;
        const depth = max.z - min.z;

        // Titik tengah
        const centerX = (min.x + max.x) / 2;
        const centerZ = (min.z + max.z) / 2;

        console.log('Ukuran rumah:', width.toFixed(2), 'x', depth.toFixed(2));

        // Buat obstacle di 4 sisi (dinding), dengan celah di sisi depan (pintu)
        const wallThickness = 0.8;
        const holeSize = 3.0; // ukuran celah pintu

        // Sisi kiri (barat)
        obstacles.push({
          x: centerX - width / 2 + wallThickness / 2,
          z: centerZ,
          radius: depth / 2,
        });

        // Sisi kanan (timur)
        obstacles.push({
          x: centerX + width / 2 - wallThickness / 2,
          z: centerZ,
          radius: depth / 2,
        });

        // Sisi belakang (utara)
        obstacles.push({
          x: centerX,
          z: centerZ - depth / 2 + wallThickness / 2,
          radius: width / 2,
        });

        // Sisi depan (selatan) — dibagi 2 karena ada pintu di tengah
        // Tapi karena rumah dirotasi, kita tidak bisa pakai koordinat langsung.
        // Solusi: jangan tambah obstacle di sisi depan, biar pintu bisa dilewati.

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
