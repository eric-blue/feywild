export class Inventory {
  menu: HTMLOListElement | null;
  open = false;

  constructor() {
    this.menu = document.querySelector('#inventory');
    Array.from({length: 20}).forEach(() => {
      const li = document.createElement('li');
      this.menu?.querySelector('#inventory-grid')?.appendChild(li);
    });

    const toggleInventory = () => {
      window.lockPlayer = !window.lockPlayer;
      this.open = !this.menu?.classList.toggle('hidden');
      if (this.open) window.soundManager.play('openMenu', {volume: 0.5});
      if (!this.open) window.soundManager.play('closeMenu', {volume: 0.5});
    };

    addMethod('#inventory-continue', toggleInventory);

    const focusNext = (increment = 1) => {
      const list = Array.from(
        this.menu?.querySelectorAll('li button') ?? []
      ) as HTMLButtonElement[];
      const current = list?.findIndex(
        button => button === document.activeElement
      );

      list[
        current + increment > list.length ? 0 : current + increment
      ]?.focus();
    };

    addEventListener('keydown', ({key}) => {
      if (!window.gameIsLoading && !window.paused) {
        if (key.toUpperCase() === 'I') toggleInventory();
      }

      if (!this.menu?.classList.contains('hidden')) {
        if (key === 'ArrowUp' || key.toUpperCase() === 'W') focusNext(-1);
        if (key === 'ArrowLeft' || key.toUpperCase() === 'A') focusNext(-1);
        if (key === 'ArrowDown' || key.toUpperCase() === 'S') focusNext();
        if (key === 'ArrowRight' || key.toUpperCase() === 'D') focusNext();
      }
    });
  }
}

function addMethod(id: `#${string}`, method: () => void) {
  document.querySelector(id)?.addEventListener('click', () => method());
}
