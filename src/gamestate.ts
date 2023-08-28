import {Scene} from 'three';
import {PathfindingHelper} from 'three-pathfinding';
import { SoundEffects } from './sounds';

declare global {
  interface Window {
    soundManager: SoundEffects;

    savingInProgress: boolean;
    gameIsLoading: boolean;
    paused: boolean;
    lockPlayer: boolean;

    /** debug only */
    _orbitControls: boolean;
    _currentScene: Scene | undefined;
    _pathfindingHelper: PathfindingHelper | undefined;
  }
}

export const SAVE_KEY = 'feywild-save';
export const PLAYER_BEGIN_POS = {x: 441, y: 0.5, z: 153};

window.soundManager;
window.savingInProgress = false;
window.gameIsLoading = false;
window.paused = false;
window.lockPlayer = false;

window._orbitControls = false;
window._currentScene;
window._pathfindingHelper;

export interface GameState {
  saves: number;
  playerPosition: {x: number; y: number; z: number};
  playerInventory: {};
  npcState: {
    [key: string]: {
      position: {x: number; y: number; z: number};
      inventory?: {};
    };
  };
  health: number;
  level: number;
  scene: number;
}

function onStartGame(detail: string | {[key: string]: unknown}) {
  dispatchEvent(new CustomEvent('startgame', {detail}));
}

export class Gamestate {
  state: GameState = {
    saves: 0,
    playerPosition: PLAYER_BEGIN_POS,
    playerInventory: {},
    npcState: {},
    health: 100,
    level: 3,
    scene: 1,
    // ...other game-related data
  };

  setState(gamestate: Partial<GameState>) {
    this.state = {...this.state, ...gamestate};
  }

  newGame = () => {
    window.gameIsLoading = true;
    onStartGame('new');
  };

  continueGame = () => {
    window.gameIsLoading = true;
    const serializedData = localStorage.getItem(SAVE_KEY);

    if (serializedData) {
      const loadedGameState = JSON.parse(serializedData);
      this.state = loadedGameState;

      onStartGame('continue');
    }
  };

  saveGame = () => {
    if (confirm("You're about to overwrite your progress. \nAre you sure?")) {
      window.savingInProgress = true;
      this.state.saves += 1;
      const serializedData = JSON.stringify(this.state);
      localStorage.setItem(SAVE_KEY, serializedData);
      window.savingInProgress = false;
    }
  };

  loadGame = () => {
    if (
      confirm(
        'Any unsaved progress will be lost to the waters of time. \nAre you sure?'
      )
    ) {
      window.gameIsLoading = true;
      const serializedData = localStorage.getItem(SAVE_KEY);

      if (serializedData) {
        const loadedGameState = JSON.parse(serializedData);
        this.state = loadedGameState;
      }
    }
  };

  exitToMain = () => {
    if (
      confirm(
        'Any unsaved progress will be lost to the waters of time. \nAre you sure?'
      )
    ) {
      console.log('do exit');
    }
  };

  exitToDesktop = () => {
    if (
      confirm(
        'Any unsaved progress will be lost to the waters of time. \nAre you sure?'
      )
    ) {
      console.log('do exit');
    }
  };
}
