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

        // Hitung bounding box setelah di-scale dan diposisikan
        const box = new THREE.Box3().setFromObject(house);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('Ukuran rumah:', size.x.toFixed(2), 'x', size.z.toFixed(2));

        // Simpan info rumah sebagai obstacle khusus
        obstacles.push({
          type: 'box',
          centerX: center.x,
          centerZ: center.z,
          halfW: size.x / 2,
          halfD: size.z / 2,
          rotation: rotation,
          doorWidth: 3.0,
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
