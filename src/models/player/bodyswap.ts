import {SpriteFlipbook} from '../character-flipbook';

export class Bodyswap {
  constructor(flipbook: SpriteFlipbook) {
    addEventListener('keydown', ({key}) => {
      if (key === '1') flipbook.swapTexture('./sprites/forest-sprite.png');
      if (key === '2') flipbook.swapTexture('./sprites/mink.png');
      if (key === '3') flipbook.swapTexture('./sprites/trout.png');
    });
  }
}
