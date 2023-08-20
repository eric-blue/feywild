import { Scene, Vector3 } from "three"
import { getPlayerPosition } from "../helpers"

export class Orchestrator {
  public activeInstruction: () => void;
  public routeGenerator?: Generator<Vector3>;
  
  constructor(route?: Vector3[]) {
    // if run route
    if (route) this.setRoute(route);
    // if enemy
    this.activeInstruction = this.attack;
    // this.activeDestination
  }

  * loop(route: Vector3[]): Generator<Vector3> {
    let index = 0;

    while (true) {
      yield route[index];
      index = (index + 1) % route.length;
    }
  }

  setRoute(route: Vector3[]) {
    this.routeGenerator = this.loop(route);
  }

  trackPlayer(scene: Scene) {
    return getPlayerPosition(scene);
  }

  attack() {
    console.log('attack!')
    setInterval(() => console.log('attack!'), 1000);
  }
}
