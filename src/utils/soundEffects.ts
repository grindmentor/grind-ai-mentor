
// Sound effects utility for user interactions
export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = false;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled && this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  private static createTone(frequency: number, duration: number, volume: number = 0.1): void {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  static playSuccess() {
    this.createTone(523.25, 0.15, 0.08); // C5 note
    setTimeout(() => this.createTone(659.25, 0.15, 0.08), 75); // E5 note
  }

  static playClick() {
    this.createTone(800, 0.05, 0.04); // Short, subtle click
  }

  static playError() {
    this.createTone(220, 0.3, 0.06); // Low error tone
  }

  static playNotification() {
    this.createTone(440, 0.1, 0.05); // A4 note
    setTimeout(() => this.createTone(554.37, 0.1, 0.05), 100); // C#5 note
  }

  static playWarning() {
    this.createTone(349.23, 0.2, 0.06); // F4 note
  }

  static playSwoosh() {
    // Frequency sweep for swoosh effect
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
}

// Export individual functions for convenience
export const playSuccessSound = () => SoundEffects.playSuccess();
export const playClickSound = () => SoundEffects.playClick();
export const playErrorSound = () => SoundEffects.playError();
export const playNotificationSound = () => SoundEffects.playNotification();
export const playWarningSound = () => SoundEffects.playWarning();
export const playSwooshSound = () => SoundEffects.playSwoosh();
