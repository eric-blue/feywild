export interface BaseStats {
  reach?: number;
  farsight?: number;
  speed?: number;
  type?: 'enemy' | 'friendly' | 'player';
  health?: number;
  power?: number;
  defence?: number;
}

export interface InitStats extends BaseStats {
  unconscious?: boolean;
}

export interface CharacterStatState extends BaseStats {
  unconscious: boolean;
  baseHealth: number;
  baseFarsight: number;
  baseSpeed: number;
  basePower: number;
  baseDefence: number;
  
  blinded: boolean;
  blindedSeconds: number;
  stunned: boolean;
  stunnedSeconds: number;
  weakened: boolean;
  weakenedSeconds: number;
  crippled: boolean;
  crippledSeconds: number;
}

interface StatsActions {
  onDeath?: () => void;
  onReceiveDamage?: (amount: number) => void;
  onHeal?: (amount: number) => void;
  onRevive?: () => void;
  onBlindStart?: () => void;
  onBlindEnd?: () => void;
  onStunStart?: () => void;
  onStunEnd?: () => void;
  onWeakenStart?: () => void;
  onWeakenEnd?: () => void;
  onCrippleStart?: () => void;
  onCrippleEnd?: () => void;
  onBodySwap?: (newStats: BaseStats) => void;
}

export class CharacterStats {
  private unconscious = false;

  blinded = false;
  private blindedSeconds = 0;

  stunned = false;
  private stunnedSeconds = 0;

  weakened = false;
  private weakenedSeconds = 0;

  crippled = false;
  private crippledSeconds = 0;

  reach: number;
  type: BaseStats['type'];
  
  farsight: number;
  protected baseFarsight: number;
  
  speed: number;
  protected baseSpeed: number;

  power: number;
  protected basePower: number;

  defence: number;
  protected baseDefence: number;

  health: number;
  protected baseHealth: number;

  constructor(
    {unconscious, reach, farsight, speed, type, health, power, defence}: InitStats,
    public actions: StatsActions
  ) {
    this.unconscious = unconscious ?? false;
    this.reach = reach ?? 2.25;
    this.baseFarsight = this.farsight = farsight ?? 10;
    this.baseSpeed = this.speed = speed ?? 0.1;
    this.type = type ?? 'friendly';

    this.basePower = this.power = power ?? 1;
    this.baseDefence = this.defence = defence ?? 1;
    this.baseHealth = this.health = health ?? 2;
  }

  heal(amount: number) {
    this.health = Math.min(this.health + amount, this.baseHealth);
    this.actions.onHeal?.(amount);

    if (this.health > 0 && this.unconscious) {
      this.unconscious = false;
      this.actions.onRevive?.();
    }
  }

  damage(attack: number) {
    const dmg = Math.max(attack - this.defence, 0);
    this.health = Math.max(this.health - dmg, 0);
    this.actions.onReceiveDamage?.(dmg);

    if (this.health <= 0) {
      this.unconscious = true;
      this.actions.onDeath?.();
    }
  }

  blind(seconds: number) {
    if (this.unconscious) {
      console.warn('no effect'); 
      return;
    }

    this.blinded = seconds > 0;
    this.blindedSeconds = seconds;
    this.farsight = this.blinded ? 0 : this.baseFarsight;
    if (this.blindedSeconds > 0) this.actions.onBlindStart?.();
  }
    
  stun(seconds: number) {
    if (this.unconscious) {
      console.warn('no effect'); 
      return;
    }

    this.stunned = seconds > 0;
    this.stunnedSeconds = seconds;
    this.speed = this.stunned ? 0 : this.baseSpeed;
    if (this.stunnedSeconds > 0) this.actions.onStunStart?.();
  }

  weaken(seconds: number) {
    if (this.unconscious) {
      console.warn('no effect'); 
      return;
    }
    
    this.weakened = seconds > 0;
    this.weakenedSeconds = seconds;
    this.defence = this.weakened ? this.baseDefence - 1 : this.baseDefence;
    if (this.weakenedSeconds > 0) this.actions.onWeakenStart?.();
  }

  cripple(seconds: number) {
    if (this.unconscious) {
      console.warn('no effect'); 
      return;
    }

    this.crippled = seconds > 0;
    this.crippledSeconds = seconds;
    this.power = this.crippled ? this.basePower - 1 : this.basePower;
    if (this.crippledSeconds > 0) this.actions.onCrippleStart?.();
  }

  changeStats({reach, farsight, speed, type, health, power, defence}: Partial<BaseStats>) {
    if (reach) this.reach = reach;
    if (farsight) this.farsight = farsight;
    if (speed) this.speed = speed;
    if (type) this.type = type;
    if (health) this.baseHealth = this.health = health;
    if (power) this.basePower = this.power = power;
    if (defence) this.baseDefence = this.defence = defence;
  }

  swapBodies(newStats: Omit<BaseStats, "type"|"health">) {
    this.changeStats(newStats);
    this.actions.onBodySwap?.(newStats);
  }

  update(delta: number): CharacterStatState {
    if (this.blindedSeconds > 0) {
      this.blindedSeconds -= delta;
  
      if (this.blindedSeconds <= 0) {
        this.blinded = false;
        this.actions.onBlindEnd?.();
      }
    }

    if (this.stunnedSeconds > 0) {
      this.stunnedSeconds -= delta;
  
      if (this.stunnedSeconds <= 0) {
        this.stunned = false;
        this.actions.onStunEnd?.();
      }
    }

    if (this.weakenedSeconds > 0) {
      this.weakenedSeconds -= delta;
  
      if (this.weakenedSeconds <= 0) {
        this.weakened = false;
        this.actions.onWeakenEnd?.();
      }
    }

    if (this.crippledSeconds > 0) {
      this.crippledSeconds -= delta;
  
      if (this.crippledSeconds <= 0) {
        this.crippled = false;
        this.actions.onCrippleEnd?.();
      }
    }

    return {
      unconscious: this.unconscious,
      reach: this.reach,
      farsight: this.farsight,
      baseFarsight: this.baseFarsight,
      speed: this.speed,
      baseSpeed: this.baseSpeed,
      type: this.type,
      health: this.health,
      baseHealth: this.baseHealth,
      power: this.power,
      basePower: this.basePower,
      defence: this.defence,
      baseDefence: this.baseDefence,
      blinded: this.blinded,
      blindedSeconds: this.blindedSeconds,
      stunned: this.stunned,
      stunnedSeconds: this.stunnedSeconds,
      weakened: this.weakened,
      weakenedSeconds: this.weakenedSeconds,
      crippled: this.crippled,
      crippledSeconds: this.crippledSeconds,
    }
  }
}