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

        // Ukuran rumah setelah scale 2.5:
        // Lebar (X): 6.79 * 2.5 = 16.98
        // Panjang (Z): 7.56 * 2.5 = 18.9
        // Veranda ada di salah satu sisi (yang ada pintu + tangga)
        // Kita asumsikan: veranda di sisi +Z lokal

        obstacles.push({
          type: 'house',
          centerX: houseX,
          centerZ: houseZ,
          rotation: rotation,
          halfW: 8.5,    // setengah lebar rumah
          halfD: 9.5,    // setengah panjang rumah
          doorZ: 9.5,    // posisi pintu di sisi +Z lokal (sisi veranda)
          doorWidth: 3.5, // lebar celah pintu
          windowWidth: 2.0, // lebar celah jendela
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
