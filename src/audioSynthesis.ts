class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private rainCrackles: AudioBufferSourceNode | null = null;
  private rainCrackleGain: GainNode | null = null;
  private type: string = 'none';

  start(type: string, volume: number = 0.5) {
    this.stop();
    if (type === 'none') return;
    
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const sampleRate = this.ctx.sampleRate;
      const bufferSize = 2 * sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Populate buffer with noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'white') {
          output[i] = white;
        } else if (type === 'rain' || type === 'ocean') {
          // Brown noise filter (integrator)
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Amplify
        } else if (type === 'focus') {
          // Low frequency hum
          output[i] = (lastOut + (0.08 * white)) / 1.08;
          lastOut = output[i];
          output[i] *= 2.0;
        }
      }

      this.source = this.ctx.createBufferSource();
      this.source.buffer = noiseBuffer;
      this.source.loop = true;

      this.gain = this.ctx.createGain();
      this.gain.gain.value = volume;

      if (type === 'rain') {
        // Rain is lowpassed brown noise
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 1000;
        
        this.source.connect(this.filter);
        this.filter.connect(this.gain);

        // Add soft high-pitched crackles for droplets
        const crackleBufferSize = 0.5 * sampleRate;
        const crackleBuffer = this.ctx.createBuffer(1, crackleBufferSize, sampleRate);
        const crackleData = crackleBuffer.getChannelData(0);
        for (let i = 0; i < crackleBufferSize; i++) {
          // Occasional sharp impulses
          if (Math.random() < 0.0003) {
            crackleData[i] = Math.random() * 0.6 - 0.3;
          } else {
            crackleData[i] = 0;
          }
        }
        
        this.rainCrackles = this.ctx.createBufferSource();
        this.rainCrackles.buffer = crackleBuffer;
        this.rainCrackles.loop = true;
        
        this.rainCrackleGain = this.ctx.createGain();
        this.rainCrackleGain.gain.value = volume * 0.4;
        
        this.rainCrackles.connect(this.rainCrackleGain);
        this.rainCrackleGain.connect(this.ctx.destination);
        this.rainCrackles.start(0);

      } else if (type === 'ocean') {
        // Ocean has a low-frequency modulator to simulate waves washing in and out
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 600;

        // Wave modulator
        const waveOsc = this.ctx.createOscillator();
        waveOsc.frequency.value = 0.08; // 12 seconds per wave cycle
        
        const waveGain = this.ctx.createGain();
        waveGain.gain.value = volume * 0.6; // Modulate volume
        
        const mainGain = this.gain;
        
        // Connect nodes
        this.source.connect(this.filter);
        this.filter.connect(mainGain);
        
        // We can modulate mainGain value using oscillator
        const modulator = this.ctx.createGain();
        modulator.gain.value = volume * 0.4;
        waveOsc.connect(modulator.gain); // Modulate
        
        waveOsc.start();
        
      } else if (type === 'focus') {
        // Focus hum (low-mid bandpass)
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'bandpass';
        this.filter.frequency.value = 130; // 130Hz deep soothing hum
        this.filter.Q.value = 2.0;
        
        this.source.connect(this.filter);
        this.filter.connect(this.gain);
      } else {
        // White noise
        this.source.connect(this.gain);
      }

      this.gain.connect(this.ctx.destination);
      this.source.start(0);
      this.type = type;
    } catch (error) {
      console.error("Web Audio API failed to initialize", error);
    }
  }

  setVolume(volume: number) {
    if (this.gain) {
      this.gain.gain.value = volume;
    }
    if (this.rainCrackleGain) {
      this.rainCrackleGain.gain.value = volume * 0.4;
    }
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {}
      this.source.disconnect();
      this.source = null;
    }
    if (this.rainCrackles) {
      try {
        this.rainCrackles.stop();
      } catch (e) {}
      this.rainCrackles.disconnect();
      this.rainCrackles = null;
    }
    if (this.filter) {
      this.filter.disconnect();
      this.filter = null;
    }
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
    if (this.rainCrackleGain) {
      this.rainCrackleGain.disconnect();
      this.rainCrackleGain = null;
    }
    this.type = 'none';
  }

  getType() {
    return this.type;
  }
}

export const ambientSound = new AmbientSoundManager();
export type AmbientType = 'none' | 'white' | 'rain' | 'ocean' | 'focus';
export const ambientOptions = [
  { id: 'none', name: 'None' },
  { id: 'white', name: 'White Noise' },
  { id: 'rain', name: 'Rainfall' },
  { id: 'ocean', name: 'Deep Waves' },
  { id: 'focus', name: 'Focus Hum' }
];
export const playCompletionChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Play a nice warm, premium chords chime
    const playTone = (freq: number, start: number, duration: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      // Gentle rise, soft decay
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    
    // E-major arpeggio for a happy vibe
    playTone(329.63, now, 1.2, 0.15);       // E4
    playTone(415.30, now + 0.12, 1.1, 0.15); // G#4
    playTone(493.88, now + 0.24, 1.0, 0.15); // B4
    playTone(659.25, now + 0.36, 1.5, 0.2);  // E5
  } catch (e) {
    console.error("Failed to play chime", e);
  }
};
