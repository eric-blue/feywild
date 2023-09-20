import {Mesh} from 'three';
import {addListener, removeListener} from '../helpers';

export interface Passage {
  text: string;
  options: {
    id: string;
    text: string;
  }[];
}

export type Passages = {
  [id: string]: Passage;
};

export class Dialogue {
  dialog: HTMLDialogElement | null;
  open = false;
  
  activePassage: string = "START";
  public passages?: Passages;
  public isTouchingPlayer?: () => boolean;
  public onDialogueExit?: () => void;
  public onDialogueStart?: () => void;
  public onDialogueEnd?: () => void;
  // isFirstPassage: boolean;

  constructor(
    public npc: Mesh,
    filename: string
  ) {
    this.dialog = document.querySelector('#modal');
    // this.isFirstPassage = true;

    import(`../../twine/dialogue/${filename}.json`).then(({default: json}) => {
      this.passages = json;
    });

    addEventListener('keypress', event => {
      if (!window.paused && (event.key === ' ' || event.key === 'Enter') && !event.repeat) {
        if (!this.dialog?.open && this.isTouchingPlayer?.()) this.toggleDialog();
        if (this.open && this.activePassage) {
          const current = this.passages?.[this.activePassage];

          // handle next on Enter/Space
          if (current && current.options.length <= 1) {
            const [next] = current.options;
            this.answer(next.id);
          }

          // handle first passage
          // if (this.isFirstPassage) this.isFirstPassage = false;

          // handle exit
          // if (current && !current.text) {
          //   this.toggleDialog();
          // }
        }
      }
    });
  }

  toggleDialog() {
    window.lockPlayer = !window.lockPlayer;
    this.open = !this.open;
    this.dialog?.toggleAttribute('open');

    if (this.open) this.openDialogue();
    if (!this.open) this.exitDialogue();
  };

  answer(option: string) {
    this.populateMarkup(option.replace('option-', ''));
    window.soundManager.play('hit', {volume: 0.1});
  }

  populateMarkup(passage?: string) {

    const focusNext = (increment = 1) => {
      const list = Array.from(this.dialog?.querySelectorAll('li button') ?? []) as HTMLButtonElement[];
      const current = list?.findIndex(button => button === document.activeElement);

      list[current + increment > list.length ? 0 : current + increment]?.focus();

      window.soundManager.play('focus', {volume: 0.15});
    };

    const handleKeyDown = ({key}: KeyboardEvent) => {
      if (this.open && !window.paused) {
        if (key === 'ArrowUp' || key.toUpperCase() === 'W') focusNext(-1);
        if (key === 'ArrowLeft' || key.toUpperCase() === 'A') focusNext(-1);
        if (key === 'ArrowDown' || key.toUpperCase() === 'S') focusNext();
        if (key === 'ArrowRight' || key.toUpperCase() === 'D') focusNext();
      }
    };
    
    // this injects the current passage into html
    if (this.passages && passage) {
      this.activePassage = passage;
      const {text, options} = this.passages[passage];

      if (!text) {
        if (passage === 'END') this.onDialogueEnd?.();
        if (passage === 'EXIT') this.onDialogueExit?.();
        this.toggleDialog(); 
        return;
      }

      window.soundManager.play('chatter', {volume: 0.25});

      const sender = this.npc.name;

      let html = passage
        ? `<p>
          <strong>${sender}</strong>: <br/>${text.replaceAll('\n', '<br/>')}
        </p>`
        : '';

      if (this.passages && options.length > 1) {
        html += `<ol>
          ${options
            .map(
              option => `<li>
            <button id="option-${option.id}">${option.text}</button>
          </li>`
            )
            .join('')}
        </ol>`;
      }

      this.dialog!.innerHTML = html;

      if (options.length > 1) {
        options.forEach((option, i) => {
          if (i === 0) {
            document.querySelector<HTMLButtonElement>(`#option-${option.id}`)?.focus();
          }
          addListener(`#option-${option.id}`, id => {
            removeEventListener('keydown', handleKeyDown);
            this.answer(id)
          });
        });

        addEventListener('keydown', handleKeyDown);

        const cleanup = () => {
          this.dialog?.removeEventListener('close', cleanup);
          removeEventListener('keydown', handleKeyDown);
    
          options.forEach(option => {
            removeListener(`#option-${option.id}`, id => this.answer(id));
          });
    
          this.exitDialogue();
        };

        this.dialog?.addEventListener('close', cleanup);
      }
    } else {
      this.dialog!.innerHTML = '';
      this.activePassage = `START`;
    }
  }

  /**
   * open dialogue dialog
   */
  openDialogue() {
    this.onDialogueStart?.();
    this.activePassage = `START`;
    this.populateMarkup(this.activePassage);
  }

  /**
   * close dialogue dialog
   */
  exitDialogue() {
    this.populateMarkup();
  }
}
