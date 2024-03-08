import {Scene, Vector3} from 'three';
import {translateTiledTemplateToThreeJs, TiledNPCProperties, TiledTemplate} from '../levels/helpers';
import {Zone} from '../types';
import {AIController} from './ai/controller';
import {Dialogue} from './ai/dialogue';
import {Character} from './character';
import {SpriteFlipbook} from './shared/flipbook';
import {CharacterStats} from './shared/stats';
import {CharacterCombat} from './shared/combat';
import {Orchestrator} from './ai/orchestrator';
import {Pathfinding} from 'three-pathfinding';

const configs = import.meta.glob('./game-objects/*/config.ts');

interface Props {
  tiledObject: TiledTemplate<TiledNPCProperties>;
  zoneData: {
    name: Zone;
    position: Vector3;
  };
  scene: Scene;
  pathfinder: Pathfinding;
}

/**
 * an abstraction for creating Characters from Tiled objects
 */
export async function NPC({tiledObject, zoneData, scene, pathfinder}: Props) {
  const {id, template, position, properties, name} = await translateTiledTemplateToThreeJs<TiledNPCProperties>(
    tiledObject,
    zoneData.position.x - 50,
    zoneData.position.z - 50
  );

  let config = null;

  if (properties?.modelId) {
    const path = `./game-objects/${properties.modelId}/config.js`;
    config = await configs?.[path]?.() ?? null;
  }

  console.log(config);
  const dialogueFile = undefined;

  const npc = new Character(
    id,
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Dialogue: dialogueFile ? Dialogue : undefined,
      Orchestrator: properties?.routeJson ? Orchestrator : undefined,
      CharacterStats,
      CharacterCombat,
    },
    {
      position,
      name,
      spriteSheet: `sprites/${template.tileset?.source.replaceAll('../', '').replace('.json', '') as string}.png`,
      zone: zoneData.name,
      dialogueFile,
      route: properties?.routeJson ? JSON.parse(properties.routeJson) : undefined,
      stats: {
        reach: properties?.reach ?? 2.25,
        farsight: properties?.farsight ?? 10,
        speed: properties?.speed ?? 0.1,
        type: properties?.enemy ? 'enemy' : 'friendly',
      },
    }
  );

  if (properties?.routeJson) {
    npc.controller.enablePathfinding(pathfinder, scene);
  }

  npc.create(scene);

  // how to do this...?
  // TODO: stitch model config here to attach actions to the character's modules

  // need to pass in a set of SCENE actions to the orchestrator
  // NPC4.onDialogueEnd = () => console.log('goodbye');
  // NPC4.onDialogueExit = () => console.log('ok nevermind then');
  return npc;
}
