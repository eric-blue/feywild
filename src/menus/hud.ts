import type { Gamestate } from "../gamestate";

export class HUD {
  menu: HTMLMenuElement | null;

  constructor(private gamestate: Gamestate) {
    this.menu = document.querySelector('#hud');
    this.menu?.classList.toggle('hidden');
  }

  update() {
    const { playerState } = this.gamestate.state;
    const { health, baseHealth } = playerState;

    /**
     * setting css variables
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
     */
    this.menu?.style.setProperty('--health', `${health}`);
    this.menu?.style.setProperty('--base-health', `${baseHealth}`);

    this.menu?.querySelector('.blinded')?.classList.toggle('hidden', !playerState.blinded);
    this.menu?.querySelector('.stunned')?.classList.toggle('hidden', !playerState.stunned);
    this.menu?.querySelector('.weakened')?.classList.toggle('hidden', !playerState.weakened);
    this.menu?.querySelector('.crippled')?.classList.toggle('hidden', !playerState.crippled);
  }
}
