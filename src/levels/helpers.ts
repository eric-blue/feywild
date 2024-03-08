import {Vector3} from 'three';
import {Static} from '../models/static';
import { InitStats } from '../models/shared/stats';

export interface TiledObject<T = {}> {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: T;
}

export interface TiledTemplate<T = {}> {
  id: number;
  template?: boolean;
  properties?: T[];
  x: number;
  y: number;
}

export interface TiledNPCProperties extends Omit<InitStats, 'type'> {
  enemy: boolean;
  modelId?: string;
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

export async function translateTiledTemplateToThreeJs<T = {}>(obj: TiledTemplate<T>, offsetX = 0, offsetZ = 0) {
  const {default: template} = await import(`../tiled/${obj.template}`);

  const properties = template.object.properties 
    ? Object.fromEntries(
        template.object.properties?.map(({name, value}: any) => [
          `${name[0].toLowerCase()}${name.slice(1)}`,
          value,
        ])
      )
    : {};

  const objProperties = obj.properties 
    ? Object.fromEntries(
        obj.properties?.map(({name, value}: any) => [
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
    properties: {...properties, ...objProperties} as T,
  };

  return {...translateTiledToThreeJs<T>(tiledObject, offsetX, offsetZ), template};
}

export async function createThreeJsObject(obj: TiledObject | TiledTemplate, offsetX = 0, offsetZ = 0) {
  if ('template' in obj) {
    return new Static({}, await translateTiledTemplateToThreeJs(obj as TiledTemplate, offsetX, offsetZ));
  }
  return new Static({}, translateTiledToThreeJs(obj as TiledObject, offsetX, offsetZ));
}
