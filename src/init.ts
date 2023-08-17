import {WebGLRenderer, Clock} from 'three';
import {Gamestate} from './gamestate';
import {PauseMenu} from './menus/pause';
import {StartMenu} from './menus/start';
import {SceneOne} from './levels/1';

interface SceneMachine {
  [key: number]: (state: Gamestate) => ReturnType<typeof SceneOne>;
}

const scenes: SceneMachine = {
  1: SceneOne,
};

export function init(canvas?: HTMLCanvasElement) {
  try {
    const renderer = new WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;

    const clock = new Clock();
    const gamestate = new Gamestate();

    new StartMenu(gamestate);

    addEventListener('startgame', () => {
      new PauseMenu(gamestate);

      const {
        scene,
        sunlight,
        camera,
        player,
        NPCs: [NPC1],
      } = scenes[gamestate.state.scene](gamestate);

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
          const delta = clock.getDelta();

          camera.position.lerp(player.root.position, 0.04);
          gamestate.setState({playerPosition: player.root.position});
          camera.position.y = 15; // keep the elevation;
          camera.position.z = camera.position.z + 0.75;

          player.update(scene, delta);
          NPC1.update(scene, delta);

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
