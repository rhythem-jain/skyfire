import * as T from 'three';
interface Particle { position:T.Vector3; velocity:T.Vector3; life:number; total:number; size:number; color:T.Color; smoke:boolean }
export class Particles {
  readonly capacity=440;
  pool:Particle[]=[]; mesh:T.InstancedMesh; cursor=0; limit=440;
  private dummy=new T.Object3D();private tint=new T.Color();
  constructor(scene:T.Scene) {
    this.mesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),new T.MeshBasicMaterial({vertexColors:false}),this.capacity);
    this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);this.mesh.frustumCulled=false;
    for(let i=0;i<this.capacity;i++){this.pool.push({position:new T.Vector3(),velocity:new T.Vector3(),life:0,total:1,size:1,color:new T.Color(),smoke:false});this.dummy.scale.setScalar(0);this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);this.mesh.setColorAt(i,new T.Color(0));}
    scene.add(this.mesh);
  }
  emit(position:T.Vector3, count:number, force=10, smoke=false) {
    count=Math.ceil(count*this.limit/this.capacity);
    for(let i=0;i<count;i++) {
      const p=this.pool[this.cursor++%this.limit];p.position.copy(position);
      p.velocity.set((Math.random()-0.5)*force,Math.random()*force*0.9,(Math.random()-0.5)*force);
      p.total=p.life=smoke?1.4+Math.random()*1.2:0.25+Math.random()*0.65;
      p.size=smoke?0.9+Math.random()*1.4:0.15+Math.random()*0.9;p.smoke=smoke;
      p.color.set(smoke?(Math.random()>0.5?0x4a4a40:0x686553):(Math.random()>0.4?0xffa341:0xffedaf));
    }
  }
  explosion(position:T.Vector3) { this.emit(position,34,27);this.emit(position,22,14,true); }
  update(dt:number) {
    for(let i=0;i<this.capacity;i++) {
      const p=this.pool[i];p.life=Math.max(0,p.life-dt);
      if(p.life>0) {
        p.position.addScaledVector(p.velocity,dt);p.velocity.multiplyScalar(Math.exp(-dt*1.6));p.velocity.y+=dt*(p.smoke?2:-14);
        const t=1-p.life/p.total;
        this.dummy.position.copy(p.position);this.dummy.scale.setScalar(p.size*(p.smoke?1+t*3:1-t*0.7));
        this.tint.copy(p.color).multiplyScalar(p.smoke?1:1-t*0.65);this.mesh.setColorAt(i,this.tint);
      } else this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
  }
  clear() { for(const p of this.pool)p.life=0;this.update(0); }
}
