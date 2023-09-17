import {NearestFilter, SRGBColorSpace, Sprite, SpriteMaterial, Texture, TextureLoader} from 'three';

export class StaticSprite {
  private textureLoader = new TextureLoader();
  private map: Texture;
  public sprite: Sprite;

  constructor(texture: string, tilesHorizontal = 8, tilesVertical = 8, tilesPosition = 0) {
    this.map = this.textureLoader.load(texture);

    this.map.magFilter = NearestFilter;
    this.map.colorSpace = SRGBColorSpace;
    this.map.repeat.set(1 / tilesHorizontal, 1 / tilesVertical);

    const offsetX = (tilesPosition % tilesHorizontal) / tilesHorizontal;
    const offsetY = (tilesVertical - Math.floor(tilesPosition / tilesHorizontal) - 1) / tilesVertical;

    this.map.offset.set(offsetX, offsetY);

    const material = new SpriteMaterial({map: this.map});
    this.sprite = new Sprite(material);
  }
}
