import {Vector3} from 'three';
import {Lights} from '../lights';
import {AIController} from '../models/ai/controller';
import {Character} from '../models/character';
import {SpriteFlipbook} from '../models/character-flipbook';
import {PlayerController} from '../models/player/controller';
import {Inventory} from '../models/player/inventory';
import {OpenWorldMap} from './openWorld/scene';
import {Camera} from '../camera';
import {Gamestate} from '../gamestate';
import { Orchestrator } from '../models/ai/orchestrator';

/**
 * The Before-fore (pre-invasion map)
 */
export function SceneOne(gamestate: Gamestate) {
  const {scene, pathfinder, pathfindingHelper} = new OpenWorldMap(console.log);
  const {sunlight} = new Lights(scene);
  const cameraClass = new Camera();
  const {camera} = cameraClass;

  const player = new Character(
    {
      Controller: PlayerController,
      InventoryModule: Inventory,
      FlipbookModule: SpriteFlipbook,
      // add compositon elements here..
      // dialogue: Dialogue,
    },
    {
      name: 'player',
      position: gamestate.state.playerPosition,
      spriteSheet: './sprites/forest-sprite.png',
      zone: 'village-square',
    }
  );

  scene.add(player.root);

  const NPC1 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Orchestrator,
      // add compositon elements here..
      // dialogue: Dialogue,
    },
    {
      position: new Vector3(0, 0.5, 5),
      spriteSheet: './sprites/trout.png',
      zone: 'village-square'
    }
  );

  scene.add(NPC1.root);

  NPC1.controller.enablePathfinding(pathfinder, pathfindingHelper);
  NPC1.controller.target = NPC1.orchestrator?.trackPlayer(scene);

  const NPC2 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      // add compositon elements here..
      // dialogue: Dialogue,
    },
    {
      position: new Vector3(1, 0.5, 1),
      spriteSheet: './sprites/mink.png',
      zone: 'village-square',
    }
  );

  scene.add(NPC2.root);

  const NPC3 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Orchestrator,
      // add compositon elements here..
      // dialogue: Dialogue,
    },
    {
      position: new Vector3(-5, 0.5, 1),
      spriteSheet: './sprites/forest-sprite.png',
      zone: 'village-square',
    }
  );

  NPC3.controller.enablePathfinding(pathfinder, pathfindingHelper);
  NPC3.controller.target = NPC1.orchestrator?.loop();

  scene.add(NPC3.root);

  return {scene, sunlight, camera, cameraClass, player, NPCs: [NPC1, NPC2, NPC3]};
}
