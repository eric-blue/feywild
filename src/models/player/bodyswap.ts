import {SpriteFlipbook} from '../character-flipbook';

export class Bodyswap {
  constructor(flipbook: SpriteFlipbook) {
    console.log('transformer');

    addEventListener('keydown', ({key}) => {
      if (key === '1') flipbook.swapTexture('./sprites/forest-sprite.png'); //Sprite
      if (key === '2') flipbook.swapTexture('./sprites/mink.png'); // Mink
      if (key === '3') flipbook.swapTexture('./sprites/trout.png'); // trout
    });
  }
}
