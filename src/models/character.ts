import {BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3} from 'three';
import {AIController} from './ai/controller';
import {PlayerController} from './player/controller';
import type {GameState} from '../gamestate';
import {Inventory} from './player/inventory';
import {SpriteFlipbook} from './shared/flipbook';
import {Direction, Zone} from '../types';
import {Orchestrator} from './ai/orchestrator';
import {Dialogue} from './ai/dialogue';
import {Bodyswap} from './player/bodyswap';

import {isTouchingPlayer} from './helpers';
import { BaseStats, CharacterStatState, CharacterStats, InitStats } from './shared/stats';

interface Props {
  name?: string;
  position: GameState['playerState']['position'];
  spriteSheet?: string;
  dialogueFilename?: string;
  zone: Zone;
  route?: [x: number, y: number, z: number][];
  stats?: InitStats;
}

type Newable<T> = new (...args: any[]) => T;

interface CharacterComposition {
  Controller: Newable<PlayerController|AIController>;
  Orchestrator?: Newable<Orchestrator>;
  InventoryModule?: Newable<Inventory>;
  FlipbookModule?: Newable<SpriteFlipbook>;
  Dialogue?: Newable<Dialogue>;
  BodyswapModule?: Newable<Bodyswap>;
  CharacterStats?: Newable<CharacterStats>;
}

export interface CharacterState extends CharacterStatState {
  position: Vector3;
  direction: Direction;
  zone: Zone; 
  inventory?: {};
}

/**
 * A base actor class for spawning in NPCs or player
 * characters; basically anything you expect to live,
 * move, and breathe.
 *
 * Built using Composition principles (vs Inheritence)
 */
export class Character {
  root: Mesh;
  controller: PlayerController | AIController;
  orchestrator?: Orchestrator;
  stats?: CharacterStats;
  inventory?: Inventory;
  flipbook?: SpriteFlipbook;
  dialogue?: Dialogue;
  bodyswap?: Bodyswap;

  onAppear?: () => void;
  onDialogueExit?: () => void;
  onDialogueStart?: () => void;
  onDialogueEnd?: () => void;

  constructor(
    public id: number,
    {Controller, Orchestrator, InventoryModule, FlipbookModule, Dialogue, BodyswapModule, CharacterStats}: CharacterComposition,
    props: Props = {
      position: new Vector3(0.5, 0.5, 0.5),
      spriteSheet: undefined,
      zone: 'village-square',
    }
  ) {
    const geometry = new BoxGeometry(0.25, 2, 1);
    const material = new MeshStandardMaterial({visible: false});

    this.root = new Mesh(geometry, material);
    this.root.name = props.name || '???';
    this.stats = CharacterStats ? new CharacterStats({...props.stats}) : undefined;

    if (props.position) {
      this.root.position.set(props.position.x, props.position.y, props.position.z);
    }

    if (FlipbookModule && props.spriteSheet) {
      this.flipbook = new FlipbookModule(this.root, props.spriteSheet);
      this.bodyswap = BodyswapModule ? new BodyswapModule(this.flipbook) : undefined;
    }

    this.inventory = InventoryModule ? new InventoryModule() : undefined;
    this.controller = new Controller(this.root, props.zone);
    this.orchestrator = Orchestrator ? new Orchestrator(props.route) : undefined;
    this.dialogue = Dialogue && props.dialogueFilename ? new Dialogue(this.root, props.dialogueFilename) : undefined;
  }

  create(scene: Scene) {
    if (this.dialogue) {
      this.dialogue.isTouchingPlayer = () => {
        return isTouchingPlayer(2.2, this.root, scene);
      };

      this.dialogue.onDialogueEnd = () => {
        this.controller.pauseMovement = false;
        this.onDialogueEnd?.();
      };

      this.dialogue.onDialogueExit = () => {
        this.controller.pauseMovement = false;
        this.onDialogueExit?.();
      };

      this.dialogue.onDialogueStart = () => {
        this.controller.pauseMovement = true;
      };
    }

    if (this.orchestrator) {
      if (this.orchestrator.routeGenerator) {
        this.controller.onReachDestination = () => {
          const next = this.orchestrator!.routeGenerator!.next().value;
          this.controller.target = next;
        };
      }
    }

    if (this.stats) {
      // some console.logs for now, but this is where we'd
      // stitch together other modules along with events
      // controlled by the scene.
      this.stats.actions = {
        onDeath: () => console.log(`${this.root.name} has died!`),
        onReceiveDamage: (amount: number) => console.log(`${this.root.name} took ${amount} damage!`),
        onHeal: (amount: number) => console.log(`${this.root.name} healed ${amount} health!`),
        onRevive: () => console.log(`${this.root.name} has been revived!`),
        onBlindStart: () => console.log(`${this.root.name} has been blinded!`),
        onBlindEnd: () => console.log(`${this.root.name} is no longer blind!`),
        onStunStart: () => console.log(`${this.root.name} has been stunned!`),
        onStunEnd: () => console.log(`${this.root.name} is no longer stunned!`),
        onWeakenStart: () => console.log(`${this.root.name} has been weakened!`),
        onWeakenEnd: () => console.log(`${this.root.name} is no longer weakened!`),
        onCrippleStart: () => console.log(`${this.root.name} has been crippled!`),
        onCrippleEnd: () => console.log(`${this.root.name} is no longer crippled!`),
        
        onBodySwap: (newStats: BaseStats) => console.log(`${this.root.name} has swapped bodies!`, newStats),
      }

      if (this.bodyswap) this.bodyswap.onSwap = (newStats) => this.stats?.swapBodies(newStats);
    }

    scene.add(this.root);
  }

  destroy(scene: Scene) {
    scene.remove(this.root);
  }

  update(scene: Scene, delta: number) {
    this.controller.update(scene);
    const direction = this.controller.simpleDirection();
    this.flipbook?.update(delta, direction);
    const currentStats = this.stats?.update(delta);

    if (this.stats?.type === 'enemy') {
      const touch = () => isTouchingPlayer(this.stats?.reach || 2, this.root, scene);
      this.orchestrator?.attack(delta, touch);
    }

    return {
      position: this.root.position,
      zone: this.controller.zone,
      direction,
      ...currentStats,
    };
  }
}
