import test from 'node:test';
import assert from 'node:assert/strict';
import { damage, multiplier, canLaunch, missionState, missionBonus, starRating, raySphereDistance } from '../src/game/rules.ts';
import { decodeSave, defaults } from '../src/core/save.ts';

test('damage cannot heal and clamps lethal hits',()=>{
  assert.equal(damage(100,17),83);assert.equal(damage(10,100),0);assert.equal(damage(45,-12),45);
});
test('combo thresholds implement the design table',()=>{
  assert.deepEqual([0,2,3,5,6,9,10,19,20].map(multiplier),[1,1,2,2,3,3,5,5,10]);
});
test('missile requires lock, ammo and elapsed cooldown',()=>{
  assert.equal(canLaunch(1,0,1),true);assert.equal(canLaunch(0,0,1),false);assert.equal(canLaunch(8,0,0.99),false);assert.equal(canLaunch(8,0.1,1),false);
});
test('mission failure, victory and timer priorities are deterministic',()=>{
  assert.equal(missionState(100,6,180),'active');assert.equal(missionState(1,0,0),'complete');assert.equal(missionState(0,0,1),'failed');assert.equal(missionState(1,1,0),'failed');
});
test('survival, time bonus and stars reward measurable performance',()=>{
  assert.equal(missionBonus(100,100),2500);assert.equal(missionBonus(-10,-10),0);assert.equal(starRating(90,0.5),3);assert.equal(starRating(25,0.1),1);
});
test('cannon ray hits nearest forward sphere and ignores misses/behind',()=>{
  const origin={x:0,y:0,z:0},direction={x:0,y:0,z:-1};
  assert.equal(raySphereDistance(origin,direction,{x:0,y:0,z:-100},5),95);
  assert.equal(raySphereDistance(origin,direction,{x:10,y:0,z:-100},5),null);
  assert.equal(raySphereDistance(origin,direction,{x:0,y:0,z:100},5),null);
});
test('missing, corrupt and future-version saves safely reset',()=>{
  for(const value of [null,'{invalid','null','[]','{"version":99,"best":999}'])assert.deepEqual(decodeSave(value),defaults());
});
test('save round-trip retains settings and score',()=>{
  const save=defaults();save.best=5000;save.settings.volume=0.2;save.settings.quality='low';save.settings.bindings.fire='KeyF';
  assert.deepEqual(decodeSave(JSON.stringify(save)),save);
});
test('save validates ranges, booleans, key names and uniqueness',()=>{
  const result=decodeSave(JSON.stringify({version:1,best:-2,sorties:'invalid',settings:{volume:9,sensitivity:-5,quality:'cinema',invertY:'yes',bindings:{fire:'Escape',missile:'KeyW'}}}));
  assert.equal(result.best,0);assert.equal(result.sorties,0);assert.equal(result.settings.volume,1);assert.equal(result.settings.sensitivity,0.4);assert.equal(result.settings.quality,'high');assert.equal(result.settings.invertY,false);assert.deepEqual(result.settings.bindings,defaults().settings.bindings);
});
