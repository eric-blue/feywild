import {Scene, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Camera} from './camera';
import {getPlayerPosition} from './models/helpers';

interface Devtools {
  camera: Camera;
  renderer: WebGLRenderer;
}

export async function devtools({camera, renderer}: Devtools) {
  console.log(
    '%c[Dev Mode]',
    'font-size: 24px; font-weight: bold; color: red; background-color: black; padding: 10px;'
  );

  const orbitControls = new OrbitControls(camera.camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.minDistance = 5;
  orbitControls.enabled = false;

  orbitControls.update();

  addEventListener('keydown', ({key}) => {
    if (key === 'F3') {
      orbitControls.enabled = window._orbitControls = !window._orbitControls;
      console.log(`orbit controls: ${orbitControls.enabled}`);
      orbitControls.target = getPlayerPosition(window._currentScene as Scene);
      if (!orbitControls.enabled) camera.setTarget(camera.camera.position);
    }
  });
}
