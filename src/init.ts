import {WebGLRenderer, Clock} from 'three';
import {Camera} from './camera';
import {Character} from './models/character';
import {PlayerController} from './models/player/controller';
import {Inventory} from './models/player/inventory';
import {Gamestate} from './gamestate';
import {PauseMenu} from './menus/pause';
import {Lights} from './lights';
import {StartMenu} from './menus/start';
import {OpenWorldMap} from './levels/openWorld/scene';
import {SpriteFlipbook} from './models/character-flipbook';

export function init(canvas?: HTMLCanvasElement) {
  try {
    const renderer = new WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;

    const clock = new Clock();
    const gamestate = new Gamestate();

    new StartMenu(gamestate);

    addEventListener('startgame', () => {
      new PauseMenu(gamestate);

      const {scene} = new OpenWorldMap(console.log);
      const {sunlight} = new Lights(scene);
      const {camera} = new Camera();

      const player = new Character(
        {
          Controller: PlayerController,
          InventoryModule: Inventory,
          FlipbookModule: SpriteFlipbook,
          // add compositon elements here..
          // dialogue: Dialogue,
        },
        {
          position: gamestate.state.playerPosition,
          spriteSheet: './sprites/forest-sprite.png',
        }
      );

      scene.add(player.root);

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

          if (camera) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
          }
        }

        if (
          !window.gameIsLoading &&
          !window.savingInProgress &&
          !window.paused &&
          !window.lockPlayer
        ) {
          const deltaTime = clock.getDelta();

          camera.position.lerp(player.root.position, 0.04);
          gamestate.set({playerPosition: player.root.position});
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

      requestAnimationFrame(() => handleRender(renderer));
    });
  } catch (error) {
    throw new Error('Could not find canvas element');
  }
}
