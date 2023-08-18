import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './character-flipbook';
import { Zone } from '../types';

interface Setup {
  name?: string;
  position: GameState['playerPosition'];
  spriteSheet?: `./sprites/${string}.png`;
  zone: Zone;
}

const config: Setup = {
  position: new Vector3(0.5, 0.5, 0.5),
  spriteSheet: undefined,
  zone: 'village-square',
};

interface CharacterComposition {
  Controller: new (mesh: Mesh, zone: Zone) => PlayerController | AIController;
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
  inventory?: Inventory;
  flipbook?: SpriteFlipbook;

  constructor(
    {Controller, InventoryModule, FlipbookModule}: CharacterComposition,
    setup = config
  ) {
    const geometry = new BoxGeometry(1, 2, 1);
    const material = new MeshStandardMaterial({visible: false});
    this.root = new Mesh(geometry, material);
    this.root.position.set(
      setup.position.x,
      setup.position.y,
      setup.position.z
    );
    this.root.name = setup.name || 'generic-character';

    if (FlipbookModule && setup.spriteSheet) {
      this.flipbook = new FlipbookModule(setup.spriteSheet);
      this.root.add(this.flipbook.sprite);
    }

    this.controller = new Controller(this.root, config.zone);
    this.inventory = InventoryModule ? new InventoryModule() : undefined;
  }

  update(scene: Scene, delta: number) {
    this.controller.update(scene);
    this.flipbook?.update(delta, this.controller.simpleDirection());
  }
}
