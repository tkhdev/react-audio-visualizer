import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFrequencyRings(
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

  // Group into rings with interleaved sampling for better distribution
  const ringCount = 8;
  const rings: number[] = [];

  for (let i = 0; i < ringCount; i++) {
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    // Use interleaved sampling to distribute frequency content evenly
    const samplesPerRing = Math.floor(data.length / ringCount);
    for (let j = 0; j < samplesPerRing; j++) {
      // Interleave: ring 0 gets indices 0, 8, 16... ring 1 gets 1, 9, 17...
      const idx = (j * ringCount + i) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for character
    const bandStart = Math.floor((i / ringCount) * data.length);
    const bandSize = Math.floor(data.length / ringCount);
    for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
      const value = data[bandStart + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    rings.push((avgValue * 0.5 + maxValue * 0.5));
  }

  for (let i = 0; i < rings.length; i++) {
    const normalizedValue = rings[i] / 255;
    const radius = (maxRadius / ringCount) * (i + 1);
    const ringThickness = normalizedValue * 20 + 2;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    context.strokeStyle = color;
    context.lineWidth = ringThickness;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();

    if (mirror) {
      context.beginPath();
      context.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
      context.stroke();
    }
  }
}



