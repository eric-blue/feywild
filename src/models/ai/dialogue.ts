import {Mesh} from 'three';
import {addListener, removeListener} from '../helpers';

// export type string = `interaction_${number}`;
export interface DialogueNode {
  sender: string;
  receiver: string;
  message: string;
  options: string[];
  nextId: string | null;
}

export type DialogueNodes = {
  [key: string]: DialogueNode;
};

export class Dialogue {
  dialog: HTMLDialogElement | null;
  open = false;
  activeInteraction: string;

  public interactions: DialogueNodes | undefined;
  public isTouchingPlayer?: () => boolean;
  public onDialogueEnd?: () => void;
  public onDialogueStart?: () => void;
  uuid: string;

  constructor(
    public npc: Mesh,
    jsonPath: string
  ) {
    this.dialog = document.querySelector('#modal');
    this.uuid = this.npc.uuid;
    this.activeInteraction = `${this.uuid}_interaction_0`;

    import(jsonPath).then(({default: json}) => {
      const swapUUIDs = JSON.stringify(json).replaceAll(
        'interaction_',
        `${this.uuid}_interaction_`
      );
      this.interactions = JSON.parse(swapUUIDs);
    });

    const toggleDialog = () => {
      window.lockPlayer = !window.lockPlayer;
      this.open = !this.open;
      this.dialog?.toggleAttribute('open');

      if (this.open) this.openDialogue();
      if (!this.open) this.exitDialogue();
    };

    addEventListener('keypress', event => {
      if (
        !window.paused &&
        (event.key === ' ' || event.key === 'Enter') &&
        !event.repeat
      ) {
        if (!this.dialog?.open && this.isTouchingPlayer?.()) toggleDialog();
        if (this.open) {
          const current = this.interactions?.[this.activeInteraction];
          // handle next on Enter/Space
          if (current && !current.options.length && current.nextId) {
            this.nextInteraction(current.nextId);
          }

          // handle exit
          if (current && !current.options.length && !current.nextId) {
            toggleDialog();
          }
        }
      }
    });
  }

  nextInteraction(interaction: string) {
    this.populateMarkup(interaction);
    window.soundManager.play('hit', {volume: 0.1});
  }

  answer(option: string) {
    const interaction = option.replace('option-', '');
    this.populateMarkup(interaction);
    window.soundManager.play('hit', {volume: 0.1});
  }

  populateMarkup(interaction?: string) {
    // this injects the current interaction into html
    if (this.interactions && interaction) {
      window.soundManager.play('chatter', {volume: 0.25});

      this.activeInteraction = interaction;

      if (this.interactions) {
        const {message, sender, options} = this.interactions[interaction];
        const msg = message.replace(' [exit]', '');
        let html = interaction
          ? `<p>
          <strong>${sender}</strong>: <br/>${
            sender === 'Player' ? `<em>${msg}</em>` : msg
          }
        </p>`
          : '';

        if (options.length > 0) {
          html += `<ol>
              ${options
                .map(
                  option => `<li>
                <button autofocus id="option-${option}">${this.interactions?.[option]?.message}</button>
              </li>`
                )
                .join('')}
            </ol>`;
        }

        this.dialog!.innerHTML = html;

        if (options.length > 0) {
          options.forEach((option, i) => {
            if (i === 0) {
              document
                .querySelector<HTMLButtonElement>(`#option-${option}`)
                ?.focus();
            }
            addListener(`#option-${option}`, id => this.answer(id));
          });

          const focusNext = (increment = 1) => {
            const list = Array.from(
              this.dialog?.querySelectorAll('li button') ?? []
            ) as HTMLButtonElement[];
            const current = list?.findIndex(
              button => button === document.activeElement
            );

            list[
              current + increment > list.length ? 0 : current + increment
            ]?.focus();

            window.soundManager.play('focus', {volume: 0.25});
          };

          const handleKeyDown = ({key}: KeyboardEvent) => {
            if (this.open && !window.paused) {
              if (key === 'ArrowUp' || key.toUpperCase() === 'W') focusNext(-1);
              if (key === 'ArrowLeft' || key.toUpperCase() === 'A') {
                focusNext(-1);
              }
              if (key === 'ArrowDown' || key.toUpperCase() === 'S') focusNext();
              if (key === 'ArrowRight' || key.toUpperCase() === 'D') {
                focusNext();
              }
            }
          };
          addEventListener('keydown', handleKeyDown);

          const cleanup = () => {
            this.dialog?.removeEventListener('close', cleanup);
            removeEventListener('keydown', handleKeyDown);

            options.forEach(option => {
              removeListener(`#option-${option}`, id => this.answer(id));
            });

            this.exitDialogue();
          };

          this.dialog?.addEventListener('close', cleanup);
        }
      }
    } else {
      this.dialog!.innerHTML = '';
      this.activeInteraction = `${this.uuid}_interaction_0`; // default to the first for now
    }
  }

  /**
   * open dialogue dialog
   */
  openDialogue() {
    this.onDialogueStart?.();
    this.activeInteraction = `${this.uuid}_interaction_0`;
    this.populateMarkup(this.activeInteraction);
  }

  /**
   * close dialogue dialog
   */
  exitDialogue() {
    this.onDialogueEnd?.();
    this.populateMarkup();
  }
}
