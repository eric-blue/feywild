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

import {getPlayerPosition} from '../models/helpers';

/**
 * The Before-fore (pre-invasion map)
 */
export async function SceneOne(gamestate: Gamestate) {
  const {ready, scene, npcs, pathfinder} = await OpenWorldMap(gamestate);

  await ready;

  const {sunlight} = new Lights(scene);
  const camera = new Camera();

  const {playerPosition, playerZone} = gamestate.state;

  const player = new Character(
    {
      Controller: PlayerController,
      InventoryModule: Inventory,
      FlipbookModule: SpriteFlipbook,
      BodyswapModule: Bodyswap,
    },
    {
      name: 'player',
      position: playerPosition,
      spriteSheet: 'sprites/forest-sprite.png',
      zone: playerZone,
    }
  );

  player.create(scene);
  camera.setTarget(() => getPlayerPosition(scene));

  const NPC1 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Orchestrator,
    },
    {
      position: new Vector3(0, 0, 13),
      spriteSheet: 'sprites/forest-sprite.png',
      zone: 'village-square',
      stats: {
        speed: 0.025,
        farsight: 10,
        reach: 2.25,
        type: 'enemy',
      },
    }
  );

  NPC1.create(scene);
  NPC1.controller.enablePathfinding(pathfinder, scene);
  NPC1.controller.target = NPC1.orchestrator?.trackPlayer(scene);

  const NPC2 = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Dialogue,
    },
    {
      position: new Vector3(1, 0.5, 16),
      spriteSheet: 'sprites/forest-sprite.png',
      dialogueFilename: 'rebecca-1.json',
      zone: 'village-square',
    }
  );

  NPC2.onDialogueEnd = () => console.log('goodbye');
  NPC2.onDialogueExit = () => console.log('ok nevermind then');
  NPC2.create(scene);

  const NPC3Route: [x: number, y: number, z: number][] = [
    [-5, 0.5, 10],
    [5, 0.5, 10],
    [5, 0.5, 1],
    [-5, 0.5, 1],
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
      spriteSheet: 'sprites/forest-sprite.png',
      dialogueFilename: 'rebecca-1.json',
      zone: 'village-square',
    }
  );

  NPC3.controller.enablePathfinding(pathfinder, scene);

  NPC3.onDialogueEnd = () => {
    console.log('kthxbye');
  };
  NPC3.create(scene);

  return {
    scene,
    sunlight,
    camera,
    player,
    NPCs: [...npcs, NPC1, NPC2],
  };
}
