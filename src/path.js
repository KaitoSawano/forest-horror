// Umbra Grove
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

export function createPath(scene) {
  // === TEXTURE JALAN TANAH ===
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#8a7550';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6000; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const r = Math.random();

    if (r < 0.3) {
      ctx.fillStyle = 'rgba(60, 45, 25, 0.7)';
    } else if (r < 0.6) {
      ctx.fillStyle = 'rgba(120, 100, 70, 0.6)';
    } else if (r < 0.85) {
      ctx.fillStyle = 'rgba(90, 70, 45, 0.5)';
    } else {
      ctx.fillStyle = 'rgba(150, 130, 90, 0.5)';
    }

    if (Math.random() < 0.1) {
      ctx.fillRect(x, y, 2, 2);
    } else {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const pathTexture = new THREE.CanvasTexture(canvas);
  pathTexture.wrapS = THREE.RepeatWrapping;
  pathTexture.wrapT = THREE.RepeatWrapping;
  pathTexture.repeat.set(2, 40);
  pathTexture.magFilter = THREE.NearestFilter;
  pathTexture.minFilter = THREE.NearestMipmapNearestFilter;
  pathTexture.colorSpace = THREE.SRGBColorSpace;

  const pathMat = new THREE.MeshStandardMaterial({
    map: pathTexture,
    roughness: 0.95,
    color: 0xaa9977,
  });

  // === SATU JALAN LURUS PANJANG (tidak terputus) ===
  // Lebar 4, panjang 240 (dari -120 sampai +120)
  const pathGeo = new THREE.PlaneGeometry(4, 240);
  const path = new THREE.Mesh(pathGeo, pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.03, 0);
  path.receiveShadow = true;
  scene.add(path);

  // === TEPI JALAN (garis gelap di kiri-kanan) ===
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x5a4a30,
    roughness: 1,
  });

  const edgeLeft = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 240),
    edgeMat
  );
  edgeLeft.rotation.x = -Math.PI / 2;
  edgeLeft.position.set(-2.15, 0.04, 0);
  edgeLeft.receiveShadow = true;
  scene.add(edgeLeft);

  const edgeRight = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 240),
    edgeMat
  );
  edgeRight.rotation.x = -Math.PI / 2;
  edgeRight.position.set(2.15, 0.04, 0);
  edgeRight.receiveShadow = true;
  scene.add(edgeRight);

  console.log('Jalan tanah dibuat: 240 unit panjang');

  return {
    // Info jalan untuk cek posisi pohon
    centerX: 0,
    centerZ: 0,
    width: 4,
    length: 240,
  };
}
