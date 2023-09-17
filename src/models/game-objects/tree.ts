import {Vector3} from 'three';
import {Static} from '../static';
import {StaticSprite} from '../static/sprite';

interface Props {
  position: Vector3;
  width: number;
  height: number;
  depth: number;

  spriteSheet: string;
  tilesPosition: number;

  large?: boolean;
}

export function Tree({position, width, height, depth, spriteSheet, tilesPosition, large}: Props) {
  const tree = new Static(
    {StaticSprite},
    {
      position,
      spriteSheet,
      spriteScale: [large ? 8 : 4, large ? 8 : 5, 1],
      spriteMarginBottom: large ? 2 : 0.65,
      tilesHorizontal: large ? 2 : 6,
      tilesVertical: large ? 2 : 4,
      tilesPosition,
      width,
      height,
      depth,
    }
  );

  return tree;
}
