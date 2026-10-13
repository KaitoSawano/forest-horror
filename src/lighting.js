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

export function createLighting(scene) {
  const ambient = new THREE.HemisphereLight(0x1a2233, 0x000000, 0.08);
  scene.add(ambient);

  const moon = new THREE.DirectionalLight(0x334466, 0.1);
  moon.position.set(30, 80, -30);
  scene.add(moon);

  console.log('Lighting OK');
}
