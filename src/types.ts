export type WASD = 'up' | 'left' | 'down' | 'right';
export type IDLE = `idle-${WASD}`;
export type Direction = WASD | IDLE;

export interface KeyboardState {
  [key: string]: boolean;
}

export type Zone = 'forest-grove-nw' | 'village-square' | 'village-west'; // etc...
