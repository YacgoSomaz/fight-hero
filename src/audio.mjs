// Sound files are direct FFDec exports of the authorised SWF.  Audio is only
// constructed after a user gesture, satisfying browser autoplay policies.
const SOUND = Object.freeze({
  fire: './assets/audio/71_S_assaultFire.mp3',
  reload: './assets/audio/108_S_RifleReload.mp3',
  hit: './assets/audio/80_S_Headshot1.mp3',
  death: './assets/audio/75_S_Die8.mp3',
  click: './assets/audio/233_S_Click.mp3',
  menu: './assets/audio/93_M_Menu.mp3',
});

export class AudioBank {
  constructor({ muted = false } = {}) {
    this.muted = muted;
    this.cache = new Map();
    this.menu = null;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.menu) this.menu.muted = this.muted;
  }

  play(name, volume = .38) {
    if (this.muted || !SOUND[name]) return;
    const source = this.cache.get(name) ?? new Audio(SOUND[name]);
    this.cache.set(name, source);
    const sound = source.cloneNode();
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  startMenu() {
    if (this.muted || this.menu) return;
    this.menu = new Audio(SOUND.menu);
    this.menu.loop = true;
    this.menu.volume = .13;
    this.menu.play().catch(() => { this.menu = null; });
  }

  stopMenu() {
    if (!this.menu) return;
    this.menu.pause();
    this.menu = null;
  }
}
