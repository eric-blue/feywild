import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NearestFilter,
  ObjectLoader,
  Scene,
  TextureLoader,
  Vector3,
  SRGBColorSpace,
  BoxGeometry,
} from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Pathfinding} from 'three-pathfinding';
import {Tree} from '../../models/game-objects/tree';

export async function OpenWorldMap() {
  const scene = new Scene();
  const pathfinder = new Pathfinding();
  const playerSpawnPoint = new Vector3();

  scene.background = new Color('white');
  if (import.meta.env.DEV) window._currentScene = scene;

  const loader = new ObjectLoader();
  const textureLoader = new TextureLoader();

  const map = await loadWorld('scenes/open-world.json');
  const navmesh = await loadNavmeshes('scenes/open-world.glb');
  const ready = map && navmesh;

  async function loadWorld(path: string) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        loadedScene => {
          scene.add(...loadedScene.children);
          const spawn = scene.children.find(({name}) => name === 'spawn');

          if (spawn) {
            playerSpawnPoint.copy(spawn.position);
            scene.remove(spawn);
          }

          const terrain = (scene.children as Mesh[]).filter(mesh => mesh?.geometry?.name === 'floor');
          terrain.forEach(async placeholder => {
            // temp check to reduce console noise
            if (placeholder.name === 'forest-grove-nw') {
              const url = `../../tiled/${placeholder.name}.json`;
              const {default: mapData} = await import(url);

              mapData?.layers.forEach(({type, objects, name}: {type: string; objects: TiledObject[]; name: string}) => {
                if (type === 'objectgroup') {
                  objects?.forEach((obj: TiledObject) => {
                    const threeObj = createThreeJsObject(obj);
                    if (threeObj) {
                      threeObj.name = name;
                      threeObj.position.x += placeholder.position.x - 50; // offset for local reference
                      threeObj.position.z += placeholder.position.z - 50; // offset for local reference
                      threeObj.visible = name === 'collision';
                      scene.add(threeObj);
                    }
                  });
                }
              });

              textureLoader.load(`./textures/${placeholder.name}.png`, texture => {
                texture.minFilter = NearestFilter;
                texture.magFilter = NearestFilter;
                texture.generateMipmaps = false;
                texture.colorSpace = SRGBColorSpace;

                const floor = new Mesh(placeholder.geometry, new MeshStandardMaterial({map: texture}));
                floor.receiveShadow = true;
                floor.position.copy(placeholder.position);

                scene.remove(placeholder);
                scene.add(floor);
              });
            }
          });

          // todo: convert to track TILED objects instead of three/editor cylinders
          // const trees = scene.children.filter(({name}) => name === 'tree');
          // trees?.forEach((placeholder, i) => {
          //   const tree = Tree({
          //     position: placeholder.position,
          //     seed: i,
          //   });

          //   scene.remove(placeholder);
          //   scene.add(tree.root);
          // });

          const barriers = (scene.children as Mesh[]).filter(({name}) => name === 'barrier');
          barriers?.forEach(mesh => {
            mesh.visible = false;
          });

          resolve(true);
        },
        progress => {
          window.gameIsLoading = true;
          console.log((progress.loaded / progress.total) * 100 + '% loaded scene');
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
            console.log((progress.loaded / progress.total) * 100 + '% loaded navmesh');
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

interface TiledObject {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rectangle: boolean;
}

const pixelsPerBlock = 16;
function createThreeJsObject(obj: TiledObject) {
  let threeJsObj;
  let width = 0,
    height = 0;

  // Depending on the type of object, you might create different Three.js objects
  // For instance, a simple rectangle in Tiled might be represented as a PlaneGeometry in Three.js
  if (obj.width && obj.height) {
    width = obj.width / pixelsPerBlock;
    height = obj.height / pixelsPerBlock;
    const geometry = new BoxGeometry(width, 1, height);
    const material = new MeshBasicMaterial({wireframe: true});
    threeJsObj = new Mesh(geometry, material);
  }

  // Set the object's position
  const x = obj.x / pixelsPerBlock + width / 2;
  const z = obj.y / pixelsPerBlock + height / 2;
  threeJsObj?.position.set(x, 0.5, z);

  // Add the object to your scene
  return threeJsObj;
}
