import { clamp } from '../game/rules';
export type Action = 'forward'|'back'|'left'|'right'|'down'|'up'|'boost'|'fire'|'missile'|'cycle'|'flare';
export interface Settings {
  quality: 'low'|'medium'|'high'|'ultra'; volume: number; sensitivity: number;
  invertY: boolean; reducedShake: boolean; bindings: Record<Action, string>;
}
export interface Save { version: 1; best: number; sorties: number; settings: Settings }
export const defaultBindings: Record<Action, string> = {
  forward:'KeyW', back:'KeyS', left:'KeyA', right:'KeyD', down:'KeyQ', up:'KeyE',
  boost:'ShiftLeft', fire:'KeyJ', missile:'KeyK', cycle:'Tab', flare:'Space'
};
export function defaults(): Save { return {version:1, best:0, sorties:0, settings:{quality:'high', volume:0.45, sensitivity:1, invertY:false, reducedShake:false, bindings:{...defaultBindings}}}; }
const number = (v: unknown, fallback: number, max: number) => typeof v === 'number' && Number.isFinite(v) ? clamp(v, 0, max) : fallback;
export function decodeSave(raw: string | null): Save {
  const base = defaults();
  try {
    const parsed = JSON.parse(raw ?? '{}');
    if (!parsed || parsed.version !== 1) return base;
    base.best = Math.floor(number(parsed.best, 0, 10000000));
    base.sorties = Math.floor(number(parsed.sorties, 0, 1000000));
    const s = parsed.settings;
    if (!s || typeof s !== 'object') return base;
    if (['low','medium','high','ultra'].includes(s.quality)) base.settings.quality = s.quality;
    base.settings.volume = number(s.volume, 0.45, 1);
    base.settings.sensitivity = clamp(number(s.sensitivity, 1, 2), 0.4, 2);
    base.settings.invertY = s.invertY === true;
    base.settings.reducedShake = s.reducedShake === true;
    const allowed = /^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Shift(Left|Right)|Space|Tab)$/;
    if (s.bindings && typeof s.bindings === 'object') {
      const proposed = {...defaultBindings};
      for (const key of Object.keys(proposed) as Action[]) {
        const value = s.bindings[key];
        if (typeof value === 'string' && allowed.test(value)) proposed[key] = value;
      }
      if (new Set(Object.values(proposed)).size === Object.keys(proposed).length) base.settings.bindings = proposed;
    }
    return base;
  } catch { return base; }
}
export function loadSave(): Save { try { return decodeSave(localStorage.getItem('skyfire.save')); } catch { return defaults(); } }
export function persist(save: Save): boolean { try { localStorage.setItem('skyfire.save', JSON.stringify(save)); return true; } catch { return false; } }
