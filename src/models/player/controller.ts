import {Box3, Mesh, Scene, Vector3} from 'three';
import {Direction, KeyboardState} from '../../types';
import { Pathfinding, PathfindingHelper } from 'three-pathfinding';
import { checkCollisions, getSimpleDirection } from '../helpers';

export class PlayerController {
  private player: Mesh;
  public playerBoundingBox = new Box3();

  private keyboardState: KeyboardState = {};
  // Set up initial character properties
  private direction = new Vector3();
  private previousDirection: Direction = 'idle-down';
  private velocity = new Vector3();
  
  pathfinder: Pathfinding|undefined; 
  pathfindingHelper: PathfindingHelper|undefined;

  constructor(player: Mesh) {
    this.player = player;

    addEventListener('keydown', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = true;

      if (event.key === ' ' && !event.repeat) {
        // this should be moved to a diff module
        console.log('ATTACK'); // Call the attack function when spacebar is pressed
      }

      console.log(key);
    });

    addEventListener('keyup', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = false;
    });

    addEventListener('blur', () => (this.keyboardState = {}));
  }

  enablePathfinding(pathfinder: Pathfinding, pathfindingHelper?: PathfindingHelper) {
    this.pathfinder = pathfinder;
    this.pathfindingHelper = pathfindingHelper; // might only want in DEV
  }

  simpleDirection(): Direction {
    return getSimpleDirection(this.direction, this.previousDirection);
  }

  move(speed: number, scene: Scene) {
    const {keyboardState, direction, player, velocity} = this;
    // Calculate character's velocity based on keyboard input
    velocity.set(0, 0, 0);

    const blockedDirections = checkCollisions(scene, this.player, this.playerBoundingBox);

    if (keyboardState['ARROWUP'] || keyboardState['W']) {
      this.previousDirection = 'up';
      if (!blockedDirections.includes('up')) velocity.z -= speed;
    }
    if (keyboardState['ARROWDOWN'] || keyboardState['S']) {
      this.previousDirection = 'down';
      if (!blockedDirections.includes('down')) velocity.z += speed;
    }
    if (keyboardState['ARROWLEFT'] || keyboardState['A']) {
      this.previousDirection = 'left';
      if (!blockedDirections.includes('left')) velocity.x -= speed;
    }
    if (keyboardState['ARROWRIGHT'] || keyboardState['D']) {
      this.previousDirection = 'right';
      if (!blockedDirections.includes('right')) velocity.x += speed;
    }

    // Normalize velocity and apply it to character's position
    velocity.normalize();
    direction.copy(velocity);
    direction.multiplyScalar(speed);
    player.position.add(direction);
  }

  update(scene: Scene) {
    const running = this.keyboardState['SHIFT'] ? 0.1 : 0;
    const moveSpeed = 0.1 + running;

    this.move(moveSpeed, scene)
  }
}
