import {
  Scene,
  Color,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Clock,
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
import {OpenWorldMap} from './levels/openWorld/scene';
import { IDLE_RIGHT, SpriteFlipbook } from './models/character-flipbook';

const clock = new Clock();
const GS = new Gamestate();
const {gamestate} = GS;
// new StartMenu(GS);
new PauseMenu(GS);

const {scene} = new OpenWorldMap();
const {sunlight} = new Lights(scene);
const {camera} = new Camera();

if (import.meta.env.DEV) devTools(scene);

const player = new Character(
  {
    Controller: PlayerController,
    InventoryModule: Inventory,
    FlipbookModule: SpriteFlipbook,
    // add compositon elements here..
    // dialogue: Dialogue,
  },
  {
    position: gamestate.playerPosition,
  }
);

scene.add(player.root)

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
    const deltaTime = clock.getDelta();

    camera.position.lerp(player.root.position, 0.04);
    gamestate.playerPosition = player.root.position;
    camera.position.y = 15; // keep the elevation;
    camera.position.z = camera.position.z + 0.75;

    player.update(scene, deltaTime);

    // have the sun follow you to save of resources
    sunlight.target.position.copy(player.root.position);
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
