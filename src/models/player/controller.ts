import {Mesh, Scene, Vector3} from 'three';
import {Direction, KeyboardState, Zone} from '../../types';
import {Pathfinding, PathfindingHelper} from 'three-pathfinding';
import {checkCollisions, getSimpleDirection} from '../helpers';

export class PlayerController {
  private keyboardState: KeyboardState = {};
  // Set up initial character properties
  private direction = new Vector3();
  private previousDirection: Direction = 'idle-down';
  private velocity = new Vector3();

  pathfinder: Pathfinding | undefined;
  private pathfindingHelper = new PathfindingHelper();

  target?: Vector3;
  public pauseMovement = false;
  
  public actions: {
    onKeydown?: (key: KeyboardEvent['key']) => void;
    onKeyUp?: (key: KeyboardEvent['key']) => void;
    onReachDestination?: () => void;
  } = {};

  constructor(private player: Mesh, public zone: Zone) {
    addEventListener('keydown', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = true;

      if (!event.repeat) this.actions?.onKeydown?.(key);
    });

    addEventListener('keyup', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = false;

      if (!event.repeat) this.actions?.onKeyUp?.(key);
    });

    addEventListener('blur', () => (this.keyboardState = {}));

    addEventListener('update-player-position', ({detail}) => {
      this.player?.position?.copy(detail.position);
    });
  }

  enablePathfinding(pathfinder: Pathfinding, scene: Scene) {
    this.pathfinder = pathfinder;
    this.pathfindingHelper.visible = false;

    if (import.meta.env.DEV) scene.add(this.pathfindingHelper);
  }

  simpleDirection(): Direction {
    return getSimpleDirection(this.direction, this.previousDirection);
  }

  move(speed: number, scene: Scene) {
    if (!window.lockPlayer) {
      const {keyboardState, direction, player, velocity} = this;
      // Calculate character's velocity based on keyboard input
      velocity.set(0, 0, 0);

      const blockedDirections = checkCollisions(scene, this.player);

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
  }

  update(scene: Scene) {
    const running = this.keyboardState['SHIFT'] ? 0.033 : 0;
    const moveSpeed = 0.1 + running;

    this.move(moveSpeed, scene);
  }
}
