declare global {
  interface Window {
    savingInProgress: boolean;
    gameIsLoading: boolean;
    paused: boolean;
  }
}

export const SAVE_KEY = 'feywild-save';

window.savingInProgress = false;
window.gameIsLoading = true;
window.paused = false;

export interface GameState {
  playerPosition: {x: number; y: number; z: number};
  health: number;
  level: number;
}

export class Gamestate {
  gamestate = {
    playerPosition: {x: 0.5, y: 0.5, z: 0.5},
    health: 100,
    level: 3,
    scene: 1,
    // ...other game-related data
  };

  newGame = () => {
    window.gameIsLoading = false;
    console.log('new game!');
  };

  continueGame = () => {
    window.gameIsLoading = true;
    const serializedData = localStorage.getItem(SAVE_KEY);

    if (serializedData) {
      const loadedGameState = JSON.parse(serializedData);
      this.gamestate = loadedGameState;
    }

    window.gameIsLoading = false;
  };

  saveGame = () => {
    if (confirm("You're about to overwrite your progress. \nAre you sure?")) {
      window.savingInProgress = true;
      const serializedData = JSON.stringify(this.gamestate);

      console.log(serializedData);
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
        this.gamestate = loadedGameState;
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
}
