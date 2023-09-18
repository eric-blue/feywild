import {BoxGeometry, Mesh, MeshStandardMaterial, Vector3} from 'three';
import {StaticSprite} from './static/sprite';

interface Props {
  name?: string;
  position: Vector3;
  spriteSheet?: string;
  spriteScale?: SpriteScale;
  spriteMarginBottom?: number;
  tilesHorizontal?: number;
  tilesVertical?: number;
  tilesPosition?: number;

  width?: number;
  height?: number;
  depth?: number;
}

type SpriteScale = [x: number, y: number, z: number];

interface StaticComposition {
  // interactions
  StaticSprite?: new (...args: ConstructorParameters<typeof StaticSprite>) => StaticSprite;
}

export class Static {
  root: Mesh;
  staticSprite?: StaticSprite;

  constructor({StaticSprite}: StaticComposition, props: Props) {
    const geometry = new BoxGeometry(props.width ?? 0.5, props.height ?? 0.5, props.depth ?? 0.5);
    const material = new MeshStandardMaterial({visible: false, wireframe: true});

    this.root = new Mesh(geometry, material);
    this.root.name = props.name || 'generic-object';

    if (props.position) {
      this.root.position.set(props.position.x, props.position.y, props.position.z);
    }

    if (StaticSprite && props.spriteSheet) {
      this.staticSprite = new StaticSprite(
        props.spriteSheet,
        props.tilesHorizontal,
        props.tilesVertical,
        props.tilesPosition
      );

      this.staticSprite.sprite.position.set(
        this.root.position.x,
        this.root.position.y - (props.spriteMarginBottom ?? 0),
        this.root.position.z - (props.spriteMarginBottom ?? 0)
      );

      if (props.spriteScale) this.staticSprite.sprite.scale.set(...props.spriteScale);
    }
  }
}
