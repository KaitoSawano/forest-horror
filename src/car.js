// UmbraGrove
// Copyright (C) 2026-present AtticForge
// ... (header GPL lengkap)

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createCar(scene, obstacles) {
  const carX = 8;
  const carZ = -15;

  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/car.glb',
      (gltf) => {
        const car = gltf.scene;

        car.position.set(carX, 0, carZ);
        car.rotation.y = Math.PI * 0.5;

        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(car);

        const interiorLight = new THREE.PointLight(0xff8844, 0.8, 8, 2);
        interiorLight.position.set(0, 1.5, 0);
        car.add(interiorLight);

        obstacles.push({
          x: carX,
          z: carZ,
          radius: 3.0,
        });

        console.log('Mobil loaded di:', carX, carZ);
        resolve(car);
      },
      undefined,
      (err) => {
        console.warn('Gagal load car.glb:', err);
        resolve(null);
      }
    );
  });
}
