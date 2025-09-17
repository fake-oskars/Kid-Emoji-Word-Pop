
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser", e);
        return null;
      }
    }
    return audioContext;
  }
  return null;
};

export const initializeAudio = (): void => {
  const context = getAudioContext();
  if (context && context.state === 'suspended') {
    context.resume();
  }
};


export const playSound = (frequency: number, duration: number = 0.2): void => {
  try {
    const context = getAudioContext();
    if (!context) return;

    // Resume context on user gesture
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
    gainNode.gain.setValueAtTime(0.5, context.currentTime); // Start at half volume
    gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};