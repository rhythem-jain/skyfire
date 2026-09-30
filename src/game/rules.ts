export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const damage = (health: number, amount: number) => clamp(health - Math.max(0, amount), 0, 10000);
export const multiplier = (kills: number) => kills >= 20 ? 10 : kills >= 10 ? 5 : kills >= 6 ? 3 : kills >= 3 ? 2 : 1;
export const canLaunch = (ammo: number, cooldown: number, lock: number) => ammo > 0 && cooldown <= 0 && lock >= 1;
export const missionState = (health: number, remaining: number, seconds: number): 'active' | 'complete' | 'failed' =>
  health <= 0 ? 'failed' : remaining === 0 ? 'complete' : seconds <= 0 ? 'failed' : 'active';
export const missionBonus = (health: number, seconds: number) => Math.round(Math.max(0, health) * 15 + Math.max(0, seconds) * 10);
export const starRating = (health: number, accuracy: number) => 1 + Number(health >= 60) + Number(accuracy >= 0.35);
export function raySphereDistance(origin: {x:number;y:number;z:number}, direction: {x:number;y:number;z:number}, center: {x:number;y:number;z:number}, radius: number): number | null {
  const x = center.x - origin.x, y = center.y - origin.y, z = center.z - origin.z;
  const projection = x * direction.x + y * direction.y + z * direction.z;
  const perpendicular = x*x + y*y + z*z - projection*projection;
  if (perpendicular > radius*radius) return null;
  const delta = Math.sqrt(radius*radius - perpendicular);
  const near = projection - delta, far = projection + delta;
  return near >= 0 ? near : far >= 0 ? far : null;
}
