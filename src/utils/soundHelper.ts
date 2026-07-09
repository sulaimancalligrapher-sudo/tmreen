/**
 * Web Audio API Sound Synthesizer for Arabic Learning Hub
 * Provides zero-network, 100% reliable local sound effects
 * bypassing browser CORS, network latency, and dead link issues.
 */

class SoundSynthesizer {
  private getCtx(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      // AudioContexts are often suspended by default until a user gesture.
      // Calling resume() or creating it during a click/touch handler is safest.
      const ctx = new AudioContextClass();
      return ctx;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return null;
    }
  }

  /**
   * Plays a beautiful positive double-chime arpeggio for correct/success action
   */
  public playSuccess() {
    const ctx = this.getCtx();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Smooth volume envelope to make it sound pleasant
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Beautiful major arpeggio
    playNote(523.25, now, 0.25);        // C5
    playNote(659.25, now + 0.08, 0.25); // E5
    playNote(783.99, now + 0.16, 0.3);  // G5
    playNote(1046.50, now + 0.24, 0.4); // C6
  }

  /**
   * Plays a distinct buzzer sound for incorrect drawing or direction error
   */
  public playError() {
    const ctx = this.getCtx();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3); // Descending buzz
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Plays a magical celebratory chime for completing a whole lesson
   */
  public playLessonComplete() {
    const ctx = this.getCtx();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    
    // Major scale sweep representing a magical win
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  }
}

export const sound = new SoundSynthesizer();
