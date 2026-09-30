import { clamp } from '../game/rules';
import type { Action, Settings } from './save';
export class Input {
  keys = new Set<string>(); pressed = new Set<string>();
  mouse = {x:0, y:0, active:false, fire:false, missile:false};
  enabled = false;
  constructor(public settings: Settings, canvas: HTMLCanvasElement, pause: () => void) {
    window.addEventListener('keydown', e => {
      if (!this.enabled) return;
      if (e.code === 'Escape') { pause(); return; }
      if (Object.values(this.settings.bindings).includes(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    canvas.addEventListener('pointermove', e => {
      if (!this.enabled) return;
      this.mouse.active = true;
      this.mouse.x = clamp((e.clientX / innerWidth * 2 - 1) * this.settings.sensitivity, -0.95, 0.95);
      this.mouse.y = clamp(-(e.clientY / innerHeight * 2 - 1) * this.settings.sensitivity * (this.settings.invertY ? -1 : 1), -0.95, 0.95);
    });
    canvas.addEventListener('pointerdown', e => {
      if (!this.enabled) return;
      if (e.button === 0) this.mouse.fire = true;
      if (e.button === 2) this.mouse.missile = true;
    });
    window.addEventListener('pointerup', e => { if (e.button === 0) this.mouse.fire = false; if (e.button === 2) this.mouse.missile = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('blur', () => { this.clear(); pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.clear(); pause(); } });
  }
  held(action: Action) { return this.enabled && (this.keys.has(this.settings.bindings[action]) || (action === 'boost' && this.settings.bindings.boost === 'ShiftLeft' && this.keys.has('ShiftRight'))); }
  consume(action: Action) { const key = this.settings.bindings[action]; const exists = this.pressed.has(key); this.pressed.delete(key); return exists; }
  clear() { this.keys.clear(); this.pressed.clear(); this.mouse.fire = false; this.mouse.missile = false; }
}
