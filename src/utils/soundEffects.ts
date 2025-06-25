
// Sound effects utility for user interactions - DISABLED FOR PERFORMANCE
export class SoundEffects {
  private static audioContext: AudioContext | null = null;
  private static isEnabled = false; // Disabled for performance

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  static setEnabled(enabled: boolean) {
    this.isEnabled = false; // Force disabled
  }

  static isAudioEnabled(): boolean {
    return false; // Always disabled for performance
  }

  // All sound methods are now no-ops for performance
  static playSuccess() {
    // Disabled for performance
  }

  static playClick() {
    // Disabled for performance
  }

  static playError() {
    // Disabled for performance
  }

  static playNotification() {
    // Disabled for performance
  }

  static playWarning() {
    // Disabled for performance
  }

  static playSwoosh() {
    // Disabled for performance
  }
}

// Export individual functions for convenience - all disabled
export const playSuccessSound = () => {}; // Disabled
export const playClickSound = () => {}; // Disabled
export const playErrorSound = () => {}; // Disabled
export const playNotificationSound = () => {}; // Disabled
export const playWarningSound = () => {}; // Disabled
export const playSwooshSound = () => {}; // Disabled
