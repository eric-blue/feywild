import {BoxGeometry, Mesh, MeshStandardMaterial, PlaneGeometry, Scene} from 'three';

/**
 * this is a test sandbox
 */
export class TestScene {
  scene = new Scene();

  constructor() {
    const planeGeometry = new PlaneGeometry(2000, 2000);
    const grassMaterial = new MeshStandardMaterial({color: '#5BA467'});
    const plane = new Mesh(planeGeometry, grassMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to make it flat
    plane.receiveShadow = true;
    this.scene.add(plane);

    const barrierGeometry = new BoxGeometry(10, 10, 5);
    const barrierMaterial = new MeshStandardMaterial({color: '#7F6429'});
    const barrier = new Mesh(barrierGeometry, barrierMaterial);
    // barrier.position.set(0, 4.9999, 2);
    barrier.position.set(430, 4.9999, 145);

    this.scene.add(barrier);

    window.gameIsLoading = false;
  }
}
