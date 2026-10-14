import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createCar(scene, obstacles) {
  const carX = 8;
  const carZ = -15;

  const loader = new GLTFLoader();

  console.log('=== CAR: Mulai load car.glb ===');

  return new Promise((resolve) => {
    loader.load(
      './assets/car.glb',
      (gltf) => {
        console.log('=== CAR: car.glb berhasil di-load ===');
        
        const car = gltf.scene;

        car.position.set(carX, 0, carZ);
        car.rotation.y = Math.PI * 0.5;

        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            console.log('=== CAR: Mesh:', child.name || 'unnamed');
          }
        });

        scene.add(car);

        const interiorLight = new THREE.PointLight(0xff8844, 0.8, 8, 2);
        interiorLight.position.set(0, 1.5, 0);
        car.add(interiorLight);

        obstacles.push({
          x: carX,
          z: carZ,
          radius: 2.0,
        });

        console.log('=== CAR: Mobil ditambahkan di', carX, carZ, '===');

        // Tampilkan di debug kalau ada
        const debugEl = document.getElementById('debug');
        if (debugEl) {
          debugEl.textContent = 'MOBIL OK di ' + carX + ', ' + carZ;
          debugEl.style.display = 'block';
          debugEl.style.color = '#00ff00';
          setTimeout(() => {
            debugEl.style.display = 'none';
          }, 5000);
        }

        resolve(car);
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log('=== CAR: Loading ' + percent.toFixed(1) + '% ===');
        }
      },
      (err) => {
        console.error('=== CAR: GAGAL load car.glb ===', err);
        
        // Tampilkan error di debug
        const debugEl = document.getElementById('debug');
        if (debugEl) {
          debugEl.textContent = 'MOBIL GAGAL: ' + (err.message || 'unknown error');
          debugEl.style.display = 'block';
          debugEl.style.color = '#ff0000';
          setTimeout(() => {
            debugEl.style.display = 'none';
          }, 10000);
        }
        
        resolve(null);
      }
    );
  });
}
