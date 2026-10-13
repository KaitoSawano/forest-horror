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

export class ForestAudio {
  constructor() {
    this.audio = null;
    this.menuMusic = null;
    this.started = false;
    this.menuStarted = false;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAll();
      } else {
        this.resumeAll();
      }
    });
  }

  startMenuMusic() {
    if (this.menuStarted) return;
    if (!this.menuMusic) {
      this.menuMusic = new Audio('./assets/sound/lobby-creepy.mp3');
      this.menuMusic.loop = true;
      this.menuMusic.volume = 0.35;
    }
    this.menuMusic.play().then(() => {
      this.menuStarted = true;
    }).catch(() => {});
  }

  stopMenuMusic() {
    if (this.menuMusic && !this.menuMusic.paused) {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
      this.menuStarted = false;
    }
  }

  forceStart() {
    if (this.started) return;
    if (!this.audio) {
      this.audio = new Audio('./assets/sound/night-forest.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.4;
    }
    this.audio.play().then(() => {
      this.started = true;
    }).catch((err) => {
      console.warn('Audio gagal play:', err);
    });
  }

  pauseAll() {
    if (this.menuMusic && !this.menuMusic.paused) this.menuMusic.pause();
    if (this.audio && !this.audio.paused) this.audio.pause();
  }

  resumeAll() {
    if (this.menuStarted && this.menuMusic && this.menuMusic.paused) {
      this.menuMusic.play().catch(() => {});
    }
    if (this.started && this.audio && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  update(dt) {}
}
