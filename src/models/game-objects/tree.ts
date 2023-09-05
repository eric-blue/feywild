import {Vector3} from 'three';
import {Static} from '../static';
import {StaticSprite} from '../static/sprite';

interface Props {
  position: Vector3;
  seed: number;
}

export function Tree({position, seed}: Props) {
  const tree = new Static(
    {StaticSprite},
    {
      position: position,
      spriteSheet: './sprites/trees.png',
      tilesHorizontal: 6,
      tilesVertical: 6,
      tilesPosition: generateConsistentNumber(seed),
    }
  );

  return tree;
}

function generateConsistentNumber(index: number) {
  // Simple mixing function to change index
  const mixedIndex = (index * 7 + 3) % 6;

  return mixedIndex;
}
