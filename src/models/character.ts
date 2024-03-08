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
import { CharacterCombat } from './shared/combat';

const SPEAK_DISTANCE = 2.2;

interface Props {
  name?: string;
  position: GameState['playerState']['position'];
  spriteSheet?: string;
  dialogueFile?: string;
  zone: Zone;
  route?: [x: number, y: number, z: number][];
  stats?: InitStats;
}

interface CharacterComposition {
  Controller: new (...args: ConstructorParameters<typeof PlayerController| typeof AIController>) => PlayerController | AIController;
  Orchestrator?: new (...args: ConstructorParameters<typeof Orchestrator>) => Orchestrator;
  InventoryModule?: new (...args: ConstructorParameters<typeof Inventory>) => Inventory;
  FlipbookModule?: new (...args: ConstructorParameters<typeof SpriteFlipbook>) => SpriteFlipbook;
  Dialogue?: new (...args: ConstructorParameters<typeof Dialogue>) => Dialogue;
  BodyswapModule?:  new (...args: ConstructorParameters<typeof Bodyswap>) => Bodyswap;
  CharacterStats?: new (...args: ConstructorParameters<typeof CharacterStats>) => CharacterStats;
  CharacterCombat?: new (...args: ConstructorParameters<typeof CharacterCombat>) => CharacterCombat;
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
  combatController?: CharacterCombat;

  onAppear?: () => void;
  onDialogueExit?: () => void;
  onDialogueStart?: () => void;
  onDialogueEnd?: () => void;

  constructor(
    public id: number,
    {Controller, Orchestrator, InventoryModule, FlipbookModule, Dialogue, BodyswapModule, CharacterStats, CharacterCombat}: CharacterComposition,
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
    if (this.stats) {
      this.combatController = CharacterCombat ? new CharacterCombat(this.root, props.zone, this.stats) : undefined;
    }

    if (props.position) {
      this.root.position.set(props.position.x, props.position.y, props.position.z);
    }

    if (FlipbookModule && props.spriteSheet) {
      this.flipbook = new FlipbookModule(this.root, props.spriteSheet as `./sprites/${string}.png`);
    }

    this.bodyswap = BodyswapModule ? new BodyswapModule() : undefined;
    this.inventory = InventoryModule ? new InventoryModule() : undefined;
    this.controller = new Controller(this.root, props.zone);
    this.orchestrator = Orchestrator ? new Orchestrator(props.route) : undefined;
    this.dialogue = Dialogue && props.dialogueFile ? new Dialogue(this.root, props.dialogueFile) : undefined;
  }
  
  /**
   * used to attach actions to the character's modules
   * and add the character to the scene
   */
  create(scene: Scene) {
    if (this.dialogue) {
      this.dialogue.isTouchingPlayer = () => {
        return isTouchingPlayer(SPEAK_DISTANCE, this.root, scene);
      },

      this.dialogue.actions = {
        onDialogueEnd: () => {
          this.controller.pauseMovement = false;
          this.onDialogueEnd?.();
        },
        onDialogueExit: () => {
          this.controller.pauseMovement = false;
          this.onDialogueExit?.();
        },
        onDialogueStart: () => {
          this.controller.pauseMovement = true;
          this.onDialogueStart?.();
        },
      }

    }

    if (this.orchestrator?.routeGenerator) {
      this.controller.actions.onReachDestination = () => {
        const next = this.orchestrator!.routeGenerator!.next().value;
        if (next) this.controller.target = next;
        else this.destroy(scene);
      };
    }

    if (this.stats) {
      /**
       * some console.logs for now, but this is where we'd stitch together 
       * other modules along with events controlled by the scene.
       */
      this.stats.actions = {
        // todo add GAME OVER scene action here
        onDeath: () => {
          console.log(`${this.root.name} has died!`);
          if (this.controller instanceof PlayerController) {
            const event = new CustomEvent('gameover');
            window.dispatchEvent(event);
          }
        },
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
    }

    if (this.combatController) {
      this.combatController.actions = {
        onFirstFrame: (type) => {
          this.flipbook?.startManualAnimate(type);
        }, 
        onNextFrame: (_type) => {
          this.flipbook?.continueManualAnimate();
        }, 
        onLastFrame: (type) => {
          if (type === 'attack') this.flipbook?.endManualAnimate();
          if (type === 'defend') { /** nothing */ }
        }, 
      }

      if (this.controller instanceof PlayerController) {
        const actions: {[key: KeyboardEvent['key']]: () => void} = {
          ' ': () => { this.combatController?.attack() },
          'R': () => { this.combatController?.defend() },
        }

        const keyUpActions: {[key: KeyboardEvent['key']]: () => void} = {
          'R': () => { this.flipbook?.endManualAnimate() },
        }

        this.controller.actions.onKeydown = (key: KeyboardEvent['key']) => actions[key]?.();
        this.controller.actions.onKeyUp = (key: KeyboardEvent['key']) => keyUpActions[key]?.();
      }

      if (this.controller instanceof AIController && this.orchestrator) {
        this.controller.target = this.orchestrator.trackPlayer(scene);
        this.orchestrator.actions.onNextTick = () => {
          this.combatController?.attack();
        };
      }
    }
    
    if (this.bodyswap) {
      this.bodyswap.actions = {
        onSwap: (newStats) => {
          this.stats?.swapBodies(newStats);
          this.flipbook?.swapTexture(`./sprites/${newStats.sprite}.png`);
        },
      }
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
    this.combatController?.update(delta);

    if (this.controller instanceof AIController && this.stats?.type === 'enemy') {
      const touch = () => isTouchingPlayer(this.stats?.reach || 2, this.root, scene);
      this.orchestrator?.nextTick(delta, touch);
    }

    return {
      position: this.root.position,
      zone: this.controller.zone,
      direction,
      ...currentStats,
    };
  }
}
