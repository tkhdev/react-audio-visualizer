// Energy waves
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
let energyPhase = 0;

export function drawEnergyWaves(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Calculate RMS for better amplitude representation
  let sumSquares = 0;
  let maxValue = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = data[i] / 255;
    sumSquares += normalized * normalized;
    maxValue = Math.max(maxValue, normalized);
  }
  const rms = Math.sqrt(sumSquares / data.length);
  const combinedAmplitude = (rms * 0.7 + maxValue * 0.3);
  const amplifiedAmplitude = Math.min(combinedAmplitude * 2.5, 1); // Amplify and clamp

  // Phase speed based on amplitude - more responsive
  energyPhase += 0.15 + amplifiedAmplitude * 0.4;

  const color = typeof barColor === 'function' ? barColor(amplifiedAmplitude) : barColor;
  
  // Draw multiple wave layers with frequency-based modulation
  const layers = 4;
  for (let layer = 0; layer < layers; layer++) {
    const phase = energyPhase + layer * 0.6;
    // Base amplitude scales with layer, but all layers respond to sound
    const baseAmplitude = (height / 5) * (1 - layer / layers * 0.5);
    const dynamicAmplitude = baseAmplitude * (0.3 + amplifiedAmplitude * 0.7);
    
    context.strokeStyle = color;
    // Dynamic line width based on amplitude
    context.lineWidth = 1.5 + amplifiedAmplitude * 2;
    context.beginPath();

    for (let x = 0; x < width; x += 2) {
      // Map x position to frequency data for more responsive waves
      const freqIndex = Math.floor((x / width) * data.length);
      const freqValue = freqIndex < data.length ? data[freqIndex] / 255 : 0;
      
      // Combine base frequency with frequency data for dynamic response
      const baseFreq = (x / width) * Math.PI * 4;
      const freqModulation = freqValue * Math.PI * 2;
      const freq = baseFreq + freqModulation;
      
      // Wave amplitude also varies with frequency data
      const waveAmplitude = dynamicAmplitude * (1 + freqValue * 0.5);
      const y = centerY + Math.sin(freq + phase) * waveAmplitude;
      
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.stroke();

    if (mirror) {
      context.beginPath();
      for (let x = 0; x < width; x += 2) {
        const freqIndex = Math.floor((x / width) * data.length);
        const freqValue = freqIndex < data.length ? data[freqIndex] / 255 : 0;
        
        const baseFreq = (x / width) * Math.PI * 4;
        const freqModulation = freqValue * Math.PI * 2;
        const freq = baseFreq + freqModulation;
        
        const waveAmplitude = dynamicAmplitude * (1 + freqValue * 0.5);
        const y = centerY - Math.sin(freq + phase) * waveAmplitude;
        
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();
    }
  }
}



