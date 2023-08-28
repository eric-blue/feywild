import {Box3, Mesh, Scene, Vector3} from 'three';
import {Direction, WASD} from '../types';

export function getPlayerPosition(scene: Scene) {
  return scene.children.find(mesh => mesh.name === 'player')?.position || new Vector3();
}

export function getDistanceToPlayer(mesh: Mesh, scene: Scene) {
  const player = getPlayerPosition(scene);
  if (player) return mesh.position.distanceTo(player);
  return Infinity;
}

export function isTouchingPlayer(reach: number, mesh: Mesh, scene: Scene) {
  return getDistanceToPlayer(mesh, scene) <= reach;
}

export function addListener(id: `#${string}`, method: (id: string) => void) {
  document
    .querySelector(id)
    ?.addEventListener('click', () => method(id.replace('#', '')));
}

export function removeListener(id: `#${string}`, method: (id: string) => void) {
  document
    .querySelector(id)
    ?.removeEventListener('click', () => method(id.replace('#', '')));
}

export function getSimpleDirection(
  direction: Vector3,
  previousDirection: Direction
): Direction {
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

export function checkCollisions(
  scene: Scene,
  characterMesh: Mesh,
  boundingBox: Box3
) {
  const tempBox = new Box3();
  const blockedDirections: WASD[] = [];

  boundingBox.setFromObject(characterMesh);

  // Check for intersections with other objects
  const colliders = (scene.children as Mesh[]).filter(
    mesh => mesh?.geometry?.type === 'BoxGeometry' && 
    mesh.geometry.name !== 'floor'
  );
  
  for (const object of colliders) {
    if (object !== characterMesh) {
      tempBox.setFromObject(object);

      if (boundingBox.intersectsBox(tempBox)) {
        // Calculate penetration depths in x and z
        const xPenetration = Math.min(
          boundingBox.max.x - tempBox.min.x,
          tempBox.max.x - boundingBox.min.x
        );
        
        const zPenetration = Math.min(
          boundingBox.max.z - tempBox.min.z,
          tempBox.max.z - boundingBox.min.z
        );

        // Determine which direction has the least penetration
        if (xPenetration < zPenetration) {
          if (boundingBox.max.x > tempBox.min.x && boundingBox.min.x < tempBox.min.x) {
            blockedDirections.push('right');
          } else {
            blockedDirections.push('left');
          }
        } else {
          if (boundingBox.max.z > tempBox.min.z && boundingBox.min.z < tempBox.min.z) {
            blockedDirections.push('down');
          } else {
            blockedDirections.push('up');
          }
        }
      }
    }
  }

  return blockedDirections;
}

