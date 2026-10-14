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
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load(
      './assets/car.glb',
      (gltf) => {
        const car = gltf.scene;

        // Posisi mobil — pinggir jalan, dekat spawn
        const carX = 8;
        const carZ = -15;

        car.position.set(carX, 0, carZ);

        // Skala — sesuaikan kalau mobil terlalu besar/kecil
        const scale = 1.0;
        car.scale.set(scale, scale, scale);

        // Rotasi — mobil menghadap sepanjang jalan
        car.rotation.y = Math.PI * 0.5;

        car.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(car);

        // Hitung obstacle berdasarkan ukuran mobil
        const box = new THREE.Box3().setFromObject(car);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxSize = Math.max(size.x, size.z);
        const radius = maxSize / 2;

        obstacles.push({
          x: center.x,
          z: center.z,
          radius: radius,
        });

        // Cahaya dalam mobil (redup oranye)
        const interiorLight = new THREE.PointLight(0xff8844, 0.8, 8, 2);
        interiorLight.position.set(carX, 1.5, carZ);
        scene.add(interiorLight);

        console.log('Mobil muncul di:', carX.toFixed(0), carZ.toFixed(0));
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
