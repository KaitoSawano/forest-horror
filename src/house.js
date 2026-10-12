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
        const dist = 40;
        const houseX = Math.cos(angle) * dist;
        const houseZ = Math.sin(angle) * dist;

        house.position.set(houseX, 0, houseZ);

        const scale = 2.5;
        house.scale.set(scale, scale, scale);

        const rotation = -angle + Math.PI / 2;
        house.rotation.y = rotation;

        house.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(house);

        // Simpan info rumah untuk collision
        // Dari observasi 4 sisi:
        // - Pintu ada di sisi veranda (sisi pendek rumah)
        // - Jendela ada di sisi panjang
        obstacles.push({
          type: 'house',
          centerX: houseX,
          centerZ: houseZ,
          rotation: rotation,
          // Ukuran setelah scale 2.5:
          // Dari BBOX: X=6.79, Z=7.56
          // Setelah scale: X=17, Z=18.9
          // Tapi karena pintu di sisi pendek, kita perlu orientasi ulang
          halfW: 8.5,      // setengah dari 17
          halfD: 9.5,      // setengah dari 18.9
          // Pintu ada di sisi +Z lokal (veranda) — kita pakai +Z lokal
          doorSideZ: 9.5,
          doorWidth: 4.0,
          // Jendela ada di sisi panjang (X lokal)
          windowX: 8.5,
          windowWidth: 2.5,
          window1Z: -2.5,   // posisi jendela 1 (dari depan)
          window2Z: 2.5,    // posisi jendela 2 (dari depan)
        });

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
