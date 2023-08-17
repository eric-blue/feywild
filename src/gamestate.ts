declare global {
  interface Window {
    savingInProgress: boolean;
    gameIsLoading: boolean;
    paused: boolean;
    lockPlayer: boolean;
  }
}

export const SAVE_KEY = 'feywild-save';

window.savingInProgress = false;
window.gameIsLoading = false;
window.paused = false;
window.lockPlayer = false;

export interface GameState {
  playerPosition: {x: number; y: number; z: number};
  health: number;
  level: number;
}

function onStartGame(detail: string | {[key: string]: unknown}) {
  dispatchEvent(new CustomEvent('startgame', {detail}));
}

export class Gamestate {
  state = {
    saves: 0,
    playerPosition: {x: 0.5, y: 0.5, z: 0.5},
    health: 100,
    level: 3,
    scene: 1,
    // ...other game-related data
  };

  newGame = () => {
    window.gameIsLoading = false;
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

    window.gameIsLoading = false;
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

      window.gameIsLoading = false;
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

  set(gamestate: Partial<GameState>) {
    this.state = {...this.state, ...gamestate};
  }
}
