declare global {
  interface Window {
    savingInProgress: boolean;
    gameIsLoading: boolean;
  }
}

window.savingInProgress = false;
window.gameIsLoading = false;

export interface GameState {
  playerPosition: { x: number, y: number, z: number },
  health: number,
  level: number,
}

export class Gamestate {
  gamestate = {
    playerPosition: { x: 0.5, y: 0.5, z: 0.5 },
    health: 100,
    level: 3,
    // ...other game-related data
  };
  
  saveGame() {
    window.savingInProgress = true;
    const serializedData = JSON.stringify(this.gamestate);
    localStorage.setItem('feywild-save', serializedData);
    window.savingInProgress = false;
  }
  
  loadGame() {
    window.gameIsLoading = true;
    const serializedData = localStorage.getItem('feywild-save');

    if (serializedData) {
      const loadedGameState = JSON.parse(serializedData);
      this.gamestate = loadedGameState;
    }

    window.gameIsLoading = false;
  }
}