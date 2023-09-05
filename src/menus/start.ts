import {Camera, Scene} from 'three';
import {Gamestate, SAVE_KEY} from '../gamestate';
import {SoundEffects} from '../sounds';
import {addListener} from '../models/helpers';

export class StartMenu {
  topLevelScene = new Scene();
  menu: HTMLOListElement | null;

  constructor(gamestate: Gamestate) {
    const soundManager = new SoundEffects(new Camera());

    soundManager.load(soundsToLoad, () => {
      console.log('All sounds loaded!');
      // soundManager.play('ambient', {loop: true, volume: 0.5});
    });

    window.soundManager = soundManager;

    this.menu = document.querySelector('#start-menu');
    this.menu?.classList.remove('hidden');

    const newGame = () => {
      this.menu?.classList.toggle('hidden');
      gamestate.newGame();
      window.soundManager.play('click', {volume: 0.25});
    };

    const continueGame = () => {
      this.menu?.classList.toggle('hidden');
      gamestate.continueGame();
      window.soundManager.play('click', {volume: 0.25});
    };

    const toggleSettings = () => {
      console.log('open settings');
      window.soundManager.play('click', {volume: 0.25});
    };

    addListener('#start-menu-continue', continueGame);
    addListener('#start-menu-new', newGame);
    addListener('#start-menu-exit-desktop', gamestate.exitToDesktop);
    addListener('#start-menu-settings', toggleSettings);

    if (localStorage.getItem(SAVE_KEY)) {
      const button = document.getElementById('start-menu-continue');
      button?.classList.toggle('hidden');
      button?.focus();
    } else {
      document.getElementById('start-menu-new')?.focus();
    }

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
  }
}

const soundsToLoad = {
  // "ambient": 'sounds/ambient.ogg',
  openMenu: 'sounds/Bank Card Placed Down 03.wav',
  closeMenu: 'sounds/Wallet Close.wav',
  hit: 'sounds/HIT_SHORT_04.wav',
  click: 'sounds/MI_SFX 26.mp3',
  select: 'sounds/MI_SFX 28.mp3',
  focus: 'sounds/MI_SFX 29.mp3',
  chatter: 'sounds/MI_SFX 35.mp3',
  //... add more sounds as needed
};
