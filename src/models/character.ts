import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './character-flipbook';
import {Zone} from '../types';
import {Orchestrator} from './ai/orchestrator';
import {Dialogue} from './ai/dialogue';
import {Bodyswap} from './player/bodyswap';

import {isTouchingPlayer} from './helpers';

interface Props {
  name?: string;
  position: GameState['playerPosition'];
  spriteSheet?: `./sprites/${string}.png`;
  dialogueJSON?: string;
  zone: Zone;
  route?: Vector3[];
  stats?: {
    reach: number;
    farsight: number;
    speed: number;
  };
}

interface CharacterComposition {
  Controller: new (
    ...args: ConstructorParameters<typeof PlayerController | typeof AIController>
  ) => PlayerController | AIController;
  Orchestrator?: new (...args: ConstructorParameters<typeof Orchestrator>) => Orchestrator;
  InventoryModule?: new (...args: ConstructorParameters<typeof Inventory>) => Inventory;
  FlipbookModule?: new (...args: ConstructorParameters<typeof SpriteFlipbook>) => SpriteFlipbook;
  Dialogue?: new (...args: ConstructorParameters<typeof Dialogue>) => Dialogue;
  BodyswapModule?: new (...args: ConstructorParameters<typeof Bodyswap>) => Bodyswap;
}

const defaultStats = {
  reach: 2.25,
  farsight: 10,
  speed: 0.1,
};

/**
 * A base actor class for spawning in NPCs or player
 * characters; basically anything you expect to live,
 * move, and breathe.
 *
 * Built using Composition principles (vs Inheritence)
 */
export class Character {
  root: Mesh;
  controller: PlayerController | AIController;
  orchestrator?: Orchestrator;
  inventory?: Inventory;
  flipbook?: SpriteFlipbook;
  dialogue?: Dialogue;
  bodyswap?: Bodyswap;

  stats?: Props['stats'] = defaultStats;
  onAppear?: () => void;
  onExit?: () => void;

  constructor(
    {Controller, Orchestrator, InventoryModule, FlipbookModule, Dialogue, BodyswapModule}: CharacterComposition,
    props: Props = {
      position: new Vector3(0.5, 0.5, 0.5),
      spriteSheet: undefined,
      zone: 'village-square',
    }
  ) {
    const geometry = new BoxGeometry(0.25, 2, 2);
    const material = new MeshStandardMaterial({visible: false});

    this.root = new Mesh(geometry, material);
    this.root.name = props.name || 'generic-character';
    if (props.stats) this.stats = {...this.stats, ...props.stats};

    if (props.position) {
      this.root.position.set(props.position.x, props.position.y, props.position.z);
    }

    if (FlipbookModule && props.spriteSheet) {
      this.flipbook = new FlipbookModule(this.root, props.spriteSheet);
      this.bodyswap = BodyswapModule ? new BodyswapModule(this.flipbook) : undefined;
    }

    this.inventory = InventoryModule ? new InventoryModule() : undefined;
    this.controller = new Controller(this.root, props.zone);
    this.orchestrator = Orchestrator ? new Orchestrator(props.route) : undefined;
    this.dialogue = Dialogue && props.dialogueJSON ? new Dialogue(this.root, props.dialogueJSON) : undefined;
  }

  create(scene: Scene) {
    if (this.dialogue) {
      this.dialogue.isTouchingPlayer = () => {
        return isTouchingPlayer(2.2, this.root, scene);
      };

      this.dialogue.onDialogueEnd = () => {
        this.controller.pauseMovement = false;
        this.onExit?.();
      };

      this.dialogue.onDialogueStart = () => {
        this.controller.pauseMovement = true;
      };
    }

    if (this.orchestrator) {
      if (this.orchestrator.routeGenerator) {
        this.controller.onReachDestination = () => {
          const next = this.orchestrator!.routeGenerator!.next().value;
          this.controller.target = next;
        };
      } else {
        // assume enemy
        this.controller.onReachDestination = () => {
          // this.orchestrator!.attack(() => isTouchingPlayer(this.stats?.reach || 2, this.root, scene));
        };
      }
    }
    scene.add(this.root);
  }

  destroy(scene: Scene) {
    scene.remove(this.root);
  }

  update(scene: Scene, delta: number) {
    this.controller.update(scene);
    this.flipbook?.update(delta, this.controller.simpleDirection());
  }
}
