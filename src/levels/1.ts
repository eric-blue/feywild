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
import {Orchestrator} from '../models/ai/orchestrator';
import {Dialogue} from '../models/ai/dialogue';
import {Bodyswap} from '../models/player/bodyswap';

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
      BodyswapModule: Bodyswap,

      // add compositon elements here..
    },
    {
      name: 'player',
      position: gamestate.state.playerPosition,
      spriteSheet: './sprites/forest-sprite.png',
      zone: 'village-square',
    }
  );

  player.create(scene);

  const NPC1 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Orchestrator,
    },
    {
      position: new Vector3(0, 0.5, 8),
      spriteSheet: './sprites/trout.png',
      zone: 'village-square',
    }
  );

  NPC1.create(scene);
  NPC1.controller.enablePathfinding(pathfinder, pathfindingHelper);
  NPC1.controller.target = NPC1.orchestrator?.trackPlayer(scene);

  const NPC2 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Dialogue,
    },
    {
      position: new Vector3(1, 0.5, 12),
      spriteSheet: './sprites/mink.png',
      dialogueJSON: '../../../public/dialogue/rebecca.json', // this is DEEP
      zone: 'village-square',
    }
  );

  NPC2.onExit = () => console.log('goodbye');
  NPC2.create(scene);

  const NPC3Route = [
    new Vector3(-5, 0.5, 10),
    new Vector3(5, 0.5, 10),
    new Vector3(5, 0.5, 1),
    new Vector3(-5, 0.5, 1),
  ];
  const NPC3 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Orchestrator,
      Dialogue,
    },
    {
      position: new Vector3(-5, 0.5, 1),
      route: NPC3Route,
      spriteSheet: './sprites/forest-sprite.png',
      dialogueJSON: '../../../public/dialogue/example.json',
      zone: 'village-square',
    }
  );

  NPC3.controller.enablePathfinding(pathfinder, pathfindingHelper);

  NPC3.onExit = () => {
    console.log('kthxbye');
    // NPC3.destroy(scene);
  };
  NPC3.create(scene);

  return {
    scene,
    sunlight,
    camera,
    cameraClass,
    player,
    NPCs: [NPC1, NPC2, NPC3],
  };
}
