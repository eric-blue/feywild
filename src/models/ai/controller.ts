import {Mesh, Scene, Vector3} from 'three';
import {Pathfinding, PathfindingHelper} from 'three-pathfinding';
import {Direction, Zone} from '../../types';
import {checkCollisions, getSimpleDirection} from '../helpers';

export class AIController {
  private pathfinder: Pathfinding | undefined;
  private pathfindingHelper = new PathfindingHelper();
  private waypoint = new Vector3();

  // Set up initial character properties
  private direction = new Vector3();
  private previousDirection: Direction = 'idle-down';
  private velocity = new Vector3();

  origin = new Vector3();
  target?: Vector3;
  isNavigating = false;

  public onReachDestination?: () => void;
  public pauseMovement = false;

  constructor(
    public npc: Mesh,
    public zone: Zone
  ) {
    this.origin = npc.position;
    this.target = this.origin;
  }

  simpleDirection(): Direction {
    const distance = this.npc.position.distanceTo(this.waypoint);
    const reach = 2.25;
    if (distance > reach) {
      return getSimpleDirection(this.direction, this.previousDirection);
    } else {
      return `idle-${this.previousDirection.replace('idle-', '')}` as Direction;
    }
  }

  enablePathfinding(pathfinder: Pathfinding, scene: Scene) {
    this.pathfinder = pathfinder;
    this.pathfindingHelper.visible = false;

    if (import.meta.env.DEV) scene.add(this.pathfindingHelper);
  }

  move(speed: number, scene: Scene) {
    this.isNavigating = true;
    const {direction, npc, velocity, waypoint} = this;
    // Calculate character's velocity based on pathfinding waypoint
    velocity.set(0, 0, 0);

    const blockedDirections = checkCollisions(scene, this.npc);

    if (waypoint.z < npc.position.z) {
      this.previousDirection = 'up';
      if (!blockedDirections.includes('up')) velocity.z -= speed;
    }
    if (waypoint.z > npc.position.z) {
      this.previousDirection = 'down';
      if (!blockedDirections.includes('down')) velocity.z += speed;
    }
    if (waypoint.x < npc.position.x) {
      this.previousDirection = 'left';
      if (!blockedDirections.includes('left')) velocity.x -= speed;
    }
    if (waypoint.x > npc.position.x) {
      this.previousDirection = 'right';
      if (!blockedDirections.includes('right')) velocity.x += speed;
    }

    // Normalize velocity and apply it to character's position
    velocity.normalize();
    direction.copy(velocity);
    direction.multiplyScalar(speed);
    npc.position.add(direction);
  }

  update(scene: Scene) {
    const shouldNavigate = this.waypoint !== this.npc.position;
    if (!window.gameIsLoading && !this.pauseMovement && this.pathfinder && shouldNavigate && this.target) {
      const targetPosition = this.target;

      if (targetPosition && this.zone) {
        const characterPosition = this.npc.position;

        const targetGroupID = this.pathfinder.getGroup(this.zone, targetPosition, true);

        if (targetGroupID !== undefined && targetGroupID !== null) {
          const closestTargetNode = this.pathfinder.getClosestNode(targetPosition, this.zone, targetGroupID, true);

          this.pathfindingHelper?.setPlayerPosition(characterPosition);
          this.pathfindingHelper?.setTargetPosition(targetPosition);

          // this.pathfindingHelper.reset().setPlayerPosition( targetPosition );
          if (closestTargetNode) {
            this.pathfindingHelper?.setNodePosition(closestTargetNode.centroid);
          }

          // Calculate a path to the target and store it
          const navpath = this.pathfinder.findPath(characterPosition, targetPosition, this.zone, targetGroupID);

          if (navpath?.length) {
            this.waypoint.copy(navpath[0]);
            this.pathfindingHelper?.setPath(navpath);
            this.pathfindingHelper?.setTargetPosition(targetPosition);
          }

          // maybe go home if the PC is too far away?
          const distance = this.npc.position.distanceTo(this.waypoint);
          const reach = 2.25;
          const farsight = 10;
          if (distance > reach) this.move(0.1, scene);
          if (distance > farsight) this.waypoint.copy(this.origin);
          if (distance <= reach && this.isNavigating) {
            this.isNavigating = false;
            this.onReachDestination?.();
          }
        }
      }
    }
  }
}
