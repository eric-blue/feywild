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

    addEventListener('startgame', async () => {
      new PauseMenu(gamestate);

      const {scene, sunlight, camera, player, NPCs} =
        scenes[gamestate.state.scene](gamestate);

      NPCs.forEach(npc => npc.controller.update(scene));

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
          camera?.updateAspectRatio(renderer.domElement);
        }

        const {gameIsLoading, savingInProgress, paused} = window;

        if (!gameIsLoading && !savingInProgress && !paused) {
          const delta = clock.getDelta();

          gamestate.setState({playerPosition: player.root.position});

          const dev = import.meta.env.DEV;
          if (!dev || (dev && !window._orbitControls)) camera.update();

          player.update(scene, delta);
          NPCs.forEach(npc => npc.update(scene, delta));

          // have the sun follow you to save of resources
          sunlight.target.position.copy(player.root.position);
          sunlight.target.updateMatrixWorld();
        }

        requestAnimationFrame(() => handleRender(renderer));

        renderer.render(scene, camera.camera);
      }

      if (import.meta.env.DEV) {
        const {devtools} = await import('./dev-tools');
        devtools({camera, renderer});
      }

      requestAnimationFrame(() => handleRender(renderer));
    });
  } catch (error) {
    throw new Error('Could not find canvas element');
  }
}
