import {Scene, Vector3} from 'three';
import {getPlayerPosition} from '../helpers';

export class Orchestrator {
  public routeGenerator?: Generator<Vector3>;
  private elapsedTime = 0;
  private lastAttackTime = 0;

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

  attack(delta: number, predicate: () => boolean) {
    this.elapsedTime += delta;

    if (this.elapsedTime - this.lastAttackTime >= 1 && predicate()) {
      console.log('attack!');

      this.lastAttackTime = this.elapsedTime;
    }
  }
}
