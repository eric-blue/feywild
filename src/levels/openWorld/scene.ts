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
} from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Pathfinding} from 'three-pathfinding';
import {Tree} from '../../models/game-objects/tree';
import { Static } from '../../models/static';
import { Gamestate } from '../../gamestate';

export async function OpenWorldMap(gamestate: Gamestate) {
  const scene = new Scene();
  const pathfinder = new Pathfinding();

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

          const terrain = (scene.children as Mesh[]).filter(mesh => mesh?.geometry?.name === 'floor');
          terrain.forEach(async placeholder => {
            // temp check to reduce console noise
            if (placeholder.name === 'forest-grove-nw') {
              const dir = `../../tiled/`;
              const url = `${dir}${placeholder.name}.json`;
              const {default: mapData} = await import(url);

              /**
               * load the Tiled object layers and apply them to the scene
               */
              await new Promise((resolveMapData) => {
                mapData?.layers.forEach(({objects, name}: {type: string; objects: TiledObject[]; name: string}) => {
                  if (name === 'player') {
                    objects.forEach(obj => {
                      const threeObj = createThreeJsObject(obj, placeholder.position.x - 50, placeholder.position.z - 50);
  
                      if (threeObj) {
                        if (obj.name === 'spawn') gamestate.setPlayerPosition(threeObj.root.position);
                      }
                    });
                  }
  
                  if (name === 'trees') {
                    const spriteMargin = 0.75; // tree sprites have a ~0.75 margin before the trunk
                    objects.forEach(async (obj) => {
                      const {default: template} = await import(`${dir}${obj.template}`);
                      const tiledObject = {
                        ...obj,
                        width: template.object.width,
                        height: template.object.height,
                      }
                      
                      /**
                       * reworking the bounding box of the tree to wrap the trunk rather than the entire sprite
                       */
                      // const threePos = translateTiledToThreeJs(tiledObject, placeholder.position.x - 50, placeholder.position.z - 50);
                      const threePos = translateTiledToThreeJs(tiledObject, placeholder.position.x - 50, placeholder.position.z - 50);
                      threePos.depth = threePos.depth / 8;
                      threePos.width = threePos.width / 8;
                      threePos.position.y = (template.object.height / pixelsPerBlock / 2) - spriteMargin;
                      
                      const tree = Tree({
                        ...threePos,
                        tilesPosition: template.object.gid - 1,
                        spriteSheet: `sprites/${template.tileset?.source.replace('../', '').replace('.json', '.png')}`,
                        large: template.tileset?.source.includes('large') ?? false,
                      });

                      scene.add(tree.root, tree.staticSprite!.sprite);
                    });
                  }
                  
                  if (name === 'collisions') {
                    objects?.forEach((obj: TiledObject) => {
                      const threeObj = createThreeJsObject(obj, placeholder.position.x - 50, placeholder.position.z - 50);
  
                      if (threeObj) {
                        threeObj.root.visible = false;
                        scene.add(threeObj.root);
                      }
                    });
                  }
                });

                resolveMapData(true);
              })

              /** 
               * load the Tiled texture and applies it to the placeholder geometry model
               */
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
  };
}

interface TiledObject {
  id: number;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  template?: boolean;
}

const pixelsPerBlock = 16;
function translateTiledToThreeJs(obj: TiledObject, offsetX = 0, offsetZ = 0) {
  const width = obj.width / pixelsPerBlock;
  const height = obj.height / pixelsPerBlock;
  const depth = obj.height / pixelsPerBlock;
  const x = (obj.x / pixelsPerBlock) + (width / 2);
  const z = (obj.y / pixelsPerBlock) - height + (height / 2) + 3;
  const position = new Vector3(offsetX + x, 0.5, offsetZ + z);

  return {position, width, height, depth};
}

function createThreeJsObject(obj: TiledObject, offsetX = 0, offsetZ = 0) {
  return new Static({}, translateTiledToThreeJs(obj, offsetX, offsetZ));
}
