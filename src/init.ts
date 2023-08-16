import {
  Scene,
  Color,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import {devTools} from './devtools';
import {Camera} from './camera';
import {Character} from './models/character';
import {PlayerController} from './models/player/controller';
import {Inventory} from './models/player/inventory';
import {Gamestate} from './gamestate';
import {PauseMenu} from './menus/pause';
import {Lights} from './lights';
import {StartMenu} from './menus/start';

const GS = new Gamestate();
const {gamestate} = GS;
new StartMenu(GS);
new PauseMenu(GS);

const scene = new Scene();
scene.background = new Color('white');

if (import.meta.env.DEV) devTools(scene);

const {sunlight} = new Lights(scene);
const {camera} = new Camera();

// Create a grassy plane
const planeGeometry = new PlaneGeometry(2000, 2000);
const grassMaterial = new MeshStandardMaterial({color: '#5BA467'});
const plane = new Mesh(planeGeometry, grassMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to make it flat
plane.receiveShadow = true;

scene.add(plane);

const player = new Character(
  {
    controller: PlayerController,
    // add compositon elements here..
    inventory: Inventory,
    // dialogue: Dialogue,
  },
  {
    position: gamestate.playerPosition ?? new Vector3(0.5, 0.5, 0.5),
  }
);

scene.add(player.mesh);

function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}

function handleRender(renderer: WebGLRenderer) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  if (
    !window.gameIsLoading &&
    !window.savingInProgress &&
    !window.paused &&
    !window.lockPlayer
  ) {
    camera.position.lerp(player.mesh.position, 0.04);
    gamestate.playerPosition = player.mesh.position;
    camera.position.y = 15; // keep the elevation;
    camera.position.z = camera.position.z + 0.75;

    player.controller.update(scene);

    // have the sun follow you to save of resources
    sunlight.target.position.copy(player.mesh.position);
    sunlight.target.updateMatrixWorld();
  }

  requestAnimationFrame(() => handleRender(renderer));

  renderer.render(scene, camera);
}

export function init(canvas?: HTMLCanvasElement) {
  try {
    const renderer = new WebGLRenderer({canvas: canvas});
    renderer.shadowMap.enabled = true;

    requestAnimationFrame(() => handleRender(renderer));
  } catch (error) {
    throw new Error('Could not find canvas element');
  }
}
