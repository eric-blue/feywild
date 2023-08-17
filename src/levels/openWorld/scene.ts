import {
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
} from 'three';

// const textureLoader = new TextureLoader();

export class OpenWorldMap {
  scene = new Scene();

  constructor() {
    this.scene.background = new Color('white');

    // const map = textureLoader.load("path");
    const planeGeometry = new PlaneGeometry(2000, 2000);
    const grassMaterial = new MeshStandardMaterial({color: '#5BA467'});
    const plane = new Mesh(planeGeometry, grassMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to make it flat
    plane.receiveShadow = true;
    this.scene.add(plane);
  }
}
