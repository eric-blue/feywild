import {PerspectiveCamera} from 'three';

const fov = 45;
const aspect = 2; // the canvas default
const near = 0.01;
const far = 100;

export class Camera {
  camera = new PerspectiveCamera(fov, aspect, near, far);

  constructor() {
    // make the camera look down
    this.camera.position.set(0, 10, 12.5);
    this.camera.up.set(0, 0, -1);
    this.camera.lookAt(0, 0, 0);
  }
}
