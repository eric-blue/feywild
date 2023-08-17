import {Box3, Mesh, Scene, Vector3} from 'three';
import { Direction, KeyboardState, WASD } from '../../types';

export class PlayerController {
  player: Mesh;
  playerBoundingBox = new Box3();

  keyboardState: KeyboardState = {};
  // Set up initial character properties
  direction = new Vector3();
  previousDirection: Direction = 'idle-down';
  velocity = new Vector3();

  constructor(player: Mesh) {
    this.player = player;

    addEventListener('keydown', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = true;

      if (event.key === ' ' && !event.repeat) {
        console.log('ATTACK') // Call the attack function when spacebar is pressed
      }

      console.log(key);
    });

    addEventListener('keyup', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = false;
    });

    addEventListener('blur', () => (this.keyboardState = {}));
  }

  checkCollisions(scene: Scene) {
    const tempBox = new Box3();
    const blockedDirections: WASD[] = [];
    
    // Update playerBoundingBox to match player's position
    this.playerBoundingBox.setFromObject(this.player);
    // Add a margin or "smidge" to the bounding box
    const margin = 0.1; // Adjust this value to your preference
    this.playerBoundingBox.expandByScalar(margin);

    // Check for intersections with other objects
    for (const object of (scene.children as Mesh[]).filter(
      mesh => mesh?.geometry?.type === 'BoxGeometry'
    )) {
      if (object !== this.player) {
        tempBox.setFromObject(object);
        tempBox.expandByScalar(margin);

        if (this.playerBoundingBox.intersectsBox(tempBox)) {
          // Handle collision behavior here
          const playerCenter = this.playerBoundingBox.getCenter(new Vector3());
          const objectCenter = tempBox.getCenter(new Vector3());

          const collisionDirection = new Vector3();
          collisionDirection.subVectors(objectCenter, playerCenter).normalize();

          // Determine blocked directions based on collisionDirection
          if (Math.abs(collisionDirection.x) > Math.abs(collisionDirection.z)) {
            if (collisionDirection.x > 0) {
              blockedDirections.push('right'); // Prevent movement along the positive x-axis
            } else {
              blockedDirections.push('left'); // Prevent movement along the negative x-axis
            }
          } else {
            if (collisionDirection.z > 0) {
              blockedDirections.push('down'); // Prevent movement along the positive z-axis
            } else {
              blockedDirections.push('up'); // Prevent movement along the negative z-axis
            }
          }
        }
      }
    }

    return blockedDirections;
  } 
  
  simpleDirection(): Direction {
    const {x, z} = this.direction

    if (Math.abs(x) > Math.abs(z)) {
      this.previousDirection = x > 0 ? 'right' : 'left';
    } else if (Math.abs(z) > Math.abs(x)) {
      this.previousDirection = z > 0 ? 'down' : 'up';
    } else if (x === z && z !== 0) {
      this.previousDirection = z > 0 ? 'right' : 'left';
    } else if (x === Math.abs(z) && z !== 0) {
      this.previousDirection = z > 0 ? 'left' : 'right';
    } else if (Math.abs(x) === z && z !== 0) {
      this.previousDirection = z > 0 ? 'left' : 'right';
    } else {
      if (this.previousDirection.includes('up')) this.previousDirection = 'idle-up';
      else if (this.previousDirection.includes('right')) this.previousDirection = 'idle-right';
      else if (this.previousDirection.includes('left')) this.previousDirection = 'idle-left';
      else this.previousDirection = 'idle-down';
    }
    
    return this.previousDirection;
  }

  update(scene: Scene) {
    const {keyboardState, direction, player, velocity} = this;
    // Calculate character's velocity based on keyboard input
    velocity.set(0, 0, 0);
    const running = keyboardState['SHIFT'] ? 0.1 : 0;
    const moveSpeed = 0.1 + running;

    const blockedDirection = this.checkCollisions(scene);

    if (keyboardState['ARROWUP'] || keyboardState['W']) {
      this.previousDirection = 'up';
      if (!blockedDirection.includes('up')) velocity.z -= moveSpeed;
    }
    if (keyboardState['ARROWDOWN'] || keyboardState['S']) {
      this.previousDirection = 'down';
      if (!blockedDirection.includes('down')) velocity.z += moveSpeed;
    }
    if (keyboardState['ARROWLEFT'] || keyboardState['A']) {
      this.previousDirection = 'left';
      if (!blockedDirection.includes('left')) velocity.x -= moveSpeed;
    }
    if (keyboardState['ARROWRIGHT'] || keyboardState['D']) {
      this.previousDirection = 'right';
      if (!blockedDirection.includes('right')) velocity.x += moveSpeed;
    }

    // Normalize velocity and apply it to character's position
    velocity.normalize();
    direction.copy(velocity);
    direction.multiplyScalar(moveSpeed);
    player.position.add(direction);
  }
}
