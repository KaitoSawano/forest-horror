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

export function createCar(scene, obstacles) {
  // Mobil diparkir di pinggir jalan, dekat spawn
  const carX = 6;
  const carZ = -8;

  const car = new THREE.Group();
  car.position.set(carX, 0, carZ);
  car.rotation.y = -Math.PI * 0.1;

  // === MATERIAL ===
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.4,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.6,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.95,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Bodi bawah
  const bodyLower = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.8, 4.5),
    bodyMat
  );
  bodyLower.position.y = 0.8;
  bodyLower.castShadow = true;
  bodyLower.receiveShadow = true;
  car.add(bodyLower);

  // Bodi atas
  const bodyUpper = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.7, 2.5),
    bodyMat
  );
  bodyUpper.position.y = 1.55;
  bodyUpper.castShadow = true;
  car.add(bodyUpper);

  // Kaca depan
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.6, 0.05),
    windowMat
  );
  windshield.position.set(0, 1.5, 1.2);
  windshield.rotation.x = 0.4;
  car.add(windshield);

  // Kaca belakang
  const rearWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.5, 0.05),
    windowMat
  );
  rearWindow.position.set(0, 1.5, -1.2);
  rearWindow.rotation.x = -0.4;
  car.add(rearWindow);

  // Kaca samping kiri
  const sideWindowL = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.5, 2.0),
    windowMat
  );
  sideWindowL.position.set(-1.0, 1.5, 0);
  car.add(sideWindowL);

  // Kaca samping kanan
  const sideWindowR = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.5, 2.0),
    windowMat
  );
  sideWindowR.position.set(1.0, 1.5, 0);
  car.add(sideWindowR);

  // Ban (4 buah)
  const tireGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12);
  
  const positions = [
    { x: -1.1, z: 1.5 },
    { x: 1.1, z: 1.5 },
    { x: -1.1, z: -1.5 },
    { x: 1.1, z: -1.5 },
  ];

  for (const pos of positions) {
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(pos.x, 0.4, pos.z);
    tire.castShadow = true;
    car.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.32, 8),
      chromeMat
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.set(pos.x, 0.4, pos.z);
    car.add(rim);
  }

  // Pintu depan kiri (terbuka — pemain baru keluar)
  const doorLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.7, 1.5),
    bodyMat
  );
  doorLeft.position.set(-1.15, 1.2, 0.5);
  doorLeft.rotation.y = -Math.PI * 0.4;
  car.add(doorLeft);

  // Lampu depan
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0x443311,
    emissive: 0x221100,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });

  const headlightL = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 0.05),
    headlightMat
  );
  headlightL.position.set(-0.7, 0.8, 2.26);
  car.add(headlightL);

  const headlightR = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.2, 0.05),
    headlightMat
  );
  headlightR.position.set(0.7, 0.8, 2.26);
  car.add(headlightR);

  // Lampu belakang (merah)
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0x441111,
    emissive: 0x220000,
    emissiveIntensity: 0.3,
    roughness: 0.3,
  });

  const taillightL = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.15, 0.05),
    taillightMat
  );
  taillightL.position.set(-0.7, 0.9, -2.26);
  car.add(taillightL);

  const taillightR = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.15, 0.05),
    taillightMat
  );
  taillightR.position.set(0.7, 0.9, -2.26);
  car.add(taillightR);

  // Cahaya dalam mobil
  const interiorLight = new THREE.PointLight(0xff8844, 0.5, 6, 2);
  interiorLight.position.set(0, 1.5, 0);
  car.add(interiorLight);

  scene.add(car);

  // Obstacle
  obstacles.push({
    x: carX,
    z: carZ,
    radius: 3.0,
  });

  console.log('Mobil pemain terparkir di:', carX, carZ);

  return car;
}
