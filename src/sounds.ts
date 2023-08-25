import {Audio, AudioListener, AudioLoader, Camera} from 'three';

interface Sounds {
  [name: string]: Audio;
}

interface SoundOptions {
  loop?: boolean;
  volume?: number;
}

export class SoundEffects {
  listener: AudioListener;
  audioLoader: AudioLoader;
  sounds: Sounds;

  constructor(camera: Camera) {
    this.listener = new AudioListener();
    camera.add(this.listener);

    this.audioLoader = new AudioLoader();
    this.sounds = {};
  }

  load(soundsToLoad: {[name: string]: string}, callback: () => void) {
    let loadedCount = 0;
    for (const name in soundsToLoad) {
      this.audioLoader.load(soundsToLoad[name], buffer => {
        const sound = new Audio(this.listener);
        sound.setBuffer(buffer);
        this.sounds[name] = sound;

        loadedCount++;
        if (loadedCount === Object.keys(soundsToLoad).length && callback) {
          callback();
        }
      });
    }
  }

  play(name: string, options: SoundOptions = {}) {
    const bufferedSound = this.sounds[name];
    if (bufferedSound) {
        const sound = new Audio(this.listener);
        sound.setBuffer(bufferedSound.buffer!);
        if (options.loop !== undefined) sound.setLoop(options.loop);
        if (options.volume !== undefined) sound.setVolume(options.volume);
        sound.play();
        
        sound.onEnded = () => {
          sound.disconnect();
        };
    } else {
      console.warn(`Sound ${name} not loaded!`);
    }
  }
}
