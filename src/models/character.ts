import {BoxGeometry, Mesh, MeshStandardMaterial} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';

interface CharacterComposition {
  controller: new (mesh: Mesh) => PlayerController | AIController;
}

export class Character {
  mesh: Mesh;
  controller: PlayerController | AIController;

  constructor({controller}: CharacterComposition) {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({color: 'purple'});

    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.controller = new controller(this.mesh);
  }
}
