import {Gamestate} from '../gamestate';
import {addListener} from '../models/helpers';

export class GameOverMenu {
  menu: HTMLMenuElement | null;

  constructor(gamestate: Gamestate) {
    this.menu = document.querySelector('#game-over-menu');

    const backToStartMenu = () => {
      window.soundManager.play('click', {volume: 0.25});
      location.reload();
    };

    addListener('#game-over-menu-continue', backToStartMenu);
    addListener('#game-over-menu-exit-desktop', gamestate.exitToDesktop);

    const focusNext = (increment = 1) => {
      const list = Array.from(this.menu?.querySelectorAll('li button') ?? []) as HTMLButtonElement[];
      const current = list?.findIndex(button => button === document.activeElement);

      list[current + increment > list.length ? 0 : current + increment]?.focus();

      window.soundManager.play('focus', {volume: 0.5});
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

    addEventListener('gameover', () => {
      this.menu?.classList.toggle('hidden');
      window.gameIsLoading = true;
      window.soundManager.play('click', {volume: 0.25});
    });
  }
}