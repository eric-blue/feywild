import {Vector3} from 'three';
import {Static} from '../models/static';

export interface TiledObject<T = {}> {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: T;
}

export interface TiledTemplate {
  id: number;
  template?: boolean;
  x: number;
  y: number;
}

export interface TiledNPCProperties {
  farsight: number;
  reach: number;
  speed: number;
  enemy: boolean;
  dialogueFilename?: string;
  routeJson?: string;
}

export const PIXELS_PER_BLOCK = 16;

export function translateTiledToThreeJs<T = {}>(obj: TiledObject<T>, offsetX = 0, offsetZ = 0) {
  const width = obj.width / PIXELS_PER_BLOCK;
  const height = obj.height / PIXELS_PER_BLOCK;
  const depth = obj.height / PIXELS_PER_BLOCK;
  const x = obj.x / PIXELS_PER_BLOCK + width / 2;
  const z = obj.y / PIXELS_PER_BLOCK - height + height / 2 + 1.5;
  const position = new Vector3(offsetX + x, 0.5, offsetZ + z);

  return {id: obj.id, position, width, height, depth, name: obj.name, properties: obj.properties};
}

export async function translateTiledTemplateToThreeJs<T = {}>(obj: TiledTemplate, offsetX = 0, offsetZ = 0) {
  const {default: template} = await import(`../tiled/${obj.template}`);

  const properties = template.object.properties
    ? Object.fromEntries(
        template.object.properties?.map(({name, value}: {name: string; value: string}) => [
          `${name[0].toLowerCase()}${name.slice(1)}`,
          value,
        ])
      )
    : {};

  const tiledObject = {
    name: template.object.name,
    ...obj,
    width: template.object.width,
    height: template.object.height,
    properties: properties as T,
  };

  return {...translateTiledToThreeJs<T>(tiledObject, offsetX, offsetZ), template};
}

export async function createThreeJsObject(obj: TiledObject | TiledTemplate, offsetX = 0, offsetZ = 0) {
  if ('template' in obj) {
    return new Static({}, await translateTiledTemplateToThreeJs(obj as TiledTemplate, offsetX, offsetZ));
  }
  return new Static({}, translateTiledToThreeJs(obj as TiledObject, offsetX, offsetZ));
}
