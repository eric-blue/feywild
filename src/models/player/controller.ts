import {Box3, Mesh, Scene, Vector3} from 'three';

interface KeyboardState {
  [key: string]: boolean;
}

export class PlayerController {
  player: Mesh;
  playerBoundingBox = new Box3();

  keyboardState: KeyboardState = {};
  // Set up initial character properties
  direction = new Vector3();
  velocity = new Vector3();

  constructor(mesh: Mesh) {
    this.player = mesh;

    addEventListener('keydown', event => {
      const key = event.key.toUpperCase();
      this.keyboardState[key] = true;

      if (event.key === ' ' && !event.repeat) {
        // playerAttack(); // Call the attack function when spacebar is pressed
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
    let blockedDirection = null;
    // Update playerBoundingBox to match player's position
    this.playerBoundingBox.setFromObject(this.player);
    // Add a margin or "smidge" to the bounding box
    const margin = 0.1; // Adjust this value to your preference
    this.playerBoundingBox.expandByScalar(margin);

    // Check for intersections with other objects
    for (const object of scene.children.filter(
      // @ts-expect-error dunno why, it's def there...
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
              blockedDirection = 'right'; // Prevent movement along the positive x-axis
            } else {
              blockedDirection = 'left'; // Prevent movement along the negative x-axis
            }
          } else {
            if (collisionDirection.z > 0) {
              blockedDirection = 'down'; // Prevent movement along the positive z-axis
            } else {
              blockedDirection = 'up'; // Prevent movement along the negative z-axis
            }
          }
        }
      }
    }

    return blockedDirection;
  }

  update(scene: Scene) {
    const {keyboardState, direction, player, velocity} = this;
    // Calculate character's velocity based on keyboard input
    velocity.set(0, 0, 0);
    const running = keyboardState['SHIFT'] ? 0.1 : 0;
    const moveSpeed = 0.1 + running;

    const blockedDirection = this.checkCollisions(scene);

    if (keyboardState['ARROWUP'] || keyboardState['W']) {
      if (blockedDirection !== 'up') velocity.z -= moveSpeed;
    }
    if (keyboardState['ARROWDOWN'] || keyboardState['S']) {
      if (blockedDirection !== 'down') velocity.z += moveSpeed;
    }
    if (keyboardState['ARROWLEFT'] || keyboardState['A']) {
      if (blockedDirection !== 'left') velocity.x -= moveSpeed;
    }
    if (keyboardState['ARROWRIGHT'] || keyboardState['D']) {
      if (blockedDirection !== 'right') velocity.x += moveSpeed;
    }

    // Normalize velocity and apply it to character's position
    velocity.normalize();
    direction.copy(velocity);
    direction.multiplyScalar(moveSpeed);
    player.position.add(direction);

    return direction;
  }
}
