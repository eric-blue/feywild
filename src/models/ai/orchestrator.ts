import {Scene, Vector3} from 'three';
import {getPlayerPosition} from '../helpers';

type Coords = [x: number, y: number, z: number];

/**
 * Think of this module as a conductor for the AI.
 * It's responsible for acting as a brain. 
 * **Not needed for the player character.
 */
export class Orchestrator {
  /** a `null` value triggers a destroy for the NPC */
  public routeGenerator?: Generator<Vector3 | null, Vector3 | null, Vector3 | null>;
  private elapsedTime = 0;
  private lastTick = 0;
  public actions: {
    onNextTick?: () => void;
  } = {};

  constructor(route?: (Coords | null)[]) {
    if (route) this.setRoute(route);
  }

  /** returning a `null` value triggers a destroy for the NPC */
  *loop(route: (Vector3 | null)[]): Generator<Vector3 | null> {
    let index = 0;

    while (true) {
      yield route[index];
      index = (index + 1) % route.length;
    }
  }

  setRoute(route: (Coords | null)[]) {
    const routeVector = route.map((coord) => {
      if (coord) return new Vector3(...coord);
      return null;
    });
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
