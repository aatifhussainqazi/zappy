// Audio Engine using Web Audio API for rich, zero-dependency sound design + Web Speech API for Zappy narration

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.5;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentTrack: 'lab' | 'storm' | 'celebration' = 'lab';
  private voiceNarrationEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVol;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVol;
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public resume() {
    this.initCtx();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVol = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVol, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVol = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVol, this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceNarration(enabled: boolean) {
    this.voiceNarrationEnabled = enabled;
  }

  // --- SFX GENERATORS ---

  // UI Click
  public playClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Rubbing Friction (for balloon / ruler)
  public playRubbing(intensity: number = 0.5) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.08;

    // Buffer noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400 + intensity * 600, now);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15 * Math.min(intensity, 1), now);
    gain.gain.linearRampToValueAtTime(0.01, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  // Electrical Charge Hum (rising pitch as charge builds)
  public playChargeHum(ratio: number) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.12;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 180 + ratio * 420;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, now);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq * 1.5, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900 + ratio * 1500, now);

    gain.gain.setValueAtTime(0.08 + ratio * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration);
    subOsc.stop(now + duration);
  }

  // Paper Flutter / Attract
  public playPaperFlutter() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 + Math.random() * 400, t);
      osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 300, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  // Balloon Sticking Pop
  public playPop() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Electric Spark / Discharge
  public playSpark() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = 0.15;

    // Fast bursts of noise + high pitch chirp
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  // Attraction Magnetic Whoosh
  public playAttract() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Repulsion Boing
  public playBoing() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Thunder Crack and Deep Rumble
  public playThunder(reducedIntensity: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const duration = reducedIntensity ? 1.0 : 1.8;

    // Lowpass filtered noise for rumbling shockwave
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + duration);

    const gain = this.ctx.createGain();
    const maxGain = reducedIntensity ? 0.3 : 0.6;
    gain.gain.setValueAtTime(maxGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    // Initial sharp strike
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(120, now);
    snapOsc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    snapGain.gain.setValueAtTime(reducedIntensity ? 0.2 : 0.45, now);
    snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);

    noise.start(now);
    snapOsc.start(now);
    noise.stop(now + duration);
    snapOsc.stop(now + 0.15);
  }

  // Level Complete Chime
  public playChime() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // Celebration Victory Fanfare
  public playFanfare() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.12 }, // E
      { f: 783.99, d: 0.12 }, // G
      { f: 1046.5, d: 0.28 }, // C (high)
      { f: 880.0, d: 0.15 },  // A
      { f: 1046.5, d: 0.4 },  // C
    ];

    let t = now;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.85;
    });
  }

  // Gentle Wrong Answer Boing (playful, not discouraging)
  public playWrong() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.15);
    osc.frequency.linearRampToValueAtTime(210, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // XP Sparkle Cascade
  public playXpSparkle() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Professor Zappy Cartoon Vocaloid Babble (when dialogue appears)
  public playZappyBabble(mood: string = 'happy') {
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const pitches = mood === 'surprised' ? [500, 750, 900] : mood === 'thinking' ? [350, 420, 380] : [440, 560, 660, 520];

    pitches.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      // Low pass to soften square wave
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.05);
    });
  }

  // --- BACKGROUND MUSIC ENGINE (Procedural Synth) ---
  public startMusic(track: 'lab' | 'storm' | 'celebration' = 'lab') {
    this.initCtx();
    this.currentTrack = track;
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Pentatonic scale arpeggio sequence for lab
    const labNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    // Minor / moodier notes for storm
    const stormNotes = [146.83, 174.61, 220.0, 261.63, 293.66];
    let step = 0;

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const isStorm = this.currentTrack === 'storm';
      const notes = isStorm ? stormNotes : labNotes;

      // Select musical note
      const noteIdx = isStorm 
        ? (step % notes.length) 
        : [0, 2, 4, 3, 5, 2, 4, 1][step % 8];
      const freq = notes[noteIdx % notes.length];

      // Bass drone every 4 steps
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(freq / 2, now);

        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.8);
      }

      // Melody bell / marimba
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isStorm ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(isStorm ? 0.06 : 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isStorm ? 0.7 : 0.35));

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + (isStorm ? 0.7 : 0.35));

      step++;
    };

    const intervalMs = this.currentTrack === 'storm' ? 650 : 380;
    this.musicInterval = window.setInterval(playStep, intervalMs);
  }

  public setMusicTrack(track: 'lab' | 'storm' | 'celebration') {
    if (this.currentTrack !== track) {
      this.stopMusic();
      this.currentTrack = track;
      this.startMusic(track);
    }
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  // --- WEB SPEECH API NARRATION ---
  public speakNarration(text: string, onEnd?: () => void) {
    if (!this.voiceNarrationEnabled || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any existing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05; // Lively, animated pace
      utterance.pitch = 1.15; // Slightly enthusiastic professor pitch

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('English')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public cancelNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundManager = new SoundEngine();
