import { Box3, Mesh, Scene, Vector3 } from "three";
import { Direction, WASD } from "../types";

export function getPlayerPosition(scene: Scene) {
  return scene.children.find(mesh => mesh.name === 'player')?.position
}

export function getSimpleDirection(direction: Vector3, previousDirection: Direction): Direction {
  const {x, z} = direction;
  
  if (Math.abs(x) > Math.abs(z)) {
    return x > 0 ? 'right' : 'left';
  } else if (Math.abs(z) > Math.abs(x)) {
    return z > 0 ? 'down' : 'up';
  } else if (x === z && z !== 0) {
    return z > 0 ? 'right' : 'left';
  } else if (x === Math.abs(z) && z !== 0) {
    return z > 0 ? 'left' : 'right';
  } else if (Math.abs(x) === z && z !== 0) {
    return z > 0 ? 'left' : 'right';
  } else {
    if (previousDirection.includes('up')) {
      return 'idle-up';
    } else if (previousDirection.includes('right')) {
      return 'idle-right';
    } else if (previousDirection.includes('left')) {
      return 'idle-left';
    } else return 'idle-down';
  }
}

export function checkCollisions(scene: Scene, characterMesh: Mesh, boundingBox: Box3) {
  const tempBox = new Box3();
  const blockedDirections: WASD[] = [];

  boundingBox.setFromObject(characterMesh);
  const margin = 0.1; 
  boundingBox.expandByScalar(margin);

  // Check for intersections with other objects
  const colliders = (scene.children as Mesh[]).filter(mesh => mesh?.geometry?.type === 'BoxGeometry');
  for (const object of colliders) {
    if (object !== characterMesh) {
      tempBox.setFromObject(object);
      tempBox.expandByScalar(margin);

      if (boundingBox.intersectsBox(tempBox)) {
        // Handle collision behavior here
        const playerCenter = boundingBox.getCenter(new Vector3());
        const objectCenter = tempBox.getCenter(new Vector3());

        const collisionDirection = new Vector3();
        collisionDirection.subVectors(objectCenter, playerCenter).normalize();

        // Determine blocked directions based on collisionDirection
        if (Math.abs(collisionDirection.x) > Math.abs(collisionDirection.z)) {
          // Prevent movement along the positive x-axis
          if (collisionDirection.x > 0) blockedDirections.push('right');
          else blockedDirections.push('left'); // Prevent movement along the negative x-axis
        } else {
          // Prevent movement along the positive z-axis
          if (collisionDirection.z > 0) blockedDirections.push('down');
          else blockedDirections.push('up'); // Prevent movement along the negative z-axis
        }
      }
    }
  }

  return blockedDirections;
}
