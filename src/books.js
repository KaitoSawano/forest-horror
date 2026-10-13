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

export class BookManager {
  constructor(scene, obstacles, mapBoundary) {
    this.scene = scene;
    this.obstacles = obstacles;
    this.mapBoundary = mapBoundary;
    this.books = [];
    this.collected = 0;
    this.total = 7;
    this.onAllCollected = null;

    this.geometry = new THREE.BoxGeometry(0.25, 0.35, 0.08);
    this.material = new THREE.MeshStandardMaterial({
      color: 0x551111,
      emissive: 0x220000,
      emissiveIntensity: 0.3,
      roughness: 0.9,
    });

    this.spawnBooks();
  }

  spawnBooks() {
    let attempts = 0;
    while (this.books.length < this.total && attempts < 2000) {
      attempts++;

      const angle = Math.random() * Math.PI * 2;
      const dist = 25 + Math.random() * (this.mapBoundary - 30);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      let blocked = false;
      for (const obs of this.obstacles) {
        const dx = x - obs.x;
        const dz = z - obs.z;
        if (Math.sqrt(dx * dx + dz * dz) < obs.radius + 1.5) {
          blocked = true;
          break;
        }
      }
      if (blocked) continue;

      let tooClose = false;
      for (const b of this.books) {
        const dx = x - b.mesh.position.x;
        const dz = z - b.mesh.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 15) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      const mesh = new THREE.Mesh(this.geometry, this.material);
      mesh.position.set(x, 0.3, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.rotation.x = (Math.random() - 0.5) * 0.4;
      mesh.rotation.z = (Math.random() - 0.5) * 0.4;
      mesh.castShadow = true;

      const light = new THREE.PointLight(0xff1111, 0.4, 2.5, 2);
      light.position.set(0, 0, 0);
      mesh.add(light);

      this.scene.add(mesh);
      this.books.push({ mesh, light, collected: false });
    }
  }

  update(dt, playerPos) {
    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];
      if (book.collected) continue;

      const dx = playerPos.x - book.mesh.position.x;
      const dz = playerPos.z - book.mesh.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 1.2) {
        book.collected = true;
        this.scene.remove(book.mesh);
        book.light.intensity = 0;
        this.collected++;

        if (this.collected >= this.total && this.onAllCollected) {
          this.onAllCollected();
        }
      }
    }
  }

  getCollected() {
    return this.collected;
  }

  getTotal() {
    return this.total;
  }
}
