
// Sound effects utility for user interactions
export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = true;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  // Subtle success sound - low, gentle tone
  static playSuccess() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.log('Sound playback not available');
    }
  }

  // Very subtle click sound - minimal feedback
  static playClick() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.008, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.log('Sound playback not available');
    }
  }

  // Low error tone - non-intrusive
  static playError() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(180, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.log('Sound playback not available');
    }
  }

  // Gentle notification - barely noticeable
  static playNotification() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(350, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.012, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (error) {
      console.log('Sound playback not available');
    }
  }

  // Soft warning tone
  static playWarning() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(250, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (error) {
      console.log('Sound playback not available');
    }
  }

  // Subtle swoosh for transitions - low frequency sweep
  static playSwoosh() {
    if (!this.isEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Gentle frequency sweep - very subtle
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
      
      gainNode.gain.setValueAtTime(0.008, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.log('Sound playback not available');
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
