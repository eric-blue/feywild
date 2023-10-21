import { Mesh } from "three";
import { Zone } from "../../types";
import { CharacterStats } from "./stats";

const TOTAL_TIME = 0.075;
const FRAMES = 4;
const FRAME_TIME = TOTAL_TIME / FRAMES;

export type CombatType = 'attack' | 'defend' | 'ouch';

export class CharacterCombat {
  public actions: {
    onFirstFrame?: (type: CombatType) => void;
    onNextFrame?: (type: CombatType) => void;
    onLastFrame?: (type: CombatType) => void;
  } = {};

  currentAnimate: CombatType = 'attack';
  animating = false;
  private animatingSeconds = 0;

  attacking = this.currentAnimate === 'attack';
  defending = this.currentAnimate === 'defend';

  constructor(private player: Mesh, private zone: Zone, private characterStats: CharacterStats) {
    // hard time Typing this
    addEventListener(`send-melee-damage`, ({detail}) => {
      this.receiveMeleeDamage(detail)
    });
  }

  attack() { 
    if (this.characterStats.unconscious) return;
    window.soundManager.play('hit', {volume: 0.25});
    this.animate('attack');
    this.sendMeleeDamage();
  }

  defend() { 
    if (this.characterStats.unconscious) return;
    this.animate('defend'); 
  }

  animate(type: CombatType) {
    this.animating = true;
    this.currentAnimate = type;
    this.actions.onFirstFrame?.(this.currentAnimate);
  }

  sendMeleeDamage() {
    const detail = {
      zone: this.zone,
      sender: this.player,
      senderStats: this.characterStats,
    };

    dispatchEvent(new CustomEvent('send-melee-damage', {detail}));
  }

  receiveMeleeDamage({sender, senderStats}: {sender: Mesh; zone: string; senderStats: CharacterStats;}) {
    const {player, attacking, defending, animate, characterStats} = this;
    const withinReach = sender.position.distanceTo(player.position) <= senderStats.reach;
    
    if (withinReach && !characterStats.unconscious && !senderStats.unconscious && sender.id !== player.id) {
      const doDamage = () => characterStats.damage(defending ? senderStats.power - 1 : senderStats.power);
      
      if (senderStats.type !== characterStats.type) doDamage();
      if (!defending && !attacking) animate('ouch');
    }
  }

  update(delta: number) {
    if (this.animating) {
      const {onLastFrame, onNextFrame} = this.actions;
      this.animatingSeconds += delta;

      if (this.animatingSeconds >= TOTAL_TIME) {
        this.animating = false;
        this.animatingSeconds = 0;
        onLastFrame?.(this.currentAnimate);

      } else if (this.animatingSeconds >= FRAME_TIME) {
        onNextFrame?.(this.currentAnimate);
      }
    }
  }
}