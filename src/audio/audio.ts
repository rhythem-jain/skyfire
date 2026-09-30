export class AudioSystem {
  context:AudioContext|null=null; master:GainNode|null=null; rotor:GainNode|null=null;
  noise:AudioBuffer|null=null; volume=0.45;
  async start() {
    if(!this.context) {
      const ctx=this.context=new AudioContext();this.master=ctx.createGain();this.master.connect(ctx.destination);
      this.noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=this.noise.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      this.rotor=ctx.createGain();this.rotor.gain.value=0;this.rotor.connect(this.master);
      for(const frequency of [31,63,126]) {
        const osc=ctx.createOscillator();osc.type='triangle';osc.frequency.value=frequency;osc.connect(this.rotor);osc.start();
      }
      const lfo=ctx.createOscillator(), depth=ctx.createGain();lfo.frequency.value=17;depth.gain.value=0.025;lfo.connect(depth);depth.connect(this.rotor.gain);lfo.start();
    }
    await this.context.resume();this.setVolume(this.volume);
  }
  setVolume(value:number) { this.volume=value;if(this.master&&this.context)this.master.gain.setTargetAtTime(value,this.context.currentTime,0.08); }
  flight(active:boolean) {
    if(!this.context)return;
    if(active){void this.context.resume().catch(()=>{});this.rotor?.gain.setTargetAtTime(0.055,this.context.currentTime,0.15);}
    else {this.rotor?.gain.setTargetAtTime(0,this.context.currentTime,0.03);void this.context.suspend().catch(()=>{});}
  }
  sound(type:'cannon'|'missile'|'explosion'|'hit'|'lock'|'flare') {
    const ctx=this.context;if(!ctx||!this.master||!this.noise||ctx.state!=='running')return;
    const t=ctx.currentTime, gain=ctx.createGain(), filter=ctx.createBiquadFilter();
    const duration=type==='explosion'?1.05:type==='missile'?0.5:0.09;
    const noise=ctx.createBufferSource();noise.buffer=this.noise;filter.type='lowpass';filter.frequency.value=type==='explosion'?650:type==='cannon'?2200:1100;
    gain.gain.setValueAtTime(type==='explosion'?0.5:type==='cannon'?0.17:0.13,t);gain.gain.exponentialRampToValueAtTime(0.001,t+duration);
    noise.connect(filter);filter.connect(gain);gain.connect(this.master);noise.start(t);noise.stop(t+duration);
    noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect();};
    if(type==='explosion'||type==='lock'||type==='missile') {
      const osc=ctx.createOscillator(), g=ctx.createGain();osc.type=type==='lock'?'sine':'triangle';osc.frequency.setValueAtTime(type==='lock'?800:160,t);osc.frequency.exponentialRampToValueAtTime(type==='lock'?1000:35,t+duration);g.gain.setValueAtTime(0.15,t);g.gain.exponentialRampToValueAtTime(0.001,t+duration);osc.connect(g);g.connect(this.master);osc.start(t);osc.stop(t+duration);osc.onended=()=>{osc.disconnect();g.disconnect();};
    }
  }
}
