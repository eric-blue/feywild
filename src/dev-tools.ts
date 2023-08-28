import {WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Camera} from './camera';

interface Devtools {
  camera: Camera;
  renderer: WebGLRenderer;
}

export async function devtools({camera, renderer}: Devtools) {
  console.log(
    '%c[Dev Mode]',
    'font-size: 24px; font-weight: bold; color: red; background-color: black; padding: 10px;'
  );

  const orbitControls = new OrbitControls(
    camera.camera,
    renderer.domElement
  );
  orbitControls.enableDamping = true;
  orbitControls.minDistance = 5;
  orbitControls.enabled = false;

  orbitControls.update();

  addEventListener('keydown', ({key}) => {
    if (key === 'F3') {
      orbitControls.enabled = window._orbitControls = !window._orbitControls;
      console.log(`orbit controls: ${orbitControls.enabled}`);
      if (!orbitControls.enabled) camera.reset();
    }

    if (key === 'F4') {
      const pfh = (window._pathfindingHelper.visible =
        !window._pathfindingHelper.visible);
      console.log(`pathfinder helper: ${pfh}`);
      const navmeshes = window._currentScene?.children.filter(
        mesh => mesh.name === 'navmesh'
      );
      navmeshes?.forEach(mesh => (mesh.visible = pfh));
    }
  });
}
