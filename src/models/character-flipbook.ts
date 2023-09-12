import {Sprite, TextureLoader, SpriteMaterial, Texture, NearestFilter, Mesh} from 'three';
import {Direction} from '../types';

export class SpriteFlipbook {
  private player: Mesh;
  private textureLoader = new TextureLoader();
  private tilesHorizontal: number;
  private tilesVertical: number;
  private activeTile = 8;

  private map: Texture;
  private maxDisplayTime = 0;
  private elapsedTime = 0;
  private runningTileArrayIndex = 0;

  private currentAnimation = IDLE_DOWN;

  private playSpriteIndices: number[] = [];
  sprite: Sprite;

  constructor(player: Mesh, texture: string, tilesHorizontal = 8, tilesVertical = 8) {
    this.player = player;
    this.tilesHorizontal = tilesHorizontal;
    this.tilesVertical = tilesVertical;

    const {map, sprite} = loadSprite(this.textureLoader.load(texture), tilesHorizontal, tilesVertical);
<<<<<<< Updated upstream
    this.map = map
=======
    this.map = map;
>>>>>>> Stashed changes
    this.sprite = sprite;

    this.update(0);
    this.loop(IDLE_DOWN.tiles, 0.45);
<<<<<<< Updated upstream
    
=======

>>>>>>> Stashed changes
    this.player.add(this.sprite);
  }

  loop(playSpriteIndices: number[], totalDuration: number) {
    this.playSpriteIndices = playSpriteIndices;
    this.runningTileArrayIndex = 0;
    this.activeTile = playSpriteIndices[this.runningTileArrayIndex];
    this.maxDisplayTime = totalDuration / this.playSpriteIndices.length;
    this.elapsedTime = this.maxDisplayTime;
  }

  update(delta: number, direction: Direction = 'idle-down') {
    this.elapsedTime += delta;

    if (this.maxDisplayTime > 0 && this.elapsedTime >= this.maxDisplayTime) {
      this.elapsedTime = 0;
      this.runningTileArrayIndex = (this.runningTileArrayIndex + 1) % this.playSpriteIndices.length;
      this.activeTile = this.playSpriteIndices[this.runningTileArrayIndex];

      const offsetX = (this.activeTile % this.tilesHorizontal) / this.tilesHorizontal;
      const offsetY =
        (this.tilesVertical - Math.floor(this.activeTile / this.tilesHorizontal) - 1) / this.tilesVertical;

      this.map.offset.set(offsetX, offsetY);
    }

    const nextAnimation = animations[direction];

    if (this.currentAnimation.key !== nextAnimation.key) {
      this.currentAnimation = nextAnimation;
      this.loop(this.currentAnimation.tiles, 0.45);
    }
  }

  swapTexture(texture: `./sprites/${string}.png`) {
    this.player.remove(this.sprite);
<<<<<<< Updated upstream
    
    const {map, sprite} = loadSprite(this.textureLoader.load(texture), this.tilesHorizontal, this.tilesVertical);
    this.map = map
    this.sprite = sprite;

=======

    const {map, sprite} = loadSprite(this.textureLoader.load(texture), this.tilesHorizontal, this.tilesVertical);
    this.map = map;
    this.sprite = sprite;

>>>>>>> Stashed changes
    this.player.add(this.sprite);
  }
}

function loadSprite(loadedTexture: Texture, tilesHorizontal: number, tilesVertical: number) {
  const map = loadedTexture;

  map.magFilter = NearestFilter;
  map.repeat.set(1 / tilesHorizontal, 1 / tilesVertical);
  map.offset.set(0.125, 0.875); // this shouldn't be necessary

  const material = new SpriteMaterial({map});
  const sprite = new Sprite(material);
<<<<<<< Updated upstream
  
=======

>>>>>>> Stashed changes
  sprite.position.set(0, 0.5, 0);
  sprite.scale.set(2, 2, 1);

  return {map, sprite};
}

export class SpriteAnimation {
  constructor(
    public tiles: number[],
    public key: string
  ) {}
}

export const IDLE_UP = new SpriteAnimation([0, 1, 2, 3], 'IDLE_UP'); // TBD
export const IDLE_LEFT = new SpriteAnimation([24, 25, 26, 27], 'IDLE_LEFT');
export const IDLE_DOWN = new SpriteAnimation([24, 25, 26, 27], 'IDLE_DOWN'); // TBD
export const IDLE_RIGHT = new SpriteAnimation([0, 1, 2, 3], 'IDLE_RIGHT');

export const RUN_UP = new SpriteAnimation([8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21], 'RUN_UP'); // TBD
export const RUN_LEFT = new SpriteAnimation([32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45], 'RUN_LEFT');
export const RUN_DOWN = new SpriteAnimation([32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45], 'RUN_DOWN'); // TBD
export const RUN_RIGHT = new SpriteAnimation([8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21], 'RUN_RIGHT');

const animations = {
  'idle-up': IDLE_UP,
  'idle-left': IDLE_LEFT,
  'idle-down': IDLE_DOWN,
  'idle-right': IDLE_RIGHT,
  up: RUN_UP,
  left: RUN_LEFT,
  down: RUN_DOWN,
  right: RUN_RIGHT,
};
