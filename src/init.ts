import {
  AmbientLight,
  Scene,
  Color,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  DirectionalLight,
  DirectionalLightHelper,
} from 'three';
import {devTools} from './devtools';
import {Camera} from './camera';
import {Character} from './models/character';
import {PlayerController} from './models/player/controller';

const {camera} = new Camera();

const scene = new Scene();
scene.background = new Color('black');

if (import.meta.env.DEV) devTools(scene);

const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunlight = new DirectionalLight(0xffffff, 5);
sunlight.position.set(500, 800, -1000); // Position at the top middle
sunlight.target.position.set(0, 0, 0); // Point back at the center
sunlight.castShadow = true; // Enable shadow casting for the light
scene.add(sunlight);

const lightHelper = new DirectionalLightHelper(sunlight, 5);
scene.add(lightHelper);

// Adjust shadow properties for the light
const shadowMapSize = 4096; // Adjust the shadow map size based on your needs
sunlight.shadow.mapSize.width = shadowMapSize;
sunlight.shadow.mapSize.height = shadowMapSize;

// Adjust the shadow camera frustum to encompass your camera
const frustumSize = 100; // Match the size of your camera view
sunlight.shadow.camera.left = -frustumSize / 2;
sunlight.shadow.camera.right = frustumSize / 2;
sunlight.shadow.camera.top = frustumSize / 2;
sunlight.shadow.camera.bottom = -frustumSize / 2;

sunlight.shadow.camera.near = 0.15; // Shadow camera near plane
sunlight.shadow.camera.far = 5000; // Shadow camera far plane

// Create a grassy plane
const planeGeometry = new PlaneGeometry(2000, 2000);
const grassMaterial = new MeshStandardMaterial({color: '#678c34'});
const plane = new Mesh(planeGeometry, grassMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to make it flat
plane.receiveShadow = true;

scene.add(plane);

const player = new Character({
  controller: PlayerController,
  // add compositon elements here..
  // inventory: Inventory,
  // dialogue: Dialogue,
});

player.mesh.position.set(0.5, 0.5, 0.5);
scene.add(player.mesh);

function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  if (needResize) renderer.setSize(width, height, false);

  return needResize;
}

function handleRender(renderer: WebGLRenderer) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  camera.position.lerp(player.mesh.position, 0.04);
  camera.position.y = 10; // keep the elevation;
  camera.position.z = camera.position.z + 0.5;

  player.controller.update(scene);

  // have the sun follow you to save of resources
  sunlight.target.position.copy(player.mesh.position);
  lightHelper.position.copy(sunlight.target.position);

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
