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

export class Flashlight {
  constructor(camera) {
    this.light = new THREE.SpotLight(
      0xffe8b0,
      18,
      45,
      Math.PI / 3,
      0.5,
      0.8
    );
    this.light.position.set(0.1, -0.1, 0);
    this.light.target.position.set(0, 0, -1);
    this.light.castShadow = true;
    this.light.shadow.mapSize.width = 512;
    this.light.shadow.mapSize.height = 512;
    this.light.shadow.camera.near = 0.5;
    this.light.shadow.camera.far = 45;
    this.light.shadow.bias = -0.001;

    camera.add(this.light);
    camera.add(this.light.target);

    this.fill = new THREE.PointLight(0xffe8b0, 2, 10, 1.2);
    this.fill.position.set(0, 0, 0);
    camera.add(this.fill);
  }

  update(dt, state, hud) {
    this.light.intensity = 18;
    this.fill.intensity = 2;
  }
}
