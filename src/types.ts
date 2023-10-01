import type OpenWorldMap from "./literal-types/open-world.json.d.ts";

export type WASD = 'up' | 'left' | 'down' | 'right';
export type IDLE = `idle-${WASD}`;
export type Direction = WASD | IDLE;

export interface KeyboardState {
  [key: string]: boolean;
}

type WorldZones = typeof OpenWorldMap['object']['children'][number]['name'];
type OnlyHyphenated<T extends string> = T extends `${string}-${string}` ? T : never;
export type Zone = OnlyHyphenated<WorldZones>;
