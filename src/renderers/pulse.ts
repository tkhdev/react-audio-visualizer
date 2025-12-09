// Pulsing circles from center
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
let pulsePhase = 0;

export function drawPulse(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 10;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Calculate RMS for better amplitude representation
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / data.length);
  // Amplify RMS for better visibility
  const amplifiedRms = Math.min(rms * 3, 1);

  pulsePhase += 0.1;

  // Draw multiple pulsing circles
  const numPulses = 5;
  for (let i = 0; i < numPulses; i++) {
    const phase = pulsePhase + i * 0.5;
    const radius = (Math.sin(phase) * 0.5 + 0.5) * maxRadius * (1 - i / numPulses);
    
    // Calculate alpha with minimum visibility
    // Outer circles fade more, but ensure minimum visibility
    const fadeFactor = 1 - (i / numPulses) * 0.6; // Less aggressive fading
    const baseAlpha = 0.3 + (amplifiedRms * 0.7); // Base alpha from 0.3 to 1.0
    const alpha = Math.max(0.2, baseAlpha * fadeFactor); // Minimum 0.2 alpha
    
    const color = typeof barColor === 'function' ? barColor(amplifiedRms) : barColor;
    
    // Extract RGB
    let r: number, g: number, b: number;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.startsWith('rgb')) {
      const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        r = parseInt(match[1], 10);
        g = parseInt(match[2], 10);
        b = parseInt(match[3], 10);
      } else {
        context.strokeStyle = color;
        context.lineWidth = 4 + (i * 0.5); // Thicker lines, increasing for outer circles
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
        continue;
      }
    } else {
      context.strokeStyle = color;
      context.lineWidth = 4 + (i * 0.5);
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.stroke();
      continue;
    }
    
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    // Thicker lines - base 4px, increasing for outer circles for better visibility
    context.lineWidth = 4 + (i * 0.5);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  }
}



