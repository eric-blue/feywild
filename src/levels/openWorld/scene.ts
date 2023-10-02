import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NearestFilter,
  ObjectLoader,
  Scene,
  TextureLoader,
  SRGBColorSpace,
} from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Pathfinding} from 'three-pathfinding';
import {Tree} from '../../models/game-objects/tree';
import {Gamestate} from '../../gamestate';
import {Character} from '../../models/character';
import {Zone} from '../../types';
import {TiledObject, createThreeJsObject, translateTiledTemplateToThreeJs, PIXELS_PER_BLOCK} from '../helpers';
import {NPC} from '../../models/character-npc';

const TILED_DIR = '../../tiled/';

export async function OpenWorldMap(gamestate: Gamestate) {
  const scene = new Scene();
  const pathfinder = new Pathfinding();
  const npcs: Character[] = [];

  scene.background = new Color('white');
  if (import.meta.env.DEV) window._currentScene = scene;

  const loader = new ObjectLoader();
  const textureLoader = new TextureLoader();

  async function loadWorld(path: string) {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        async loadedScene => {
          scene.add(...loadedScene.children);
          const meshes = scene.children as Mesh[];
          const terrain = meshes.filter(mesh => mesh?.geometry?.name === 'floor');
          const barriers = meshes.filter(({name}) => name === 'barrier');

          for (const placeholder of terrain) {
            // temp check to reduce console noise

            const activeAreas = [
              'forest-grove-nw', 
              'forest-grove-ne', 
              'forest-grove-sw', 
              'forest-grove-se'
            ];

            if (activeAreas.includes(placeholder.name)) {
              const url = `${TILED_DIR}${placeholder.name}.json`;
              const {default: mapData} = await import(url);

              /**
               * load the Tiled object layers and apply them to the scene
               */
              for (const layer of mapData?.layers ?? []) {
                const {objects, name}: {type: string; objects: TiledObject[]; name: string} = layer;

                if (name === 'player') {
                  for (const tiledObject of objects) {
                    const threeObj = await createThreeJsObject(
                      tiledObject,
                      placeholder.position.x - 50,
                      placeholder.position.z - 50
                    );

                    if (threeObj) {
                      if (threeObj.root.name === 'spawn') gamestate.setPlayerPosition(threeObj.root.position);
                    }
                  }
                }

                if (name === 'npc') {
                  for (const tiledObject of objects) {
                    const npc = await NPC({
                      tiledObject,
                      scene,
                      pathfinder,
                      zoneData: {
                        name: placeholder.name as Zone,
                        position: placeholder.position,
                      },
                    });

                    npcs.push(npc);
                  }
                }

                if (name === 'trees') {
                  const spriteMargin = 0.75; // tree sprites have a ~0.75 margin before the trunk
                  for (const tiledObject of objects) {
                    const {template, ...threePos} = await translateTiledTemplateToThreeJs(
                      tiledObject,
                      placeholder.position.x - 50,
                      placeholder.position.z - 50
                    );

                    /**
                     * reworking the bounding box of the tree to wrap the trunk rather than the entire sprite
                     */
                    threePos.depth = threePos.depth / 8;
                    threePos.width = threePos.width / 8;
                    threePos.position.y = template.object.height / PIXELS_PER_BLOCK / 2 - spriteMargin;

                    const tree = Tree({
                      ...threePos,
                      tilesPosition: template.object.gid - 1,
                      spriteSheet: `sprites/${template.tileset?.source.replaceAll('../', '').replace('.json', '.png')}`,
                      large: template.tileset?.source.includes('large') ?? false,
                    });

                    scene.add(tree.root, tree.staticSprite!.sprite);
                  }
                }

                if (name === 'collisions') {
                  for (const tiledObject of objects) {
                    const threeObj = await createThreeJsObject(
                      tiledObject,
                      placeholder.position.x - 50,
                      placeholder.position.z - 50
                    );

                    if (threeObj) {
                      threeObj.root.visible = false;
                      scene.add(threeObj.root);
                    }
                  }
                }
              }

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
          }

          for (const barrier of barriers) barrier.visible = false;

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

  const map = await loadWorld('scenes/open-world.json');
  const navmesh = await loadNavmeshes('scenes/open-world.glb');
  const ready = map && navmesh;

  return {
    ready,
    scene,
    loader,
    npcs,
    pathfinder,
  };
}
