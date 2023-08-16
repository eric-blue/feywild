import {Gamestate} from '../gamestate';

export class PauseMenu {
  menu: HTMLOListElement | null;

  constructor(gamestate: Gamestate) {
    this.menu = document.querySelector('#pause-menu');

    const togglePause = () => {
      window.paused = !window.paused;
      this.menu?.classList.toggle('hidden');

      if (!this.menu?.classList.contains('hidden')) {
        const button = document.querySelector(
          '#pause-menu-continue'
        ) as HTMLButtonElement;
        button.focus();
      }
    };

    const toggleSettings = () => {
      console.log('open settings');
    };

    addMethod('#pause-menu-continue', togglePause);
    addMethod('#pause-menu-save', gamestate.saveGame);
    addMethod('#pause-menu-load', gamestate.loadGame);
    addMethod('#pause-menu-exit-main', gamestate.exitToMain);
    addMethod('#pause-menu-exit-desktop', gamestate.exitToDesktop);
    addMethod('#pause-menu-settings', toggleSettings);

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
      if (key === 'Escape') togglePause();

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
