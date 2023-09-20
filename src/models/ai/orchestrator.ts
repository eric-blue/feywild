import {Scene, Vector3} from 'three';
import {getPlayerPosition} from '../helpers';

export class Orchestrator {
  public routeGenerator?: Generator<Vector3>;
  private elapsedTime = 0;
  private lastAttackTime = 0;

  constructor(route?: Vector3[]) {
    if (route) this.setRoute(route);
  }

  *loop(route: Vector3[]): Generator<Vector3> {
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

  attack(delta: number, predicate: () => boolean) {
    this.elapsedTime += delta;

    if (this.elapsedTime - this.lastAttackTime >= 1 && predicate()) {
      console.log('attack!');

      this.lastAttackTime = this.elapsedTime;
    }
  }
}
