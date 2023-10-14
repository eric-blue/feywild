import {Sprite, TextureLoader, SpriteMaterial, Texture, NearestFilter, Mesh, SRGBColorSpace} from 'three';
import {Direction} from '../../types';

const IDLE_SPEED = 0.85;

type SpritePath = `./sprites/${string}.png`;

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

  constructor(player: Mesh, texture: SpritePath, tilesHorizontal = 8, tilesVertical = 16) {
    this.player = player;
    this.tilesHorizontal = tilesHorizontal;
    this.tilesVertical = tilesVertical;

    const {map, sprite} = this.loadSprite(texture, tilesHorizontal, tilesVertical);
    this.map = map;
    this.sprite = sprite;

    this.update(0);
    this.loop(IDLE_DOWN.tiles, IDLE_SPEED);

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
      const speed = direction.includes('idle') ? IDLE_SPEED : 0.85;
      this.loop(this.currentAnimation.tiles, speed);
    }
  }

  swapTexture(texture: SpritePath) {
    this.player.remove(this.sprite);

    const {map, sprite} = this.loadSprite(texture, this.tilesHorizontal, this.tilesVertical);
    this.map = map;
    this.sprite = sprite;

    this.player.add(this.sprite);
  }
  
  private loadSprite(texture: SpritePath, tilesHorizontal: number, tilesVertical: number) {
    const map = this.textureLoader.load(texture);
  
    map.magFilter = NearestFilter;
    map.repeat.set(1 / tilesHorizontal, 1 / tilesVertical);
    map.colorSpace = SRGBColorSpace;
  
    const material = new SpriteMaterial({map});
    const sprite = new Sprite(material);
    sprite.position.set(0, 0.5, 0);
    sprite.scale.set(2, 2, 1);
  
    return {map, sprite};
  }
}


export class SpriteAnimation {
  constructor(
    public tiles: number[],
    public key: string
  ) {}
}

export const IDLE_UP = new SpriteAnimation([48, 49, 50, 51], 'IDLE_UP');
export const IDLE_LEFT = new SpriteAnimation([24, 25, 26, 27], 'IDLE_LEFT');
export const IDLE_DOWN = new SpriteAnimation([72, 73, 74, 75], 'IDLE_DOWN');
export const IDLE_RIGHT = new SpriteAnimation([0, 1, 2, 3], 'IDLE_RIGHT');

export const RUN_UP = new SpriteAnimation([56, 57, 58, 59, 60, 61, 64, 65, 66, 67, 68, 69], 'RUN_UP');
export const RUN_LEFT = new SpriteAnimation([32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45], 'RUN_LEFT');
export const RUN_DOWN = new SpriteAnimation([80, 81, 82, 83, 84, 85, 88, 89, 90, 91, 92, 93], 'RUN_DOWN');
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
