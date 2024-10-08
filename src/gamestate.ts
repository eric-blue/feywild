import {Mesh, Scene, Vector3} from 'three';
import {SoundEffects} from './sounds';
import { CharacterState } from './models/character';
import { CharacterStats } from './models/shared/stats';

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
  }

  interface WindowEventMap {
    startgame: CustomEvent<string>;
    'update-player-position': CustomEvent<{position: Vector3}>;
    'send-melee-damage': CustomEvent<{sender: Mesh; zone: string; senderStats: CharacterStats}>;
  }
}

export const SAVE_KEY = 'feywild-save';

window.soundManager;
window.savingInProgress = false;
window.gameIsLoading = false;
window.paused = false;
window.lockPlayer = false;

window._orbitControls = false;
window._currentScene;

export interface GameState {
  saves: number;
  playerState: Partial<CharacterState>;
  npcState: {
    [key: string]: Partial<CharacterState>;
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
    playerState: {
      position: new Vector3(0, 0.5, 0),
      inventory: {},
      zone: 'forest-grove-nw',
    },
    npcState: {},
    health: 100,
    level: 3,
    scene: 1,
    // ...other game-related data
  };

  constructor() {
    console.log('setting player position', this.state.playerState.position, this.state.playerState.position?.copy)
  }

  setState(gamestate: Partial<GameState>) {
    this.state = {...this.state, ...gamestate};
  }

  setPlayerPosition(position: Vector3) {
    this.state.playerState.position!.x = position.x;
    this.state.playerState.position!.y = position.y;
    this.state.playerState.position!.z = position.z;

    const playerExists = window._currentScene?.getObjectByName('player');

    if (playerExists) {
      dispatchEvent(new CustomEvent('update-player-position', {detail: {position}}));
    } else {
      console.warn('waiting on player to exist in scene');
      setTimeout(() => this.setPlayerPosition(position), 200);
    }

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
      this.state = {...loadedGameState};
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
    if (confirm('Any unsaved progress will be lost to the waters of time. \nAre you sure?')) {
      window.gameIsLoading = true;
      const serializedData = localStorage.getItem(SAVE_KEY);

      if (serializedData) {
        const loadedGameState = JSON.parse(serializedData);
        this.state = {...loadedGameState};
      }
    }
  };

  exitToMain = () => {
    if (confirm('Any unsaved progress will be lost to the waters of time. \nAre you sure?')) {
      console.log('do exit');
    }
  };

  exitToDesktop = () => {
    if (confirm('Any unsaved progress will be lost to the waters of time. \nAre you sure?')) {
      console.log('do exit');
    }
  };
}
