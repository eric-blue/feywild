import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
  Sprite,
  Vector3,
} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './character-flipbook';

interface Setup {
  position: GameState['playerPosition'];
}

const config: Setup = {
  position: new Vector3(0.5, 0.5, 0.5),
};

interface CharacterComposition {
  Controller: new (mesh: Mesh) => PlayerController | AIController;
  InventoryModule?: new () => Inventory;
  FlipbookModule?: new (texture: string) => SpriteFlipbook;
}

export class Character {
  root: Mesh | Sprite;
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

    if (FlipbookModule) {
      this.flipbook = new FlipbookModule('./sprites/forest-sprite.png');
      this.root.add(this.flipbook.sprite);
    }
    this.controller = new Controller(this.root);
    this.inventory = InventoryModule ? new InventoryModule() : undefined;
  }

  update(scene: Scene, delta: number) {
    this.controller.update(scene);
    this.flipbook?.update(delta, this.controller.simpleDirection());
  }
}
