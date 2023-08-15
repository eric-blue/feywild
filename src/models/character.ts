import {BoxGeometry, Mesh, MeshStandardMaterial} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type { GameState } from '../gamestate';

interface Setup {
  position: GameState['playerPosition'];
}

interface CharacterComposition {
  controller: new (mesh: Mesh) => PlayerController | AIController;
}

export class Character {
  mesh: Mesh;
  controller: PlayerController | AIController;

  constructor({controller}: CharacterComposition, setup: Setup) {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({color: 'purple'});

    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(setup.position.x, setup.position.y, setup.position.z);

    this.controller = new controller(this.mesh);
  }
}
