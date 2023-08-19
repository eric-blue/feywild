import {Color, Mesh, MeshBasicMaterial, ObjectLoader, Scene} from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Pathfinding, PathfindingHelper} from 'three-pathfinding';

export class OpenWorldMap {
  scene = new Scene();
  loader = new ObjectLoader();

  pathfinder = new Pathfinding();
  pathfindingHelper = new PathfindingHelper();

  constructor(render: () => void) {
    this.scene.background = new Color('white');
    if (import.meta.env.DEV) window._currentScene = this.scene;

    this.loadWorld('scenes/open-world.json', render);
  }

  loadWorld(path: string, onSuccess?: () => void) {
    this.loader.load(
      path,
      loadedScene => {
        this.scene.add(...loadedScene.children);
        onSuccess?.();
        this.loadNavmeshes('scenes/open-world.glb');
      },
      progress => {
        window.gameIsLoading = true;
        console.log(
          (progress.loaded / progress.total) * 100 + '% loaded scene'
        );
      },
      error => {
        console.error('An error occurred while loading the scene:', error);
      }
    );
  }

  loadNavmeshes(path: string) {
    if (import.meta.env.DEV) {
      this.pathfindingHelper.visible = false;
      this.scene.add(this.pathfindingHelper);
      window._pathfindingHelper = this.pathfindingHelper;
    }

    const ZONE = 'village-square'; // this should be matched to the current navmesh

    const loader = new GLTFLoader();
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
            this.scene.add(navWireframe);

            const zone = Pathfinding.createZone(navmesh.geometry);
            this.pathfinder.setZoneData(ZONE, zone);

            window.gameIsLoading = false; // this should be at the far end of the first render loop
          }
        });
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
      }
    );
  }
}
