import {Sprite, TextureLoader, SpriteMaterial, Texture, NearestFilter, Mesh, SRGBColorSpace} from 'three';
import {Direction, WASD} from '../../types';
import { CombatType } from './combat';

const IDLE_SPEED = 0.85;
const MOVE_SPEED = 0.85;

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
  paused = false;

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

  setNextFrame(direction?: Direction) {
    this.runningTileArrayIndex = (this.runningTileArrayIndex + 1) % this.playSpriteIndices.length;
    this.activeTile = this.playSpriteIndices[this.runningTileArrayIndex];

    const offsetX = (this.activeTile % this.tilesHorizontal) / this.tilesHorizontal;
    const offsetY =
      (this.tilesVertical - Math.floor(this.activeTile / this.tilesHorizontal) - 1) / this.tilesVertical;

    this.map.offset.set(offsetX, offsetY);

    const currentDirection = direction ?? this.currentAnimation.key;
    const nextAnimation = animations[currentDirection];

    if (this.currentAnimation.key !== nextAnimation.key) {
      this.currentAnimation = nextAnimation;
      const speed = currentDirection.includes('idle') ? IDLE_SPEED : MOVE_SPEED;
      this.loop(this.currentAnimation.tiles, speed);
    }
  }

  toggleAnimation(directionKey: CombatType|'idle'|'' = '', speed = IDLE_SPEED) {
    const direction = getWASDDirection(this.currentAnimation.key);
    const key = `${directionKey ? `${directionKey}-` : ''}${direction}` as Direction;
    this.currentAnimation = animations[key];
    this.loop(this.currentAnimation.tiles, speed);
  }

  update(delta: number, direction: Direction = 'idle-down') {
    if (this.paused) return;

    this.elapsedTime += delta;

    if (this.maxDisplayTime > 0 && this.elapsedTime >= this.maxDisplayTime) {
      this.elapsedTime = 0;
      this.setNextFrame(direction);
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
    sprite.scale.set(1, 1, 1);
  
    return {map, sprite};
  }

  startManualAnimate(type: CombatType | '') {
    this.paused = true;
    this.toggleAnimation(type, MOVE_SPEED);
    console.log('start', this.currentAnimation)
  }

  continueManualAnimate() {
    this.paused = true;
    this.setNextFrame();

    console.log('cont', this.currentAnimation)
  }

  endManualAnimate() {
    this.paused = false;
    this.toggleAnimation('idle', IDLE_SPEED);

    console.log('end', this.currentAnimation)
  }
}

function getWASDDirection(key: Direction): WASD {
  return key.split('-').at(-1) as WASD;
}


export class SpriteAnimation {
  constructor(
    public tiles: number[],
    public key: Direction
  ) {}
}

export const IDLE_UP = new SpriteAnimation([48, 49, 50, 51], 'idle-up');
export const IDLE_LEFT = new SpriteAnimation([24, 25, 26, 27], 'idle-left');
export const IDLE_DOWN = new SpriteAnimation([72, 73, 74, 75], 'idle-down');
export const IDLE_RIGHT = new SpriteAnimation([0, 1, 2, 3], 'idle-right');

export const RUN_UP = new SpriteAnimation([56, 57, 58, 59, 60, 61, 64, 65, 66, 67, 68, 69], 'up');
export const RUN_LEFT = new SpriteAnimation([32, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45], 'left');
export const RUN_DOWN = new SpriteAnimation([80, 81, 82, 83, 84, 85, 88, 89, 90, 91, 92, 93], 'down');
export const RUN_RIGHT = new SpriteAnimation([8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21], 'right');

// we likely dont need 8 frames for each attack
export const ATTACK_UP = new SpriteAnimation([104, 105, 106, 107, 108, 109, 110, 111], 'attack-up');
export const ATTACK_RIGHT = new SpriteAnimation([96, 97, 98, 99, 100, 101, 102, 103], 'attack-right');
export const ATTACK_LEFT = new SpriteAnimation([112, 113, 114, 115, 116, 117, 118, 119], 'attack-left');
export const ATTACK_DOWN = new SpriteAnimation([120, 121, 122, 123, 124, 125, 126, 127], 'attack-down');

// placeholder
export const DEFEND_UP = new SpriteAnimation([104, 105, 106, 107, 108, 109, 110, 111], 'defend-up');
export const DEFEND_RIGHT = new SpriteAnimation([96, 97, 98, 99, 100, 101, 102, 103], 'defend-right');
export const DEFEND_LEFT = new SpriteAnimation([112, 113, 114, 115, 116, 117, 118, 119], 'defend-left');
export const DEFEND_DOWN = new SpriteAnimation([120, 121, 122, 123, 124, 125, 126, 127], 'defend-down');

const animations = {
  'idle-up': IDLE_UP,
  'idle-left': IDLE_LEFT,
  'idle-down': IDLE_DOWN,
  'idle-right': IDLE_RIGHT,
  up: RUN_UP,
  left: RUN_LEFT,
  down: RUN_DOWN,
  right: RUN_RIGHT,
  'attack-up': ATTACK_UP,
  'attack-left': ATTACK_LEFT,
  'attack-down': ATTACK_DOWN,
  'attack-right': ATTACK_RIGHT,
  'defend-up': DEFEND_UP,
  'defend-left': DEFEND_LEFT,
  'defend-down': DEFEND_DOWN,
  'defend-right': DEFEND_RIGHT,
};
