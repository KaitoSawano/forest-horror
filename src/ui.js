export class HUD {
  constructor() {
    this.bookEl = document.getElementById('book-counter');
  }

  update(state) {
    if (this.bookEl && state.books) {
      this.bookEl.textContent = `Buku ${state.books.collected}/${state.books.total}`;
    }
  }

  show() {
    if (this.bookEl) {
      this.bookEl.classList.add('visible');
    }
  }
}
