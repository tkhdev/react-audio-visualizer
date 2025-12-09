import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFrequencyArcs(
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

  const arcCount = Math.min(data.length, 60);
  const angleStep = (Math.PI * 2) / arcCount;
  const baseRadius = maxRadius * 0.3;

  for (let i = 0; i < arcCount; i++) {
    // Use interleaved sampling to distribute frequency content evenly
    // Each arc samples from across the entire frequency spectrum
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    // Sample multiple points across the spectrum for this arc
    const samplesPerArc = Math.floor(data.length / arcCount);
    for (let j = 0; j < samplesPerArc; j++) {
      // Interleave: arc 0 gets indices 0, 60, 120... arc 1 gets 1, 61, 121...
      const idx = (j * arcCount + i) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for character
    const bandStart = Math.floor((i / arcCount) * data.length);
    const bandSize = Math.floor(data.length / arcCount);
    for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
      const value = data[bandStart + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    const normalizedValue = Math.max(combinedValue * 1.5, 0.1);
    
    const radius = baseRadius + normalizedValue * (maxRadius - baseRadius);
    const angle = i * angleStep - Math.PI / 2;
    const arcLength = normalizedValue * Math.PI * 0.5;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    context.strokeStyle = color;
    context.lineWidth = 2 + normalizedValue * 2;
    context.beginPath();
    context.arc(centerX, centerY, radius, angle, angle + arcLength);
    context.stroke();

    if (mirror) {
      context.beginPath();
      context.arc(centerX, centerY, radius * 0.7, angle, angle + arcLength);
      context.stroke();
    }
  }
}



