// UmbraGrove
// Copyright (C) 2026-present AtticForge
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createCar(scene, obstacles) {
  // Posisi mobil — pinggir jalan, dekat spawn
  const carX = 6;
  const carZ = -8;

  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/car.glb',
      (gltf) => {
        const car = gltf.scene;

        car.position.set(carX, 0, carZ);
        car.rotation.y = -Math.PI * 0.1;

        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(car);

        // Cahaya dalam mobil (redup oranye)
        const interiorLight = new THREE.PointLight(0xff8844, 0.5, 6, 2);
        interiorLight.position.set(0, 1.5, 0);
        car.add(interiorLight);

        // Obstacle — pemain tidak bisa tembus mobil
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
