import * as T from 'three';
import { materials, shape } from './models';
import { batchStatic } from './batch';
export function randomSequence(seed:number) { return () => { seed=(Math.imul(seed,1664525)+1013904223)|0; return (seed>>>0)/4294967296; }; }
export const roadX=(z:number) => Math.sin(z*0.008)*25;
export function createEnvironment(scene:T.Scene) {
  scene.background=new T.Color(0xb8c3c0);
  scene.fog=new T.Fog(0xb8c0b5,110,850);
  scene.add(new T.HemisphereLight(0xd8e6dc,0x827151,2.6));
  const sun=new T.DirectionalLight(0xffdfac,3.8);sun.position.set(-100,160,-80);scene.add(sun);
  const rim=new T.DirectionalLight(0xb9d9e3,1.5);rim.position.set(100,60,100);scene.add(rim);
  const groundMat=new T.MeshStandardMaterial({color:0xbca57b,roughness:1,flatShading:true});
  const ground=new T.Mesh(new T.PlaneGeometry(2600,2800),groundMat);ground.rotation.x=-Math.PI/2;ground.position.set(0,-0.2,-400);scene.add(ground);
  const random=randomSequence(8091);
  // Continuous ribbon follows the same road function used by enemy placements.
  const vertices:number[]=[], indices:number[]=[];
  for(let i=0;i<=150;i++) {
    const z=350-i*10,x=roadX(z);
    vertices.push(x-10,0.03,z,x+10,0.03,z);
    if(i<150){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const roadGeo=new T.BufferGeometry();roadGeo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));roadGeo.setIndex(indices);roadGeo.computeVertexNormals();
  const road=new T.Mesh(roadGeo,new T.MeshStandardMaterial({color:0x807b64,roughness:1}));scene.add(road);
  const dash=new T.InstancedMesh(new T.PlaneGeometry(0.32,4.5),new T.MeshBasicMaterial({color:0xcfc5a6}),170);
  const dummy=new T.Object3D();
  for(let i=0;i<170;i++){const z=340-i*8.7;dummy.position.set(roadX(z),0.06,z);dummy.rotation.set(-Math.PI/2,0,0);dummy.updateMatrix();dash.setMatrixAt(i,dummy.matrix);}scene.add(dash);
  // Layered faceted sandstone mesas, distributed off the combat corridor.
  const rockGeo=new T.CylinderGeometry(0.65,1.2,1,7,1);
  const rockMats=[0xa68d6d,0xa99371,0xc1a985,0x92836b].map(color=>new T.MeshStandardMaterial({color,roughness:1,flatShading:true}));
  for(let i=0;i<60;i++) {
    const side=i%2===0?-1:1, z=220-Math.floor(i/2)*46;
    const height=35+random()*120, width=35+random()*70;
    const x=side*(180+random()*200);
    const mountain=new T.Mesh(rockGeo,rockMats[i%4]);mountain.position.set(x,height/2-3,z);mountain.scale.set(width,height,width*(0.5+random()*0.7));mountain.rotation.y=random()*3;scene.add(mountain);
    const cap=new T.Mesh(rockGeo,rockMats[(i+1)%4]);cap.position.set(x,height*0.88,z);cap.scale.set(width*0.66,height*0.14,width*0.6);cap.rotation.y=mountain.rotation.y;scene.add(cap);
  }
  const rocks=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),rockMats[2],350);
  for(let i=0;i<350;i++) {
    const z=260-random()*1300;let x=(random()-0.5)*400;
    if(Math.abs(x-roadX(z))<17)x+=30;
    const scale=0.8+random()*5;
    dummy.position.set(x,scale*0.28,z);dummy.rotation.set(random(),random()*6,0);dummy.scale.set(scale*1.8,scale*0.8,scale);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
  }scene.add(rocks);
  const scrub=new T.InstancedMesh(new T.ConeGeometry(1,1,4),new T.MeshStandardMaterial({color:0x797b50,roughness:1}),220);
  for(let i=0;i<220;i++) {
    const z=200-random()*1150;let x=(random()-0.5)*310;if(Math.abs(x-roadX(z))<14)x+=20;
    dummy.position.set(x,0.7,z);dummy.rotation.set(0,random()*6,0);dummy.scale.set(1+random()*2,1+random()*2,1+random()*2);dummy.updateMatrix();scrub.setMatrixAt(i,dummy.matrix);
  }scene.add(scrub);
  // Outpost: modular hangars, barriers, watchtowers and fuel storage.
  const building=new T.MeshStandardMaterial({color:0xa89e81,roughness:0.92});
  const roof=new T.MeshStandardMaterial({color:0x596659,roughness:0.75});
  for(let i=0;i<8;i++) {
    const x=65+(i%3)*25,z=-190-Math.floor(i/3)*40;
    shape(scene,'box',building,[17,8,24],[x,4,z]);
    shape(scene,'box',roof,[19,0.8,26],[x,8.3,z]);
    shape(scene,'box',materials.dark,[10,6,0.12],[x,3,z+12.1]);
    for(const side of [-1,1]) shape(scene,'box',materials.orange,[0.5,6,0.2],[x+side*5.4,3,z+12.2]);
  }
  for(let i=0;i<4;i++) {
    const x=-75+i*10,z=-270;
    shape(scene,'cylinder',building,[3,12,3],[x,6,z]);
    shape(scene,'cylinder',materials.dark,[3.05,0.6,3.05],[x,9,z]);
  }
  for(const z of [-160,-330]) {
    const tower=new T.Group();tower.position.set(54,0,z);scene.add(tower);
    for(const x of [-3,3]) for(const y of [-3,3])shape(tower,'box',roof,[0.45,18,0.45],[x,9,y]);
    shape(tower,'box',building,[9,3,9],[0,17,0]);
    shape(tower,'box',roof,[10,0.5,10],[0,19,0]);
    shape(tower,'box',materials.glass,[8,1,9.1],[0,17.4,0]);
  }
  // Soft geometric contact shadows are cheaper than a full dynamic shadow atlas.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=64;shadowCanvas.height=64;
  const ctx=shadowCanvas.getContext('2d')!;const gradient=ctx.createRadialGradient(32,32,2,32,32,32);gradient.addColorStop(0,'rgba(20,28,22,.5)');gradient.addColorStop(1,'rgba(20,28,22,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadow=new T.Mesh(new T.PlaneGeometry(28,24),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=0.1;scene.add(shadow);
  batchStatic(scene,new Set([shadow]));
  return {shadow};
}
