import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class BookManager {
  constructor(scene, obstacles, mapBoundary) {
    this.scene = scene;
    this.obstacles = obstacles;
    this.mapBoundary = mapBoundary;
    this.books = [];
    this.collected = 0;
    this.total = 7;
    this.onAllCollected = null;

    // Buku kecil, gelap, tidak mencolok
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
      // Minimal 25 unit dari pusat, maksimal dekat batas map
      const dist = 25 + Math.random() * (this.mapBoundary - 30);
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Cek tidak nabrak pohon
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

      // Cek tidak terlalu dekat buku lain (min 15 unit)
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
      // Buku bisa menghadap arah acak
      mesh.rotation.y = Math.random() * Math.PI * 2;
      // Kadang buku miring (seperti jatuh)
      mesh.rotation.x = (Math.random() - 0.5) * 0.4;
      mesh.rotation.z = (Math.random() - 0.5) * 0.4;
      mesh.castShadow = true;

      // Cahaya sangat redup — cuma terlihat saat dekat
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

      // Cek jarak ke pemain — harus benar-benar dekat untuk ambil
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
