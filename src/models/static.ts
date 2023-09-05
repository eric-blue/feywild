import {BoxGeometry, Mesh, MeshStandardMaterial, Vector3} from 'three';
import {StaticSprite} from './static/sprite';

interface Props {
  name?: string;
  position: Vector3;
  spriteSheet?: `./sprites/${string}.png`;
  tilesHorizontal?: number;
  tilesVertical?: number;
  tilesPosition?: number;
}

interface StaticComposition {
  // interactions
  StaticSprite?: new (...args: ConstructorParameters<typeof StaticSprite>) => StaticSprite;
}

export class Static {
  root: Mesh;
  staticSprite?: StaticSprite;

  constructor({StaticSprite}: StaticComposition, props: Props) {
    const geometry = new BoxGeometry(0.5, 5, 0.5);
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
      this.root.add(this.staticSprite.sprite);
    }
  }
}
