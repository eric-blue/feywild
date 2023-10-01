import { Scene, Vector3 } from "three";
import { translateTiledTemplateToThreeJs, TiledNPCProperties, TiledObject } from "../levels/helpers";
import { Zone } from "../types";
import { AIController } from "./ai/controller";
import { Dialogue } from "./ai/dialogue";
import { Character } from "./character";
import { SpriteFlipbook } from "./character-flipbook";
import { Orchestrator } from "./ai/orchestrator";
import { Pathfinding } from "three-pathfinding";

interface Props {
  tiledObject: TiledObject;
  zoneData: {
    name: Zone;
    position: Vector3;
  };
  scene: Scene;
  pathfinder: Pathfinding;
}

export async function NPC({tiledObject, zoneData, scene, pathfinder}: Props) {
  const {template, position, properties} = await translateTiledTemplateToThreeJs<TiledNPCProperties>(
    tiledObject,
    zoneData.position.x - 50,
    zoneData.position.z - 50
  );

  const npc = new Character(
    {
      Controller: AIController,
      FlipbookModule: SpriteFlipbook,
      Dialogue: properties?.dialogueFilename ? Dialogue : undefined,
      Orchestrator: properties?.routeJson ? Orchestrator : undefined,
    },
    {
      position, 
      spriteSheet: `sprites/${(template.tileset?.source.replaceAll('../', '').replace('.json', '')) as string}.png`,
      zone: zoneData.name,
      dialogueFilename: properties?.dialogueFilename,
      route: properties?.routeJson ? JSON.parse(properties.routeJson) : undefined,
      stats: {
        reach: properties?.reach ?? 2.25,
        farsight: properties?.farsight ?? 10,
        speed: properties?.speed ?? 0.1,
        type: properties?.enemy ? 'enemy' : 'friendly',
      }
    }
  );
  
  if (properties?.routeJson) {
    npc.controller.enablePathfinding(pathfinder, scene);
  }

  npc.create(scene);

  // how to do this...?
  // NPC4.onDialogueEnd = () => console.log('goodbye');
  // NPC4.onDialogueExit = () => console.log('ok nevermind then');
  return npc;
}