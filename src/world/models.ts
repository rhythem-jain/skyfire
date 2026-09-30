import * as T from 'three';
import { batchStatic } from './batch';

const geometries = {
  box:new T.BoxGeometry(1,1,1), sphere:new T.SphereGeometry(1,12,8),
  cylinder:new T.CylinderGeometry(1,1,1,10), cone:new T.ConeGeometry(1,1,8)
};
export const materials = {
  body:new T.MeshStandardMaterial({color:0x42554b, roughness:0.63, metalness:0.45, flatShading:true}),
  armor:new T.MeshStandardMaterial({color:0x607064, roughness:0.75, metalness:0.35, flatShading:true}),
  dark:new T.MeshStandardMaterial({color:0x141d1b, roughness:0.7, metalness:0.55}),
  metal:new T.MeshStandardMaterial({color:0x849086, roughness:0.36, metalness:0.8}),
  glass:new T.MeshStandardMaterial({color:0x304c50, emissive:0x0d2328, emissiveIntensity:0.4, metalness:0.8, roughness:0.16, flatShading:true}),
  orange:new T.MeshStandardMaterial({color:0xf3a052, roughness:0.5, metalness:0.2}),
  red:new T.MeshStandardMaterial({color:0xeb6651, emissive:0xec4433, emissiveIntensity:1.8}),
  green:new T.MeshStandardMaterial({color:0x99ffce, emissive:0x66ffaa, emissiveIntensity:2}),
  tire:new T.MeshStandardMaterial({color:0x1d2421, roughness:1}),
  enemy:new T.MeshStandardMaterial({color:0x6e6b54, roughness:0.85, flatShading:true}),
  enemyDark:new T.MeshStandardMaterial({color:0x484b3d, roughness:0.9, flatShading:true}),
  white:new T.MeshStandardMaterial({color:0xd7dbc5, roughness:0.9})
};
export function shape(parent:T.Object3D, type:keyof typeof geometries, material:T.Material, size:[number,number,number], position:[number,number,number], rotation?:[number,number,number]) {
  const mesh = new T.Mesh(geometries[type],material);
  mesh.scale.set(...size); mesh.position.set(...position);
  if(rotation) mesh.rotation.set(...rotation);
  parent.add(mesh); return mesh;
}
export interface Aircraft { group:T.Group; rotor:T.Group; tailRotor:T.Group; muzzle:T.Object3D; exhaust:T.Object3D }
export function helicopter():Aircraft {
  const g = new T.Group(), m = materials;
  shape(g,'sphere',m.body,[2.3,2.0,5.1],[0,0,0]);
  shape(g,'box',m.armor,[3.5,1.0,7.3],[0,-1.0,-0.3]);
  shape(g,'sphere',m.glass,[1.8,1.65,2.7],[0,0.7,-3.4]);
  // Armored canopy spine and framing, not an external texture.
  shape(g,'box',m.dark,[0.13,0.16,4.8],[0,2.02,-2.5],[0.10,0,0]);
  for(const side of [-1,1]) {
    shape(g,'box',m.armor,[0.16,2.3,0.22],[side*1.45,0.5,-3.5],[0.25,0,side*-0.3]);
    shape(g,'box',m.orange,[0.055,0.38,2.4],[side*2.1,0.15,0.2]);
    shape(g,'box',m.armor,[4.8,0.28,1.7],[side*3.7,-0.3,0.5],[0,side*0.08,side*-0.12]);
    shape(g,'box',m.orange,[0.42,0.31,1.7],[side*5.7,-0.06,0.66],[0,side*0.08,side*-0.12]);
    shape(g,'cylinder',m.dark,[0.78,3.4,0.78],[side*3.6,-1.1,-0.2],[Math.PI/2,0,0]);
    for(let j=0;j<6;j++) {
      const a=j/6*Math.PI*2;
      shape(g,'cylinder',m.metal,[0.14,0.13,0.14],[side*3.6+Math.cos(a)*0.44,-1.1+Math.sin(a)*0.44,-1.96],[Math.PI/2,0,0]);
    }
    for(const off of [0,0.55]) {
      shape(g,'cylinder',m.white,[0.18,3.4,0.18],[side*(4.8+off),-0.65,-0.4],[Math.PI/2,0,0]);
      shape(g,'cone',m.dark,[0.18,0.6,0.18],[side*(4.8+off),-0.65,-2.4],[-Math.PI/2,0,0]);
    }
    shape(g,'sphere',m.body,[0.85,0.8,2.2],[side*1.3,1.7,0.6]);
    shape(g,'cylinder',m.dark,[0.56,1.0,0.56],[side*1.3,1.7,2.7],[Math.PI/2,0,0]);
    shape(g,'cylinder',m.metal,[0.12,2.0,0.12],[side*1.55,-2.0,1.6],[0,0,side*0.35]);
    shape(g,'cylinder',m.tire,[0.53,0.38,0.53],[side*2,-2.8,1.6],[0,0,Math.PI/2]);
    shape(g,'sphere',side===1?m.green:m.red,[0.14,0.14,0.14],[side*6,-0.05,0.65]);
    // Raised ventilation slats.
    for(let j=0;j<5;j++) shape(g,'box',m.dark,[0.07,0.5,0.16],[side*2.08,0.7,0.7+j*0.35],[0.2,0,0]);
  }
  shape(g,'cylinder',m.armor,[0.58,8.9,0.58],[0,0.5,7.5],[Math.PI/2,0,0]);
  shape(g,'box',m.armor,[0.25,3.8,2.6],[0,2.1,11.1],[0.35,0,0]);
  shape(g,'box',m.orange,[0.28,0.6,2.2],[0,3.5,11.5],[0.35,0,0]);
  shape(g,'box',m.armor,[5.2,0.2,1.25],[0,0.8,9.5]);
  shape(g,'sphere',m.dark,[0.65,0.6,0.9],[0,-1.7,-3.9]);
  shape(g,'cylinder',m.metal,[0.14,2.0,0.14],[0,-1.7,-5.4],[Math.PI/2,0,0]);
  shape(g,'cylinder',m.metal,[0.1,1.4,0.1],[0,-2.1,-2.8],[0.2,0,0]);
  shape(g,'cylinder',m.tire,[0.38,0.28,0.38],[0,-2.8,-3],[0,0,Math.PI/2]);
  shape(g,'cylinder',m.metal,[0.28,1.5,0.28],[0,2.7,0.4]);
  const rotor = new T.Group(); rotor.position.set(0,3.45,0.4);g.add(rotor);
  shape(rotor,'sphere',m.metal,[0.7,0.25,0.7],[0,0,0]);
  for(let i=0;i<4;i++) {
    const blade = new T.Group();blade.rotation.y=i*Math.PI/2;rotor.add(blade);
    shape(blade,'box',m.dark,[0.52,0.08,9.3],[0,0,5.0]);
    shape(blade,'box',m.orange,[0.53,0.085,0.65],[0,0,9.25]);
  }
  const tailRotor = new T.Group();tailRotor.position.set(0.5,2.6,11.3);tailRotor.rotation.z=Math.PI/2;g.add(tailRotor);
  shape(tailRotor,'box',m.dark,[0.18,0.08,3.2],[0,0,0]);
  shape(tailRotor,'box',m.dark,[3.2,0.08,0.18],[0,0,0]);
  const muzzle=new T.Object3D();muzzle.position.set(0,-1.7,-6.6);g.add(muzzle);
  const exhaust=new T.Object3D();exhaust.position.set(0,1.8,3);g.add(exhaust);
  batchStatic(g,new Set([rotor,tailRotor]));batchStatic(rotor);batchStatic(tailRotor);
  return {group:g,rotor,tailRotor,muzzle,exhaust};
}

export function vehicle(sam=false):T.Group {
  const g = new T.Group(), m=materials;
  shape(g,'box',m.enemy,[5.2,1.3,8.3],[0,1.3,0]);
  shape(g,'box',m.enemyDark,[4.8,0.5,7.3],[0,2.2,0]);
  for(const side of [-1,1]) {
    shape(g,'box',m.tire,[1.2,1.5,8.8],[side*2.5,0.8,0]);
    for(let i=0;i<6;i++) shape(g,'cylinder',m.enemyDark,[0.59,1.25,0.59],[side*2.55,0.85,-3.2+i*1.3],[0,0,Math.PI/2]);
  }
  const turret = new T.Group(); turret.position.y=2.5;g.add(turret);g.userData.turret=turret;
  if(sam) {
    shape(turret,'box',m.enemyDark,[3,1,4],[0,0.5,0]);
    for(const x of [-1,1]) for(const y of [0,1]) shape(turret,'box',m.enemy,[0.85,0.85,6],[x,1.3+y,0.3],[-0.3,0,0]);
    shape(g,'cylinder',m.metal,[0.08,5,0.08],[1.5,4,3]);
    shape(g,'sphere',m.enemyDark,[1.6,0.2,0.9],[1.5,6,3],[0.5,0,0]);
  } else {
    shape(turret,'sphere',m.enemy,[2.1,1.0,2.7],[0,0.45,0]);
    shape(turret,'cylinder',m.enemyDark,[0.21,6.5,0.21],[0,0.65,-4.3],[Math.PI/2,0,0]);
    shape(turret,'box',m.dark,[0.65,0.65,1],[0,0.65,-7.5]);
    shape(turret,'box',m.white,[1.5,0.08,0.5],[0,1.4,-0.3]);
  }
  shape(g,'box',m.orange,[1.8,0.08,0.35],[0,2.48,3]);
  batchStatic(g,new Set([turret]));batchStatic(turret);
  return g;
}
