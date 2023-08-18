import {Gamestate, SAVE_KEY} from '../gamestate';

export class StartMenu {
  menu: HTMLOListElement | null;

  constructor(gamestate: Gamestate) {
    this.menu = document.querySelector('#start-menu');
    this.menu?.classList.remove('hidden');

    const newGame = () => {
      this.menu?.classList.toggle('hidden');
      gamestate.newGame();
    };

    const continueGame = () => {
      this.menu?.classList.toggle('hidden');
      gamestate.continueGame();
    };

    const toggleSettings = () => {
      console.log('open settings');
    };

    addMethod('#start-menu-continue', continueGame);
    addMethod('#start-menu-new', newGame);
    addMethod('#start-menu-exit-desktop', gamestate.exitToDesktop);
    addMethod('#start-menu-settings', toggleSettings);

    if (localStorage.getItem(SAVE_KEY)) {
      const button = document.getElementById('start-menu-continue');
      button?.classList.toggle('hidden');
      button?.focus();
    } else {
      document.getElementById('start-menu-new')?.focus();
    }

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
      if (!this.menu?.classList.contains('hidden')) {
        if (key === 'Escape') gamestate.exitToDesktop();
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
