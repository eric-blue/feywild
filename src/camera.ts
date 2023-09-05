import {PerspectiveCamera, Vector3} from 'three';

const fov = 45;
const aspect = 2; // the canvas default
const near = 0.01;
const far = 100;

export class Camera {
  camera = new PerspectiveCamera(fov, aspect, near, far);
  target: Vector3 | (() => Vector3) = new Vector3();

  setTarget(target: Vector3 | (() => Vector3)) {
    this.target = target;
  }

  updateAspectRatio(canvas: HTMLCanvasElement) {
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    const follow = typeof this.target === 'function' ? this.target() : this.target;

    this.camera.position.copy(follow);
    this.camera.position.y += 18;
    this.camera.position.z += 14.75;
    this.camera.lookAt(follow);
  }
}
