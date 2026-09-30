import type { Save, Action } from '../core/save';
import type { Snapshot, Result } from '../game/game';

const mark=`<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m20 3 5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" fill="currentColor"/><path d="M20 12v16M12 20h16" stroke="#141b18" stroke-width="2.5"/></svg>`;
const arrow=`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>`;
const gear=`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 3-1 3-3 1-2 4 2 2 1 4 4 2 2-2 4-1 2-4-2-2-1-4-4-2-2 1Z" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="11" r="3" stroke="currentColor" stroke-width="1.4"/></svg>`;
const terrain=`<svg class="topo" viewBox="0 0 200 100" fill="none" aria-hidden="true"><g stroke="currentColor" opacity=".45"><path d="M-10 80C40 20 60 150 115 65S170 0 220 15M-10 65C40 5 60 135 115 50S170-15 220 0M-10 95C40 35 60 165 115 80S170 15 220 30M-10 50C40-10 60 120 115 35S170-30 220-15M-10 35C40-25 60 105 115 20S170-45 220-30M-10 20C40-40 60 90 115 5S170-60 220-45"/></g><path d="m18 75 37-18 34 9 29-30 46-13" stroke="#f9b366" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="118" cy="36" r="8" stroke="#f9b366"/><circle cx="118" cy="36" r="2" fill="#f9b366"/></svg>`;
export const keyLabel=(code:string) => code.replace('Key','').replace('Digit','').replace('Left','').replace('Right','').replace('Arrow','');
export class UI {
  private refs:Record<string,HTMLElement>={};private markers:HTMLElement[]=[];private radarDots:HTMLElement[]=[];
  private modal:HTMLElement|null=null;
  private pendingBindings:Save['settings']['bindings']|null=null;
  private stopCapture:(()=>void)|null=null;
  get capturingBinding(){return this.stopCapture!==null;}
  constructor(private root:HTMLElement, public save:Save, public action:(name:string)=>void) {
    root.addEventListener('click',e=>{const button=(e.target as Element).closest<HTMLElement>('[data-action]');if(!button||button.hasAttribute('disabled'))return;const name=button.dataset.action!;if(name.startsWith('rebind:'))this.rebind(name.slice(7) as Action,button);else this.action(name);});
    root.addEventListener('keydown',e=>{
      if(e.key!=='Tab'||!this.modal?.firstChild)return;
      const focusable=Array.from(this.modal.querySelectorAll<HTMLElement>('button, input, select, a[href]')).filter(el=>!el.hasAttribute('disabled'));
      const first=focusable[0],last=focusable.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    });
  }
  menu() {
    this.root.className='menu-ui';
    this.root.innerHTML=`<div class="menu-shade"></div><div class="grain"></div>
      <header class="topbar"><a class="brand" href="#" aria-label="Skyfire home">${mark}<span>SKYFIRE<span class="brand-small">TACTICAL FLIGHT DIVISION</span></span></a>
      <nav aria-label="Main navigation"><button class="nav-link active" data-action="home">OPERATIONS</button><button class="nav-link" data-action="campaign">CAMPAIGN <span class="nav-count">01 / 10</span></button><button class="nav-link" data-action="manual">FIELD MANUAL</button></nav>
      <div class="top-tools"><span class="online"><i></i> SYSTEMS ONLINE</span><button class="icon-button" data-action="settings" aria-label="Settings">${gear}</button></div></header>
      <main class="hero"><div class="eyebrow"><span class="tiny-line"></span> AN ORIGINAL AIR COMBAT EXPERIENCE</div>
      <h1>SKYFIRE<span>BLACK HORIZON</span></h1><div class="hero-rule"><span>EST. 2049</span><span>INDEPENDENT FLIGHT WING</span></div>
      <h2>Own the sky.<br>Change the battlefield.</h2><p class="hero-copy">One pilot. No second chances.<br>Take the Kestrel into hostile territory and<br class="wide-only"> break the blockade from above.</p>
      <button class="deploy-button" data-action="deploy"><span><small>OPERATION 01</small>DEPLOY TO COMBAT</span><span class="button-arrow">${arrow}</span></button>
      <div class="deploy-note"><span class="status-dot"></span> READY FOR TAKEOFF <span class="dot-divider">/</span> NO DOWNLOAD REQUIRED</div></main>
      <aside class="aircraft-tag"><span class="tag-line"></span><div><span class="eyebrow">YOUR AIRCRAFT</span><strong>VX–9 KESTREL</strong><span class="tag-sub">ATTACK HELICOPTER <b>MK. IV</b></span></div></aside>
      <div class="coordinates">28° 14′ 09″ N &nbsp; 043° 37′ 21″ E <span>SAFFRON REACH / 06:40 LOCAL</span></div>
      <section class="operation-strip" aria-label="Mission briefing"><div class="mission-map">${terrain}<span>AO / 07</span></div><div class="mission-summary"><span class="eyebrow orange">ACTIVE OPERATION <i class="status-dot"></i></span><h3>Operation Dustline</h3><p>Intercept the convoy. Leave nothing moving.</p></div><div class="operation-stat"><span class="eyebrow">THREAT LEVEL</span><strong><i class="threat-bar lit"></i><i class="threat-bar lit"></i><i class="threat-bar lit"></i><i class="threat-bar"></i><i class="threat-bar"></i> <em>MODERATE</em></strong><span class="stat-sub">6 HOSTILE CONTACTS</span></div><div class="operation-stat terrain-stat"><span class="eyebrow">COMBAT ZONE</span><strong>SAFFRON REACH</strong><span class="stat-sub">DESERT / CLEAR SKIES</span></div><button class="brief-button" data-action="briefing" aria-label="View mission briefing">MISSION BRIEF ${arrow}</button></section>
      <footer class="menu-footer"><span>© 2026 SKYFIRE <i>/</i> ORIGINAL BROWSER COMBAT</span><button data-action="credits">CREDITS & INFO</button><span class="build-tag">WEBGL 2.0 <i>•</i> V0.1 / FIRST PLAYABLE</span></footer><div id="modal"></div>`;
    this.modal=this.root.querySelector('#modal');
  }
  mission() {
    this.root.className='mission-ui';
    const b=this.save.settings.bindings;
    this.root.innerHTML=`<div class="vignette"></div><div id="damage-screen"></div>
      <header class="hud-top"><div class="hud-mission"><span class="mini-mark">${mark}</span><div><span class="eyebrow">OPERATION 01 / LIVE</span><strong>DUSTLINE</strong></div></div><div class="heading"><span>NW</span><i></i><span>330</span><i></i><strong>N</strong><i></i><span>030</span><i></i><span>NE</span></div><button class="hud-pause" data-action="pause" aria-label="Pause mission">Ⅱ <span>ESC</span></button></header>
      <section class="objective"><span class="eyebrow">PRIMARY OBJECTIVE</span><h2>Neutralize the convoy</h2><div class="objective-progress"><span id="objective-count">0 / 6</span><span>HOSTILES DESTROYED</span></div><div class="objective-track"><i id="objective-bar"></i></div></section>
      <div class="score-box"><span class="eyebrow">MISSION SCORE</span><strong id="score">000000</strong><span id="combo">ENGAGE HOSTILE CONTACTS</span></div>
      <div class="radar"><div class="radar-circle"><div class="radar-sweep"></div><span class="radar-n">N</span><span class="radar-player">▲</span>${Array.from({length:6},(_,i)=>`<i id="radar-${i}"></i>`).join('')}</div><span>TACTICAL RADAR / 700 M</span></div>
      <div id="targets">${Array.from({length:6},(_,i)=>`<div class="target" id="target-${i}"><span class="target-label"></span><div class="target-box"><i></i></div><div class="target-hp"><i></i></div><span class="target-range"></span></div>`).join('')}</div>
      <div id="crosshair"><span></span><i></i><b></b><em></em><div id="hit-marker">×</div></div>
      <div class="lock-readout"><span id="lock-label">ACQUIRING TARGET</span><div><i id="lock-bar"></i></div></div>
      <div class="notice" id="notice"></div>
      <section class="health-panel"><div class="panel-label"><span class="eyebrow">VX–9 / AIRFRAME</span><span id="health-state">NOMINAL</span></div><div class="health-value"><strong id="health">100</strong><span>%<small>HULL INTEGRITY</small></span></div><div class="health-track"><i id="health-bar"></i></div><div class="flight-stats"><span>ALT <b id="altitude">26</b> M</span><span>SPD <b id="speed">0</b> KM/H</span></div></section>
      <div class="center-telemetry"><span class="eyebrow">TIME REMAINING</span><strong id="timer">03:00</strong><div class="control-help"><span><kbd>${keyLabel(b.forward)}${keyLabel(b.left)}${keyLabel(b.back)}${keyLabel(b.right)}</kbd> FLY</span><span><kbd>${keyLabel(b.down)}/${keyLabel(b.up)}</kbd> ALTITUDE</span><span><kbd>${keyLabel(b.fire)}</kbd> AIM + FIRE</span><span><kbd>${keyLabel(b.cycle)}</kbd> TARGET</span></div></div>
      <section class="weapons-panel"><div class="weapon-row"><span class="weapon-icon">⫸</span><div><span class="eyebrow">M230 AUTOCANNON</span><strong id="cannon-status">READY <small>LMB / ${keyLabel(b.fire)}</small></strong></div><span class="ammo-infinite">∞</span></div><div class="heat-track"><i id="heat-bar"></i></div><div class="secondary-weapons"><div><span class="eyebrow">GUIDED MISSILES</span><strong><span id="ammo">08</span> <small>RMB / ${keyLabel(b.missile)}</small></strong></div><div><span class="eyebrow">COUNTERMEASURES</span><strong><span id="flares">03</span> <small>${keyLabel(b.flare)}</small></strong></div></div></section>
      <div id="debug" hidden></div><div id="modal"></div>`;
    this.refs={};this.root.querySelectorAll<HTMLElement>('[id]').forEach(el=>this.refs[el.id]=el);
    this.markers=Array.from({length:6},(_,i)=>this.refs[`target-${i}`]);this.radarDots=Array.from({length:6},(_,i)=>this.refs[`radar-${i}`]);this.modal=this.refs.modal;
  }
  update(s:Snapshot) {
    if(!this.refs.health)return;
    const text=(id:string,value:string)=>{if(this.refs[id].textContent!==value)this.refs[id].textContent=value;};
    text('score',String(s.score).padStart(6,'0'));text('health',String(Math.ceil(s.health)));text('health-state',s.health<30?'CRITICAL':s.health<65?'DAMAGED':'NOMINAL');
    text('objective-count',`${s.kills} / 6`);text('combo',s.combo>1?`DESTRUCTION STREAK ×${s.combo}`:'ENGAGE HOSTILE CONTACTS');
    text('speed',String(s.speed));text('altitude',String(s.altitude));text('ammo',String(s.ammo).padStart(2,'0'));text('flares',String(s.flare).padStart(2,'0'));
    const seconds=Math.ceil(s.seconds);text('timer',`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`);
    text('lock-label',s.lock>=1?(s.cooldown>0?'MISSILE RACK CYCLING':'TARGET LOCKED / MISSILE READY'):'ACQUIRING TARGET');
    this.refs['lock-label'].classList.toggle('locked',s.lock>=1);
    this.refs['cannon-status'].firstChild!.textContent=s.overheated?'COOLING ':'READY ';
    this.refs['health-bar'].style.width=`${s.health}%`;this.refs['health-bar'].classList.toggle('critical',s.health<30);
    this.refs['heat-bar'].style.width=`${s.heat}%`;this.refs['heat-bar'].classList.toggle('critical',s.overheated);
    this.refs['lock-bar'].style.width=`${s.lock*100}%`;this.refs['objective-bar'].style.width=`${s.kills/6*100}%`;
    this.refs.crosshair.style.transform=`translate(${s.crossX}px, ${s.crossY}px)`;
    this.refs['hit-marker'].style.opacity=s.hit>0?'1':'0';this.refs['damage-screen'].style.opacity=String(s.damageFlash);
    text('notice',s.notice);this.refs.notice.classList.toggle('show',s.noticeLife>0);
    s.targets.forEach((t,i)=>{
      const marker=this.markers[i];marker.hidden=!t.visible||t.health<=0;marker.classList.toggle('selected',t.selected);
      marker.style.transform=`translate(${t.x}px,${t.y}px)`;
      marker.querySelector('.target-label')!.textContent=t.type;
      marker.querySelector('.target-range')!.textContent=`${t.distance} M`;
      (marker.querySelector('.target-hp i') as HTMLElement).style.width=`${t.health*100}%`;
      this.radarDots[i].style.transform=`translate(${t.radarX}px,${t.radarY}px)`;this.radarDots[i].hidden=t.health<=0;
    });
    if(new URLSearchParams(location.search).get('debug')==='1'){this.refs.debug.hidden=false;text('debug',`${s.fps} FPS · ${s.drawCalls} DRAWS · ${s.triangles.toLocaleString()} TRIANGLES`);}
  }
  private showModal(content:string, wide=false) {
    if(!this.modal)return;
    this.modal.innerHTML=`<div class="modal-backdrop"><section class="modal-card ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${content}</section></div>`;
    this.modal.querySelector<HTMLElement>('button, select, input')?.focus();
  }
  closeModal(){this.stopCapture?.();this.stopCapture=null;if(this.modal)this.modal.innerHTML='';}
  pause() {this.showModal(`<div class="eyebrow orange">FLIGHT SUSPENDED</div><h2 id="modal-title">Holding position.</h2><p>Take a breath. The battlefield can wait.</p><div class="modal-actions"><button class="primary" data-action="resume">RESUME FLIGHT ${arrow}</button><button class="secondary" data-action="settings">SETTINGS</button><button class="text-button" data-action="quit">ABORT TO MAIN MENU</button></div>`);}
  result(result:Result,best:number,saved:boolean) {
    this.showModal(`<div class="eyebrow ${result.success?'mint':'orange'}">${result.success?'ALL HOSTILES NEUTRALIZED':'AIRCRAFT LOST / MISSION ENDED'}</div><div class="result-stars">${'★'.repeat(result.stars)}<span>${'☆'.repeat(3-result.stars)}</span></div><h2 id="modal-title">${result.success?'Airspace secured.':'End of the line.'}</h2><p>${result.success?'Dustline is clear. Bring the Kestrel home.':'Regroup. Rearm. Take back the sky.'}</p><div class="result-score"><span class="eyebrow">TOTAL MISSION SCORE</span><strong>${result.score.toLocaleString()}</strong><span>PERSONAL BEST ${best.toLocaleString()}</span></div><div class="result-grid"><div><span>CONTACTS DESTROYED</span><strong>${result.kills} / 6</strong></div><div><span>CANNON ACCURACY</span><strong>${Math.round(result.accuracy*100)}%</strong></div><div><span>HULL REMAINING</span><strong>${Math.ceil(result.health)}%</strong></div><div><span>TIME + SURVIVAL BONUS</span><strong>+${result.bonus.toLocaleString()}</strong></div></div>${!saved?'<p class="orange">Local save unavailable. Your score is kept for this session only.</p>':''}<div class="modal-actions"><button class="primary" data-action="deploy">FLY ANOTHER SORTIE ${arrow}</button><button class="text-button" data-action="quit">RETURN TO OPERATIONS</button></div>`);}
  settings() {
    const s=this.save.settings;this.pendingBindings={...s.bindings};
    const labels:Record<Action,string>={forward:'Forward',back:'Reverse',left:'Strafe left',right:'Strafe right',up:'Ascend',down:'Descend',boost:'Boost',fire:'Aim + cannon',missile:'Missile',cycle:'Cycle target',flare:'Countermeasure'};
    this.showModal(`<div class="modal-top"><span class="eyebrow orange">FLIGHT CONFIGURATION</span><button class="close-button" data-action="close-settings" aria-label="Close settings">×</button></div><h2 id="modal-title">Make it yours.</h2><div class="settings-columns"><div><h3 class="section-label">PRESENTATION</h3><label class="setting-field">Graphics quality<select id="quality">${['low','medium','high','ultra'].map(q=>`<option ${s.quality===q?'selected':''} value="${q}">${q.toUpperCase()}</option>`).join('')}</select></label><p class="field-help">Adjusts render resolution and particle budget. No expensive shadow maps or postprocessing.</p><label class="setting-field">Master volume <output id="volume-value">${Math.round(s.volume*100)}%</output><input id="volume" type="range" min="0" max="1" step="0.05" value="${s.volume}" /></label><label class="setting-field">Aim sensitivity <output id="sensitivity-value">${s.sensitivity.toFixed(1)}×</output><input id="sensitivity" type="range" min="0.4" max="2" step="0.1" value="${s.sensitivity}" /></label><label class="check-field"><input id="invert" type="checkbox" ${s.invertY?'checked':''}/> Invert vertical aim</label><label class="check-field"><input id="shake" type="checkbox" ${s.reducedShake?'checked':''}/> Reduced camera shake</label></div><div><h3 class="section-label">KEYBOARD BINDINGS</h3><p class="field-help">Select a key, then press its replacement. Esc cancels.</p><div class="bindings">${(Object.keys(labels) as Action[]).map(a=>`<div><span>${labels[a]}</span><button class="key-button" data-action="rebind:${a}" aria-label="Rebind ${labels[a]}">${keyLabel(s.bindings[a])}</button></div>`).join('')}</div><p class="field-help" id="binding-help">Mouse: left click cannon · right click missile.</p></div></div><button class="primary" data-action="save-settings">SAVE CONFIGURATION ${arrow}</button>`,true);
    for(const id of ['volume','sensitivity'])this.modal!.querySelector<HTMLInputElement>(`#${id}`)!.addEventListener('input',e=>{
      const value=Number((e.target as HTMLInputElement).value);this.modal!.querySelector(`#${id}-value`)!.textContent=id==='volume'?`${Math.round(value*100)}%`:`${value.toFixed(1)}×`;
    });
  }
  private rebind(action:Action,button:HTMLElement) {
    this.stopCapture?.();const old=button.textContent;button.textContent='PRESS KEY';
    const cancel=()=>{window.removeEventListener('keydown',capture,true);button.textContent=old;this.stopCapture=null;};
    const capture=(e:KeyboardEvent)=>{
      e.preventDefault();e.stopImmediatePropagation();
      if(e.code==='Escape'){cancel();return;}
      if(!/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|Shift(Left|Right)|Space|Tab)$/.test(e.code))return;
      if(Object.entries(this.pendingBindings!).some(([key,value])=>key!==action&&value===e.code)){
        this.modal!.querySelector('#binding-help')!.textContent='That key is already assigned. Choose another.';return;
      }
      this.pendingBindings![action]=e.code;cancel();button.textContent=keyLabel(e.code);this.stopCapture=null;
      this.modal!.querySelector('#binding-help')!.textContent='Binding updated. Save configuration to apply.';
    };
    this.stopCapture=cancel;window.addEventListener('keydown',capture,true);
  }
  readSettings() {
    const get=<T extends HTMLElement>(id:string)=>this.modal!.querySelector<T>(`#${id}`)!;
    return {...this.save.settings,quality:get<HTMLSelectElement>('quality').value as Save['settings']['quality'],volume:Number(get<HTMLInputElement>('volume').value),sensitivity:Number(get<HTMLInputElement>('sensitivity').value),invertY:get<HTMLInputElement>('invert').checked,reducedShake:get<HTMLInputElement>('shake').checked,bindings:{...this.pendingBindings!}};
  }
  briefing() {this.showModal(`<div class="modal-top"><span class="eyebrow orange">OPERATION 01 / MISSION BRIEF</span><button class="close-button" data-action="close" aria-label="Close briefing">×</button></div><h2 id="modal-title">Operation Dustline</h2><div class="brief-map">${terrain}<span>SAFFRON REACH / SECTOR 07</span></div><p>A Directorate convoy has blocked the southern supply route. Take the VX–9 through the canyon and neutralize all six armor and SAM contacts.</p><div class="brief-facts"><div><span>OBJECTIVE</span><strong>DESTROY 6 HOSTILES</strong></div><div><span>WINDOW</span><strong>03:00 MINUTES</strong></div><div><span>LOADOUT</span><strong>CANNON + 8 MISSILES</strong></div></div><p class="field-help">Use lateral movement to dodge incoming tracers. Hold aim for a missile lock. Countermeasures clear incoming fire within 130 meters.</p><button class="primary" data-action="deploy">ACCEPT & DEPLOY ${arrow}</button>`);}
  campaign() {this.showModal(`<div class="modal-top"><span class="eyebrow orange">CAMPAIGN / DEVELOPMENT PREVIEW</span><button class="close-button" data-action="close" aria-label="Close campaign">×</button></div><h2 id="modal-title">A darker horizon.</h2><p>One mission is playable in this build. The rest of the campaign is on the flight plan.</p><button class="campaign-active" data-action="briefing"><span>01</span><div><strong>Operation Dustline</strong><small>SAFFRON REACH · PLAYABLE NOW</small></div>${arrow}</button><div class="planned-missions">${['Desert Fire','Blackout','Iron Road','SAM Hunter','Night Raid','Storm Front','Air Superiority','Fortress','Black Horizon'].map((m,i)=>`<div><span>${String(i+2).padStart(2,'0')}</span><strong>${m}</strong><small>PLANNED</small></div>`).join('')}</div>`);}
  manual() {
    const b=this.save.settings.bindings;
    this.showModal(`<div class="modal-top"><span class="eyebrow orange">KESTREL / FIELD MANUAL</span><button class="close-button" data-action="close" aria-label="Close field manual">×</button></div><h2 id="modal-title">Fly. Lock. Eliminate.</h2><div class="manual-list"><div><b>01</b><section><h3>Stay moving.</h3><p>${keyLabel(b.forward)}/${keyLabel(b.back)} forward and reverse. ${keyLabel(b.left)}/${keyLabel(b.right)} strafe. ${keyLabel(b.down)}/${keyLabel(b.up)} altitude. ${keyLabel(b.boost)} boosts. The aircraft drifts forward when targets are ahead.</p></section></div><div><b>02</b><section><h3>Make every shot count.</h3><p>Move your mouse to aim, hold left click to fire. Right click launches a missile after lock. Watch cannon heat and missile cooldown.</p></section></div><div><b>03</b><section><h3>Keyboard pilot? Covered.</h3><p>${keyLabel(b.cycle)} cycles targets and activates aim assist. Hold ${keyLabel(b.fire)} to aim and fire at the selected target. ${keyLabel(b.missile)} launches a locked missile. ${keyLabel(b.flare)} clears nearby enemy fire.</p></section></div></div><p class="field-help">Escape pauses. Changing tabs automatically pauses. Destroy all six contacts before the timer expires.</p><button class="primary" data-action="deploy">READY FOR TAKEOFF ${arrow}</button>`);
  }
  credits() {this.showModal(`<div class="modal-top"><span class="eyebrow orange">INDEPENDENT FLIGHT WING</span><button class="close-button" data-action="close" aria-label="Close credits">×</button></div><h2 id="modal-title">Original by design.</h2><p>SKYFIRE: BLACK HORIZON is an original arcade combat prototype built with TypeScript, Three.js and Web Audio.</p><p>All aircraft, vehicles, landscapes and effects are procedural. Audio is synthesized. No assets or branding from commercial games are used.</p><div class="info-box"><span class="eyebrow">FIRST PLAYABLE / V0.1</span><p>One mission. No accounts, downloads or purchases. Best score and settings stay in this browser.</p><strong>PERSONAL BEST: ${this.save.best.toLocaleString()}</strong></div><button class="primary" data-action="close">BACK TO OPERATIONS ${arrow}</button>`);}
}
