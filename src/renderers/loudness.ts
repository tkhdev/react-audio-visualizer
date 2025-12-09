import { calculateRMS } from '../utils/rms';
import { clamp } from '../utils/clamp';
import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawLoudness(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string)
): void {
  // Use logical dimensions (accounting for DPR scaling)
  const { width, height } = getCanvasDimensions(canvas);

  // Calculate RMS
  const rms = calculateRMS(data);
  // Amplify and normalize RMS for better visibility
  // RMS typically ranges from 0 to ~0.3-0.5 for normal audio
  // Scale it up and clamp to make it more responsive
  const amplifiedRms = Math.min(rms * 3, 1);
  const normalizedRms = clamp(amplifiedRms, 0, 1);

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Draw loudness bar with minimum height for visibility
  const barHeight = Math.max(normalizedRms * height, 2);
  const color = typeof barColor === 'function' ? barColor(normalizedRms) : barColor;

  context.fillStyle = color;
  context.fillRect(0, height - barHeight, width, barHeight);
  
  // Draw a border for better visibility
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.strokeRect(0, height - barHeight, width, barHeight);
}

