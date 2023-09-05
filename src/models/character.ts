import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './character-flipbook';
import {Zone} from '../types';
import {Orchestrator} from './ai/orchestrator';
import {Dialogue} from './ai/dialogue';
import {isTouchingPlayer} from './helpers';
import {Bodyswap} from './player/bodyswap';

interface Props {
  name?: string;
  position: GameState['playerPosition'];
  spriteSheet?: `./sprites/${string}.png`;
  dialogueJSON?: string;
  zone: Zone;
  route?: Vector3[];
  specs?: {
    reach: number;
  };
}

interface CharacterComposition {
  Controller: new (mesh: Mesh, zone: Zone) => PlayerController | AIController;
  Orchestrator?: new (route?: Vector3[]) => Orchestrator;
  InventoryModule?: new () => Inventory;
  FlipbookModule?: new (texture: string) => SpriteFlipbook;
  Dialogue?: new (mesh: Mesh, json: string) => Dialogue;
  BodyswapModule?: new (flipbook: SpriteFlipbook) => Bodyswap;
}

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
  specs?: Props['specs'];

  onAppear?: () => void;
  onExit?: () => void;

  bodyswap?: Bodyswap;

  constructor(
    {
      Controller,
      Orchestrator,
      InventoryModule,
      FlipbookModule,
      Dialogue,
      BodyswapModule,
    }: CharacterComposition,
    props: Props = {
      position: new Vector3(0.5, 0.5, 0.5),
      spriteSheet: undefined,
      zone: 'village-square',
      specs: {
        reach: 2.25,
      },
    }
  ) {
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({visible: false});
    this.root = new Mesh(geometry, material);
    this.root.position.set(
      props.position.x,
      props.position.y,
      props.position.z
    );
    this.root.name = props.name || 'generic-character';
    this.specs = props.specs;

    if (FlipbookModule && props.spriteSheet) {
      this.flipbook = new FlipbookModule(props.spriteSheet);
      this.bodyswap = BodyswapModule
        ? new BodyswapModule(this.flipbook)
        : undefined;
      this.root.add(this.flipbook.sprite);
    }

    this.inventory = InventoryModule ? new InventoryModule() : undefined;
    this.controller = new Controller(this.root, props.zone);
    this.orchestrator = Orchestrator
      ? new Orchestrator(props.route)
      : undefined;
    this.dialogue =
      Dialogue && props.dialogueJSON
        ? new Dialogue(this.root, props.dialogueJSON)
        : undefined;
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
          const predicate = isTouchingPlayer(
            this.specs?.reach || 1,
            this.root,
            scene
          );
          this.orchestrator!.attack(predicate);
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
