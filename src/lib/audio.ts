export class AudioPlayer {
  ctx: AudioContext | null = null;
  isPlaying = false;
  bpm = 120;
  nextNoteTime = 0;
  currentNoteIndex = 0;
  pitches: number[] = [];
  scheduleAheadTime = 0.1;
  lookahead = 25.0;
  timerID: number | null = null;
  onStopCallback: (() => void) | null = null;
  onNotePlayCallback: ((index: number | null) => void) | null = null;
  basePitchesLength = 0;
  instrument: 'bass4' | 'guitar6' | 'piano' = 'bass4';

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMetronomeClick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    
    // Accent on the first beat
    osc.frequency.value = this.currentNoteIndex === 0 ? 1000 : 800;
    osc.type = 'sine';
    
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.1, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.connect(env);
    env.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  playNote(pitchIndex: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    
    const midiNote = pitchIndex + 28;
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    if (this.instrument === 'bass4') {
      osc.type = 'triangle';
      osc2.type = 'sine';
      osc2.frequency.value = freq;
    } else if (this.instrument === 'piano') {
      osc.type = 'sine';
      osc2.type = 'triangle';
      osc2.frequency.value = freq;
    } else {
      osc.type = 'sawtooth';
      osc2.type = 'sine';
      osc2.frequency.value = freq / 2; // Sub frequency
      
      // Filter for guitar to make it less harsh
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      env.connect(filter);
      filter.connect(this.ctx.destination);
    }
    
    osc.frequency.value = freq;
    
    env.gain.setValueAtTime(0, time);
    if (this.instrument === 'bass4') {
        env.gain.linearRampToValueAtTime(1.0, time + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, time + duration);
    } else if (this.instrument === 'piano') {
        env.gain.linearRampToValueAtTime(0.9, time + 0.015);
        env.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.5);
    } else {
        env.gain.linearRampToValueAtTime(0.8, time + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.8);
    }
    
    osc.connect(env);
    osc2.connect(env);
    if (this.instrument === 'bass4' || this.instrument === 'piano') {
      env.connect(this.ctx.destination);
    }
    
    osc.start(time);
    osc2.start(time);
    osc.stop(time + (this.instrument === 'piano' ? duration * 1.5 : duration));
    osc2.stop(time + (this.instrument === 'piano' ? duration * 1.5 : duration));
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentNoteIndex++;
    if (this.currentNoteIndex >= this.pitches.length) {
      const timeToStop = (this.nextNoteTime - this.ctx!.currentTime) * 1000;
      window.setTimeout(() => {
        this.stop();
      }, timeToStop);
      this.currentNoteIndex = -1;
    }
  }

  scheduler() {
    if (!this.ctx || !this.isPlaying || this.currentNoteIndex === -1) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      if (this.currentNoteIndex !== -1) {
        this.playMetronomeClick(this.nextNoteTime);
        this.playNote(this.pitches[this.currentNoteIndex], this.nextNoteTime, (60.0 / this.bpm) * 0.9);
        
        const timeToPlay = Math.max(0, (this.nextNoteTime - this.ctx.currentTime) * 1000);
        const idx = this.currentNoteIndex < this.basePitchesLength 
          ? this.currentNoteIndex 
          : this.basePitchesLength - 2 - (this.currentNoteIndex - this.basePitchesLength);
        
        window.setTimeout(() => {
          if (this.isPlaying && this.onNotePlayCallback) {
            this.onNotePlayCallback(idx);
          }
        }, timeToPlay);

        this.nextNote();
      }
    }
    if (this.isPlaying && this.currentNoteIndex !== -1) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  play(pitches: number[], bpm: number, instrument: 'bass4' | 'guitar6' | 'piano' = 'bass4') {
    this.init();
    // Play up and down the scale
    this.basePitchesLength = pitches.length;
    this.pitches = [...pitches, ...pitches.slice(0, -1).reverse()];
    this.bpm = bpm;
    this.instrument = instrument;
    this.isPlaying = true;
    this.currentNoteIndex = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.onStopCallback) {
      this.onStopCallback();
    }
    if (this.onNotePlayCallback) {
      this.onNotePlayCallback(null);
    }
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }
}

export const audioPlayer = new AudioPlayer();
