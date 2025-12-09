export function createAnalyser(
  context: AudioContext,
  fftSize: number = 1024,
  smoothing: number = 0.85,
  minDecibels: number = -90,
  maxDecibels: number = -10
): AnalyserNode {
  const analyser = context.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = smoothing;
  analyser.minDecibels = minDecibels;
  analyser.maxDecibels = maxDecibels;
  return analyser;
}

