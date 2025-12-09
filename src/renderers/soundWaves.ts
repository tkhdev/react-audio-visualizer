// Sound waves / ripple effect
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
let wavePhase = 0;

export function drawSoundWaves(
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

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Calculate average amplitude
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  const avgAmplitude = (sum / data.length) / 255;
  const maxRadius = Math.min(width, height) / 2 - 20;

  wavePhase += 0.05;

  // Draw concentric circles
  const numRings = 8;
  for (let ring = 0; ring < numRings; ring++) {
    const radius = (maxRadius / numRings) * (ring + 1);
    const phase = wavePhase + ring * 0.5;
    const amplitude = avgAmplitude * (1 - ring / numRings);
    const waveRadius = radius + Math.sin(phase) * amplitude * 30;

    const alpha = 0.3 - (ring / numRings) * 0.25;
    const color = typeof barColor === 'function' ? barColor(avgAmplitude) : barColor;
    
    // Extract RGB from color - handle hex colors
    let rgb = color;
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      rgb = `rgb(${r}, ${g}, ${b})`;
    }
    context.strokeStyle = rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    context.lineWidth = 2;
    
    context.beginPath();
    context.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
    context.stroke();

    if (mirror) {
      context.beginPath();
      context.arc(centerX, centerY, waveRadius * 0.7, 0, Math.PI * 2);
      context.stroke();
    }
  }
}

