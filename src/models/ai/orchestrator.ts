import {Scene, Vector3} from 'three';
import {getPlayerPosition} from '../helpers';

/**
 * Think of this module as a conductor for the AI.
 * It's responsible for acting as a brain. 
 * **Not needed for the player character.
 */
export class Orchestrator {
  public routeGenerator?: Generator<Vector3>;
  private elapsedTime = 0;
  private lastTick = 0;
  public actions: {
    onNextTick?: () => void;
  } = {};

  constructor(route?: [x: number, y: number, z: number][]) {
    if (route) this.setRoute(route);
  }

  *loop(route: Vector3[]): Generator<Vector3> {
    let index = 0;

    while (true) {
      yield route[index];
      index = (index + 1) % route.length;
    }
  }

  setRoute(route: [x: number, y: number, z: number][]) {
    const routeVector = route.map(([x, y, z]) => new Vector3(x, y, z));
    this.routeGenerator = this.loop(routeVector);
  }

  trackPlayer(scene: Scene) {
    return getPlayerPosition(scene);
  }

  nextTick(delta: number, predicate: () => boolean) {
    this.elapsedTime += delta;

    if (this.elapsedTime - this.lastTick >= 1 && predicate()) {
      this.actions.onNextTick?.();
      this.lastTick = this.elapsedTime;
    }
  }
}
