import * as T from 'three';
import { Input } from '../core/input';
import type { Settings } from '../core/save';
import { AudioSystem } from '../audio/audio';
import { Particles } from '../effects/particles';
import { helicopter, vehicle } from '../world/models';
import { createEnvironment, roadX } from '../world/environment';
import { clamp, damage, canLaunch, multiplier, missionState, missionBonus, starRating, raySphereDistance } from './rules';

interface Enemy { group:T.Group; center:T.Vector3; health:number; maxHealth:number; sam:boolean; cooldown:number; smoke:number; flash:number; alive:boolean }
interface Projectile { mesh:T.Mesh; velocity:T.Vector3; life:number; hostile:boolean; target:Enemy|null; trail:number }
interface Tracer { mesh:T.Mesh; life:number }
export interface Result { success:boolean; score:number; bonus:number; accuracy:number; kills:number; health:number; time:number; stars:number }
export interface TargetInfo { x:number; y:number; visible:boolean; selected:boolean; health:number; distance:number; type:string; radarX:number; radarY:number }
export interface Snapshot {
  health:number; heat:number; overheated:boolean; ammo:number; lock:number; cooldown:number;
  score:number; kills:number; combo:number; seconds:number; speed:number; altitude:number;
  targets:TargetInfo[]; crossX:number; crossY:number; hit:number; damageFlash:number; flare:number;
  notice:string; noticeLife:number; fps:number; drawCalls:number; triangles:number;
}
export class Game {
  scene=new T.Scene();camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,0.5,1800);
  renderer:T.WebGLRenderer; aircraft=helicopter();input:Input;audio=new AudioSystem();particles:Particles;
  enemies:Enemy[]=[];projectiles:Projectile[]=[];tracers:Tracer[]=[];
  state:'menu'|'mission'|'paused'|'ended'='menu';
  health=100;heat=0;overheated=false;ammo=8;lock=0;missileCooldown=0;score=0;kills=0;seconds=180;
  shots=0;hits=0;streak=0;streakTime=0;selected=0;flare=3;flareCooldown=0;
  notice='';noticeLife=0;hit=0;damageFlash=0;
  private velocity=new T.Vector3();private time=0;private fireCooldown=0;private shake=0;
  private desiredCamera=new T.Vector3();private look=new T.Vector3();private ray=new T.Raycaster();
  private temp=new T.Vector3();private aim=new T.Vector3();private source=new T.Vector3();private direction=new T.Vector3();
  private shadow:T.Mesh;private fps=60;private lockBeep=false;private lastTarget=-1;
  private onEnd:(result:Result)=>void;
  constructor(canvas:HTMLCanvasElement, public settings:Settings, pause:()=>void, onEnd:(result:Result)=>void) {
    this.onEnd=onEnd;
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setSize(innerWidth,innerHeight);this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
    const env=createEnvironment(this.scene);this.shadow=env.shadow;
    this.scene.add(this.aircraft.group);this.particles=new Particles(this.scene);
    this.input=new Input(settings,canvas,pause);this.applySettings(settings);
    const projectileGeo=new T.SphereGeometry(0.25,5,4);
    const friendlyMat=new T.MeshBasicMaterial({color:0xeaffb2}),hostileMat=new T.MeshBasicMaterial({color:0xff7751});
    for(let i=0;i<90;i++) {
      const mesh=new T.Mesh(projectileGeo,i<70?hostileMat:friendlyMat);mesh.visible=false;this.scene.add(mesh);
      this.projectiles.push({mesh,velocity:new T.Vector3(),life:0,hostile:i<70,target:null,trail:0});
    }
    for(let i=0;i<16;i++) {
      const mesh=new T.Mesh(new T.BoxGeometry(0.055,0.055,1),new T.MeshBasicMaterial({color:0xffd796,transparent:true,opacity:0.7}));mesh.visible=false;this.scene.add(mesh);this.tracers.push({mesh,life:0});
    }
    for(let i=0;i<6;i++) {
      const sam=i===3||i===5, group=vehicle(sam),z=-95-i*58;
      group.position.set(roadX(z)+(i%2?5:-5),0,z);this.scene.add(group);
      this.enemies.push({group,center:group.position.clone().add(new T.Vector3(0,3,0)),health:sam?145:110,maxHealth:sam?145:110,sam,cooldown:2+i*0.8,smoke:0,flash:0,alive:true});
    }
    window.addEventListener('resize',()=>this.resize());this.menu();
  }
  applySettings(settings:Settings) {
    this.settings=settings;if(this.input)this.input.settings=settings;
    this.audio.setVolume(settings.volume);
    const ratio={low:0.8,medium:1,high:1.5,ultra:2}[settings.quality];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,ratio));
    this.particles.limit={low:120,medium:220,high:340,ultra:440}[settings.quality];
  }
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);}
  menu(){this.state='menu';this.input.enabled=false;this.input.clear();this.audio.flight(false);this.aircraft.group.visible=true;this.clearEffects();}
  start() {
    this.state='mission';this.health=100;this.heat=0;this.overheated=false;this.ammo=8;this.lock=0;this.missileCooldown=0;
    this.score=0;this.kills=0;this.seconds=180;this.shots=0;this.hits=0;this.streak=0;this.streakTime=0;
    this.selected=0;this.lastTarget=-1;this.flare=3;this.flareCooldown=0;this.fireCooldown=0;this.shake=0;this.hit=0;this.damageFlash=0;
    this.velocity.set(0,0,0);this.aircraft.group.position.set(0,26,35);this.aircraft.group.rotation.set(0,0,0);
    this.camera.position.set(0,42,77);this.camera.fov=52;this.camera.updateProjectionMatrix();
    this.enemies.forEach((e,i)=>{e.health=e.maxHealth;e.alive=true;e.group.visible=true;e.group.rotation.set(0,0,0);e.cooldown=3+i*0.8;e.smoke=0;e.flash=0;});
    this.clearEffects();this.input.clear();this.input.mouse.active=false;this.input.mouse.x=0;this.input.mouse.y=0;this.input.enabled=true;
    this.notify('DUSTLINE IS LIVE. CLEAR THE CONVOY.');
    void this.audio.start().then(()=>{if(this.state==='mission')this.audio.flight(true);else this.audio.flight(false);}).catch(()=>{});
  }
  pause(){if(this.state!=='mission')return;this.state='paused';this.input.enabled=false;this.input.clear();this.audio.flight(false);}
  resume(){if(this.state!=='paused')return;this.state='mission';this.input.enabled=true;this.input.clear();this.audio.flight(true);}
  private clearEffects(){this.particles.clear();for(const p of this.projectiles){p.life=0;p.mesh.visible=false;}for(const t of this.tracers){t.life=0;t.mesh.visible=false;}}
  notify(message:string){this.notice=message;this.noticeLife=3;}
  update(dt:number) {
    this.fps+=(1/Math.max(dt,0.001)-this.fps)*0.03;dt=Math.min(dt,0.033);this.time+=dt;
    if(this.state==='menu') {
      this.aircraft.group.position.set(9,18+Math.sin(this.time*0.85)*0.5,0);
      this.aircraft.group.rotation.set(-0.035,0.28+Math.sin(this.time*0.13)*0.12,-0.035);
      this.camera.position.set(34,26,-29);this.camera.lookAt(18,15,4);
      this.aircraft.rotor.rotation.y+=dt*16;this.aircraft.tailRotor.rotation.y+=dt*28;
    }
    if(this.state==='mission')this.simulate(dt);
    if(this.state==='menu'||this.state==='mission') {
      this.shadow.position.x=this.aircraft.group.position.x;this.shadow.position.z=this.aircraft.group.position.z;
      this.particles.update(dt);
    }
    this.renderer.render(this.scene,this.camera);
  }
  private simulate(dt:number) {
    this.seconds=Math.max(0,this.seconds-dt);this.noticeLife-=dt;this.hit=Math.max(0,this.hit-dt);this.damageFlash=Math.max(0,this.damageFlash-dt*1.8);
    this.fireCooldown-=dt;this.missileCooldown=Math.max(0,this.missileCooldown-dt);this.flareCooldown=Math.max(0,this.flareCooldown-dt);this.streakTime-=dt;if(this.streakTime<=0)this.streak=0;
    const k=this.input, p=this.aircraft.group.position,boost=k.held('boost')?1.7:1;
    const x=Number(k.held('right'))-Number(k.held('left')), z=Number(k.held('back'))-Number(k.held('forward')),y=Number(k.held('up'))-Number(k.held('down'));
    const alive=this.enemies.filter(e=>e.alive), ahead=alive.some(e=>e.center.z<p.z-45);
    this.temp.set(x*35*boost,y*18,z*40*boost-(ahead?5:0));this.velocity.lerp(this.temp,1-Math.exp(-dt*4.5));p.addScaledVector(this.velocity,dt);
    p.x=clamp(p.x,-140,140);p.y=clamp(p.y,13,95);p.z=clamp(p.z,-500,75);
    this.aircraft.group.rotation.z=T.MathUtils.lerp(this.aircraft.group.rotation.z,-this.velocity.x*0.009,dt*5);
    this.aircraft.group.rotation.x=T.MathUtils.lerp(this.aircraft.group.rotation.x,this.velocity.z*0.003,dt*5);
    this.aircraft.group.rotation.y=T.MathUtils.lerp(this.aircraft.group.rotation.y,-this.velocity.x*0.004,dt*3);
    this.aircraft.rotor.rotation.y+=dt*42;this.aircraft.tailRotor.rotation.y+=dt*58;
    this.shake=Math.max(0,this.shake-dt*2);
    this.desiredCamera.copy(p).add(this.temp.set(0,13,40));this.camera.position.lerp(this.desiredCamera,1-Math.exp(-dt*5));
    if(!this.settings.reducedShake){this.camera.position.x+=(Math.random()-0.5)*this.shake;this.camera.position.y+=(Math.random()-0.5)*this.shake;}
    this.look.copy(p).add(this.temp.set(this.velocity.x*0.15,-7,-70));this.camera.lookAt(this.look);
    const fov=52+(boost-1)*9;this.camera.fov=T.MathUtils.lerp(this.camera.fov,fov,dt*3);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.aircraft.group.updateMatrixWorld();
    if(k.consume('cycle')){this.cycle();k.mouse.active=false;}
    if(!this.enemies[this.selected]?.alive)this.cycle();
    // Pointer hover acquires a hostile; keyboard cycling retains its selection.
    if(k.mouse.active) {
      let nearest=0.17,index=-1;
      this.enemies.forEach((e,i)=>{if(!e.alive)return;this.temp.copy(e.center).project(this.camera);const d=Math.hypot(this.temp.x-k.mouse.x,this.temp.y-k.mouse.y);if(this.temp.z<1&&this.temp.z>-1&&d<nearest){nearest=d;index=i;}});
      if(index>=0)this.selected=index;
    }
    if(this.selected!==this.lastTarget){this.lock=0;this.lockBeep=false;this.lastTarget=this.selected;}
    const target=this.enemies[this.selected];
    if(target?.alive) {
      this.temp.copy(target.center).project(this.camera);
      const aligned=!k.mouse.active||k.held('fire')||k.held('missile')||Math.hypot(this.temp.x-k.mouse.x,this.temp.y-k.mouse.y)<0.26;
      this.lock=clamp(this.lock+dt*(aligned&&target.center.distanceTo(p)<520?0.85:-1.5),0,1);
      if(this.lock>=1&&!this.lockBeep){this.audio.sound('lock');this.lockBeep=true;}
      if(this.lock<0.5)this.lockBeep=false;
    }
    const firing=k.held('fire')||k.mouse.fire;
    if(firing&&this.fireCooldown<=0&&!this.overheated)this.fireCannon(k.held('fire'));
    this.heat=Math.max(0,this.heat-dt*(firing&&!this.overheated?7:24));
    if(this.overheated&&this.heat<=30){this.overheated=false;this.notify('CANNON READY');}
    if(k.consume('missile')||k.mouse.missile){k.mouse.missile=false;this.launchMissile();}
    if(k.consume('flare'))this.deployFlare();
    this.updateEnemies(dt);this.updateProjectiles(dt);
    for(const t of this.tracers){t.life-=dt;t.mesh.visible=t.life>0;}
    const result=missionState(this.health,this.enemies.filter(e=>e.alive).length,this.seconds);
    if(result!=='active')this.finish(result==='complete');
    k.pressed.clear();
  }
  private cycle(){for(let i=1;i<=this.enemies.length;i++){const index=(this.selected+i)%this.enemies.length;if(this.enemies[index].alive){this.selected=index;return;}}}
  private fireCannon(assist:boolean) {
    this.fireCooldown=0.085;this.heat=clamp(this.heat+4.4,0,100);this.shots++;this.audio.sound('cannon');this.shake=Math.max(this.shake,0.1);
    if(this.heat>=100){this.overheated=true;this.notify('CANNON OVERHEAT — COOLING');}
    this.aircraft.muzzle.getWorldPosition(this.source);
    const target=this.enemies[this.selected];
    if((assist||!this.input.mouse.active)&&target?.alive) {
      this.direction.copy(target.center).sub(this.source).normalize();
      this.ray.ray.set(this.source,this.direction);
    } else {
      this.ray.setFromCamera(new T.Vector2(this.input.mouse.x,this.input.mouse.y),this.camera);
    }
    let struck:Enemy|null=null,nearest=650;
    for(const e of this.enemies) {
      if(!e.alive)continue;
      const d=raySphereDistance(this.ray.ray.origin,this.ray.ray.direction,e.center,e.sam?5.8:5.0);
      if(d!==null&&d<nearest){nearest=d;struck=e;}
    }
    this.aim.copy(this.ray.ray.direction).multiplyScalar(nearest).add(this.ray.ray.origin);
    const tracer=this.tracers.find(t=>t.life<=0);
    if(tracer){tracer.life=0.06;tracer.mesh.position.copy(this.source).lerp(this.aim,0.5);tracer.mesh.scale.z=this.source.distanceTo(this.aim);tracer.mesh.lookAt(this.aim);tracer.mesh.visible=true;}
    this.particles.emit(this.source,2,3);
    if(struck){this.hits++;this.hit=0.12;this.hurtEnemy(struck,17);this.particles.emit(this.aim,5,8);}
  }
  private launchMissile() {
    const target=this.enemies[this.selected];
    if(!target?.alive)return;
    if(!canLaunch(this.ammo,this.missileCooldown,this.lock)) {
      this.notify(this.ammo<=0?'MISSILES DEPLETED':this.missileCooldown>0?'MISSILE RACK CYCLING':'HOLD AIM TO ACQUIRE A LOCK');return;
    }
    const projectile=this.projectiles.find(p=>!p.hostile&&p.life<=0);if(!projectile)return;
    this.ammo--;this.missileCooldown=1.5;this.audio.sound('missile');this.shake=0.35;
    projectile.life=6;projectile.target=target;projectile.mesh.visible=true;projectile.mesh.scale.set(1.4,1.4,4);
    this.aircraft.muzzle.getWorldPosition(projectile.mesh.position);projectile.mesh.position.x+=this.ammo%2?3:-3;projectile.trail=0;
    projectile.velocity.copy(target.center).sub(projectile.mesh.position).normalize().multiplyScalar(150);
    this.notify('MISSILE AWAY');
  }
  private hurtEnemy(enemy:Enemy, amount:number) {
    if(!enemy.alive)return;
    enemy.health=damage(enemy.health,amount);enemy.flash=0.12;
    if(enemy.health>0)return;
    enemy.alive=false;enemy.group.visible=false;this.kills++;this.streak++;this.streakTime=7;
    this.score+=(enemy.sam?1000:500)*multiplier(this.streak);
    this.particles.explosion(enemy.center);this.audio.sound('explosion');this.shake=Math.max(this.shake,0.7);
    this.notify(`${enemy.sam?'SAM SITE':'ARMOR'} NEUTRALIZED  +${(enemy.sam?1000:500)*multiplier(this.streak)}`);
  }
  private updateEnemies(dt:number) {
    const player=this.aircraft.group.position;
    for(const enemy of this.enemies) {
      if(!enemy.alive)continue;
      const distance=enemy.center.distanceTo(player);
      const turret=enemy.group.userData.turret as T.Group;
      turret.rotation.y=Math.atan2(enemy.center.x-player.x,enemy.center.z-player.z);
      enemy.flash=Math.max(0,enemy.flash-dt);enemy.group.scale.setScalar(enemy.flash>0?1.04:1);
      if(enemy.health<enemy.maxHealth*0.45){enemy.smoke-=dt;if(enemy.smoke<=0){this.particles.emit(enemy.center,2,2,true);enemy.smoke=0.16;}}
      enemy.cooldown-=dt;
      if(distance<340&&enemy.cooldown<=0) {
        enemy.cooldown=enemy.sam?3.5:2.8;
        const bullet=this.projectiles.find(p=>p.hostile&&p.life<=0);if(!bullet)continue;
        bullet.mesh.position.copy(enemy.center);bullet.mesh.position.y+=2;
        this.temp.copy(player).addScaledVector(this.velocity,Math.min(0.35,distance/220));
        bullet.velocity.copy(this.temp).sub(bullet.mesh.position).normalize().multiplyScalar(enemy.sam?65:78);
        bullet.life=6;bullet.target=enemy;bullet.mesh.visible=true;bullet.mesh.scale.setScalar(enemy.sam?2:1.5);bullet.trail=0;
        this.particles.emit(bullet.mesh.position,4,4);
      }
    }
  }
  private updateProjectiles(dt:number) {
    for(const p of this.projectiles) {
      if(p.life<=0)continue;p.life-=dt;
      if(!p.hostile&&p.target?.alive)p.velocity.copy(p.target.center).sub(p.mesh.position).normalize().multiplyScalar(155);
      p.mesh.position.addScaledVector(p.velocity,dt);
      p.mesh.lookAt(this.temp.copy(p.mesh.position).add(p.velocity));
      p.trail-=dt;if(p.trail<=0){this.particles.emit(p.mesh.position,1,1,!p.hostile);p.trail=p.hostile?0.09:0.04;}
      if(p.hostile&&p.mesh.position.distanceToSquared(this.aircraft.group.position)<16) {
        const amount=p.target?.sam?11:7;this.health=damage(this.health,amount);this.damageFlash=0.65;this.shake=0.5;p.life=0;
        this.particles.emit(p.mesh.position,10,8);this.audio.sound('hit');if(this.health<30)this.notify('CRITICAL DAMAGE — EVADE INCOMING FIRE');
      }
      if(!p.hostile&&p.target?.alive&&p.mesh.position.distanceToSquared(p.target.center)<36){this.hurtEnemy(p.target,105);this.particles.explosion(p.mesh.position);this.audio.sound('explosion');p.life=0;}
      if(p.mesh.position.y<0||p.life<=0){p.life=0;p.mesh.visible=false;}
    }
  }
  private deployFlare() {
    if(this.flare<=0){this.notify('COUNTERMEASURES DEPLETED');return;}
    if(this.flareCooldown>0){this.notify('COUNTERMEASURES RECHARGING');return;}
    this.flare--;this.flareCooldown=3;this.audio.sound('flare');this.particles.emit(this.aircraft.group.position,35,35);
    for(const p of this.projectiles)if(p.hostile&&p.life>0&&p.mesh.position.distanceTo(this.aircraft.group.position)<130){p.life=0;p.mesh.visible=false;}
    this.notify('COUNTERMEASURES DEPLOYED');
  }
  private finish(success:boolean) {
    this.state='ended';this.input.enabled=false;this.input.clear();this.audio.flight(false);
    const bonus=success?missionBonus(this.health,this.seconds):0,accuracy=this.shots?this.hits/this.shots:0;
    this.onEnd({success,score:this.score+bonus,bonus,accuracy,kills:this.kills,health:this.health,time:180-this.seconds,stars:success?starRating(this.health,accuracy):0});
  }
  snapshot():Snapshot {
    const player=this.aircraft.group.position;
    const targets=this.enemies.map((e,i)=>{
      this.temp.copy(e.center).project(this.camera);
      return {x:(this.temp.x*0.5+0.5)*innerWidth,y:(-this.temp.y*0.5+0.5)*innerHeight,visible:e.alive&&this.temp.z<1&&this.temp.z>-1,selected:i===this.selected,health:e.health/e.maxHealth,distance:Math.round(e.center.distanceTo(player)),type:e.sam?'SPECTER / SAM':'ATLAS / ARMOR',radarX:clamp((e.center.x-player.x)/4,-37,37),radarY:clamp((e.center.z-player.z)/9,-37,37)};
    });
    let crossX=(this.input.mouse.x*0.5+0.5)*innerWidth,crossY=(-this.input.mouse.y*0.5+0.5)*innerHeight;
    if(!this.input.mouse.active||this.input.held('fire')){const target=targets[this.selected];if(target?.visible){crossX=target.x;crossY=target.y;}}
    return {health:this.health,heat:this.heat,overheated:this.overheated,ammo:this.ammo,lock:this.lock,cooldown:this.missileCooldown,score:this.score,kills:this.kills,combo:multiplier(this.streak),seconds:this.seconds,speed:Math.round(this.velocity.length()*3.6),altitude:Math.round(player.y),targets,crossX,crossY,hit:this.hit,damageFlash:this.damageFlash,flare:this.flare,notice:this.notice,noticeLife:this.noticeLife,fps:Math.round(this.fps),drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles};
  }
}
