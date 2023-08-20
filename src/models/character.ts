import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './character-flipbook';
import {Zone} from '../types';
import { Orchestrator } from './ai/orchestrator';

interface Props {
  name?: string;
  position: GameState['playerPosition'];
  spriteSheet?: `./sprites/${string}.png`;
  zone: Zone;
  route?: Vector3[];
}

interface CharacterComposition {
  Controller: new (mesh: Mesh, zone: Zone) => PlayerController | AIController;
  Orchestrator?: new (route?: Vector3[]) => Orchestrator;
  InventoryModule?: new () => Inventory;
  FlipbookModule?: new (texture: string) => SpriteFlipbook;
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

  constructor(
    {Controller, Orchestrator, InventoryModule, FlipbookModule}: CharacterComposition,
    props: Props = {
      position: new Vector3(0.5, 0.5, 0.5),
      spriteSheet: undefined,
      zone: 'village-square',
    }
  ) {
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({visible: false});
    this.root = new Mesh(geometry, material);
    this.root.position.set(props.position.x, props.position.y, props.position.z);
    this.root.name = props.name || 'generic-character';

    if (FlipbookModule && props.spriteSheet) {
      this.flipbook = new FlipbookModule(props.spriteSheet);
      this.root.add(this.flipbook.sprite);
    }

    this.inventory = InventoryModule ? new InventoryModule() : undefined;
    this.controller = new Controller(this.root, props.zone);
    this.orchestrator = Orchestrator ? new Orchestrator(props.route) : undefined;

    if (this.orchestrator && this.orchestrator.routeGenerator) {
      this.controller.onReachDestination = () => {
        const next = this.orchestrator!.routeGenerator!.next().value;
        this.controller.target = next;
      }
    }
    
  }

  update(scene: Scene, delta: number) {
    this.controller.update(scene);
    this.flipbook?.update(delta, this.controller.simpleDirection());
  }
}
