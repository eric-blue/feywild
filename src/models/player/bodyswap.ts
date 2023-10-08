import {SpriteFlipbook} from '../shared/flipbook';
import { BaseStats } from '../shared/stats';

type UsefulStats = Pick<BaseStats, "defence"|"farsight"|"power"|"reach"|"speed">;
interface BodyForm extends UsefulStats {
  sprite: string;
}

const forms: {[key: number]: BodyForm} = {
  1: {sprite: 'forest-sprite', power: 1, defence: 1, speed: 0.1, reach: 2.25, farsight: 10},
  2: {sprite: 'mink', power: 1, defence: 1, speed: 0.2, reach: 2.25, farsight: 15},
  3: {sprite: 'trout', power: 0, defence: 1, speed: 0, reach: 0, farsight: 10},
}

export class Bodyswap {
  public onSwap?: (newStats: UsefulStats) => void;

  constructor(public flipbook: SpriteFlipbook) {
    addEventListener('keydown', ({key}) => {
      this.swap(key as `${number}`);
    });
  }

  swap(key: `${number}`) {
    const body = forms[parseFloat(key) as number];
    if (!body) return;

    this.flipbook.swapTexture(`./sprites/${body.sprite}.png`);
    this.onSwap?.(body);
  }
}
