import {Box3, Mesh, Scene, Vector3} from 'three';
import {Pathfinding, PathfindingHelper} from 'three-pathfinding';
import {Direction, Zone} from '../../types';
import {
  checkCollisions,
  getPlayerPosition,
  getSimpleDirection,
} from '../helpers';

export class AIController {
  public boundingBox = new Box3();
  private pathfinder: Pathfinding | undefined;
  private pathfindingHelper: PathfindingHelper | undefined;
  private waypoint = new Vector3();

  // Set up initial character properties
  private direction = new Vector3();
  private previousDirection: Direction = 'idle-down';
  private velocity = new Vector3();

  constructor(
    public npc: Mesh,
    public zone: Zone
  ) {}

  simpleDirection(): Direction {
    // console.log(getSimpleDirection(this.direction, this.previousDirection))
    return getSimpleDirection(this.direction, this.previousDirection);
  }

  enablePathfinding(
    pathfinder: Pathfinding,
    pathfindingHelper?: PathfindingHelper
  ) {
    this.pathfinder = pathfinder;
    this.pathfindingHelper = pathfindingHelper; // might only want in DEV
  }

  move(speed: number, scene: Scene) {
    const {direction, npc, velocity, waypoint} = this;
    // Calculate character's velocity based on pathfinding waypoint
    velocity.set(0, 0, 0);

    const blockedDirections = checkCollisions(
      scene,
      this.npc,
      this.boundingBox
    );

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
    if (!window.gameIsLoading && this.pathfinder && shouldNavigate) {
      // should not only target the player, some NPCs wanna just move around based on a timer
      const targetPosition = getPlayerPosition(scene); // get target from player position IF in view

      if (targetPosition && this.zone) {
        const characterPosition = this.npc.position;
        // Set the player's default navigation mesh group (should be set by whatever is in save state)
        const groupID = this.pathfinder.getGroup(
          this.zone,
          targetPosition,
          true
        ); // todo this needs to be set on player controller?

        const targetGroupID = this.pathfinder.getGroup(
          this.zone,
          targetPosition,
          true
        );
        const closestTargetNode = this.pathfinder.getClosestNode(
          targetPosition,
          this.zone,
          targetGroupID,
          false
        );

        this.pathfindingHelper?.setPlayerPosition(characterPosition);
        this.pathfindingHelper?.setTargetPosition(targetPosition);

        // this.pathfindingHelper.reset().setPlayerPosition( targetPosition );
        if (closestTargetNode) {
          this.pathfindingHelper?.setNodePosition(closestTargetNode.centroid);
        }

        // Calculate a path to the target and store it
        const navpath = this.pathfinder.findPath(
          characterPosition,
          targetPosition,
          this.zone,
          groupID
        );

        if (navpath?.length) {
          // clear path
          this.waypoint.copy(navpath[0]);
          this.pathfindingHelper?.setPath(navpath);
          this.pathfindingHelper?.setTargetPosition(targetPosition);
        }

        // maybe go home if the PC is too far away?

        this.move(0.1, scene);
      }
    }
  }
}
