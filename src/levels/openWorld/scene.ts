import {Color, ObjectLoader, Scene} from 'three';

export class OpenWorldMap {
  scene = new Scene();
  loader = new ObjectLoader();

  constructor(render: () => void) {
    this.scene.background = new Color('white');

    this.loader.load(
      'scenes/open-world.json',
      loadedScene => {
        this.scene.add(...loadedScene.children);
        render();
      },
      progress => {
        console.log((progress.loaded / progress.total) * 100 + '% loaded');
      },
      error => {
        console.error('An error occurred while loading the scene:', error);
      }
    );
  }
}
