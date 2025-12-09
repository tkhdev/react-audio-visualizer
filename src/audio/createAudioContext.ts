/**
 * Creates and returns an AudioContext, handling Safari's autoplay policy
 */
export async function createAudioContext(): Promise<AudioContext> {
  const AudioContextClass =
    window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser');
  }

  const context = new AudioContextClass();

  // Safari requires user gesture to resume AudioContext
  if (context.state === 'suspended') {
    await context.resume();
  }

  return context;
}



