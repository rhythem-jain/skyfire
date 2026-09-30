import './style.css';
import { Game } from './game/game';
import { loadSave, persist } from './core/save';
import { UI } from './ui/ui';

const canvas=document.querySelector<HTMLCanvasElement>('#world')!;
const root=document.querySelector<HTMLElement>('#ui')!;
const save=loadSave();
if(matchMedia('(prefers-reduced-motion: reduce)').matches)save.settings.reducedShake=true;
let game:Game,ui:UI,settingsOpen=false,menuModal=false,failed=false;
const error=(title:string,description:string)=>{
  failed=true;game?.pause();root.className='';root.innerHTML='';
  const panel=document.createElement('div');panel.className='error-screen';
  const heading=document.createElement('h1');heading.textContent=title;
  const message=document.createElement('p');message.textContent=description;
  const button=document.createElement('button');button.textContent='RELOAD SKYFIRE';button.onclick=()=>location.reload();
  panel.append(heading,message,button);root.append(panel);
};
function pause(){if(game?.state==='mission'){game.pause();ui.pause();}}
function closeSettings(){settingsOpen=false;ui.closeModal();if(game.state==='paused')ui.pause();}
function action(name:string) {
  switch(name){
    case 'deploy':settingsOpen=false;menuModal=false;ui.closeModal();ui.mission();game.start();break;
    case 'pause':pause();break;
    case 'resume':ui.closeModal();ui.mission();game.resume();break;
    case 'quit':settingsOpen=false;menuModal=false;ui.closeModal();game.menu();ui.menu();break;
    case 'settings':if(game.state==='mission')game.pause();settingsOpen=true;ui.settings();break;
    case 'close-settings':closeSettings();break;
    case 'save-settings':save.settings=ui.readSettings();game.applySettings(save.settings);const stored=persist(save);closeSettings();if(!stored)game.notify('STORAGE UNAVAILABLE — SETTINGS APPLY TO THIS SESSION');break;
    case 'briefing':menuModal=true;ui.briefing();break;
    case 'campaign':menuModal=true;ui.campaign();break;
    case 'manual':menuModal=true;ui.manual();break;
    case 'credits':menuModal=true;ui.credits();break;
    case 'home':case 'close':menuModal=false;ui.closeModal();break;
  }
}
try {
  ui=new UI(root,save,action);
  game=new Game(canvas,save.settings,pause,result=>{
    save.best=Math.max(save.best,result.score);save.sorties++;const stored=persist(save);
    ui.update(game.snapshot());ui.result(result,save.best,stored);
  });
  ui.menu();
  let last=performance.now(),hudClock=0;
  const frame=(now:number)=>{
    if(failed)return;
    const dt=(now-last)/1000;last=now;game.update(dt);hudClock+=dt;
    if(game.state==='mission'&&hudClock>=1/30){ui.update(game.snapshot());hudClock=0;}
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // Capture Escape before the input handler so a single press cannot pause and resume.
  window.addEventListener('keydown',e=>{
    if(e.code!=='Escape'||e.repeat)return;
    if(ui.capturingBinding)return;
    if(settingsOpen){e.preventDefault();e.stopImmediatePropagation();closeSettings();}
    else if(game.state==='paused'){e.preventDefault();e.stopImmediatePropagation();action('resume');}
    else if(game.state==='menu'&&menuModal){e.preventDefault();e.stopImmediatePropagation();action('close');}
  },true);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();error('Graphics connection lost.','Your browser lost its WebGL context. Close GPU-heavy tabs, then reload. Your saved settings and best score are safe.');});
} catch(err) {
  console.error(err);
  error('Unable to start the flight engine.','SKYFIRE needs WebGL 2 and hardware acceleration. Enable graphics acceleration in your browser or try a current version of Chrome, Edge or Firefox.');
}
