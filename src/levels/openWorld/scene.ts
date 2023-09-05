import {
  Color,
  Mesh,
  MeshBasicMaterial,
  ObjectLoader,
  Scene,
  Vector3,
} from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Pathfinding} from 'three-pathfinding';

export async function OpenWorldMap() {
  const scene = new Scene();
  const loader = new ObjectLoader();
  const pathfinder = new Pathfinding();
  const playerSpawnPoint = new Vector3();

  scene.background = new Color('white');
  if (import.meta.env.DEV) window._currentScene = scene;

  const map = await loadWorld('scenes/open-world.json');
  const navmesh = await loadNavmeshes('scenes/open-world.glb');
  const ready = map && navmesh;

  async function loadWorld(path: string) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        loadedScene => {
          scene.add(...loadedScene.children);
          const spawn = scene.children.find(({name}) => name === 'Spawn');

          if (spawn) {
            playerSpawnPoint.copy(spawn.position);
            scene.remove(spawn);
          }

          resolve(true);
        },
        progress => {
          window.gameIsLoading = true;
          console.log(
            (progress.loaded / progress.total) * 100 + '% loaded scene'
          );
        },
        error => {
          console.error('An error occurred while loading the scene:', error);
          reject();
        }
      );
    });
  }

  async function loadNavmeshes(path: string) {
    const ZONE = 'village-square'; // this should be matched to the current navmesh

    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf: GLTF) => {
          gltf.scene.traverse(node => {
            const navmesh = node as Mesh;
            if (navmesh.isMesh) {
              const material = new MeshBasicMaterial({color: 0x808080});
              const navWireframe = new Mesh(navmesh.geometry, material);
              navWireframe.name = 'navmesh';
              navWireframe.visible = false;
              scene.add(navWireframe);

              const zone = Pathfinding.createZone(navmesh.geometry);
              pathfinder.setZoneData(ZONE, zone);

              window.gameIsLoading = false; // this should be at the far end of the first render loop
            }
          });

          resolve(true);
        },
        progress => {
          window.gameIsLoading = true;
          if (import.meta.env.DEV) {
            console.log(
              (progress.loaded / progress.total) * 100 + '% loaded navmesh'
            );
          }
        },
        error => {
          console.error('An error occurred while loading the navmesh:', error);
          reject();
        }
      );
    });
  }

  return {
    ready,
    scene,
    loader,
    pathfinder,
    playerSpawnPoint,
  };
}
