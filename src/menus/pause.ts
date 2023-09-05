import {Gamestate} from '../gamestate';
import {addListener} from '../models/helpers';

export class PauseMenu {
  menu: HTMLOListElement | null;
  open = false;

  constructor(gamestate: Gamestate) {
    this.menu = document.querySelector('#pause-menu');

    const togglePause = () => {
      window.paused = !window.paused;
      this.open = !this.menu?.classList.toggle('hidden');

      if (this.open) {
        const button = document.querySelector<HTMLButtonElement>(
          '#pause-menu-continue'
        );
        button?.focus();
      }

      window.soundManager.play('click', {volume: 0.25});
    };

    const toggleSettings = () => {
      console.log('open settings');
    };

    addListener('#pause-menu-continue', togglePause);
    addListener('#pause-menu-save', gamestate.saveGame);
    addListener('#pause-menu-load', gamestate.loadGame);
    addListener('#pause-menu-exit-main', gamestate.exitToMain);
    addListener('#pause-menu-exit-desktop', gamestate.exitToDesktop);
    addListener('#pause-menu-settings', toggleSettings);

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

      window.soundManager.play('focus', {volume: 0.5});
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
