import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawCircular(
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
  const maxRadius = Math.min(width, height) / 2;
  const baseRadius = maxRadius * 0.3; // Inner radius for bars
  const maxBarLength = maxRadius - baseRadius - 10; // Maximum bar extension with padding

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Use a fixed number of bars for better distribution
  const barCount = Math.min(data.length, 64);
  const angleStep = (Math.PI * 2) / barCount;

  for (let i = 0; i < barCount; i++) {
    // Use interleaved sampling to distribute frequency content evenly
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    // Sample multiple points across the spectrum for this bar
    const samplesPerBar = Math.floor(data.length / barCount);
    for (let j = 0; j < samplesPerBar; j++) {
      // Interleave: bar 0 gets indices 0, 64, 128... bar 1 gets 1, 65, 129...
      const idx = (j * barCount + i) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for character
    const bandStart = Math.floor((i / barCount) * data.length);
    const bandSize = Math.floor(data.length / barCount);
    for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
      const value = data[bandStart + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    const normalizedValue = Math.max(combinedValue * 1.6, 0.1);
    
    // Constrain bar length to stay within canvas bounds
    const barLength = Math.min(normalizedValue * maxBarLength, maxBarLength);
    
    // Calculate angles for this bar (with slight overlap to ensure full coverage)
    const startAngle = i * angleStep - Math.PI / 2;
    const endAngle = ((i + 1) * angleStep) - Math.PI / 2;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    // Draw filled sector/pie slice for each bar to ensure full circle coverage
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(centerX, centerY);
    // Inner arc
    context.arc(centerX, centerY, baseRadius, startAngle, endAngle);
    // Outer arc
    context.arc(centerX, centerY, baseRadius + barLength, endAngle, startAngle, true);
    context.closePath();
    context.fill();

    // Draw mirrored on opposite side if enabled
    if (mirror) {
      const mirrorStartAngle = startAngle + Math.PI;
      const mirrorEndAngle = endAngle + Math.PI;
      
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, baseRadius, mirrorStartAngle, mirrorEndAngle);
      context.arc(centerX, centerY, baseRadius + barLength, mirrorEndAngle, mirrorStartAngle, true);
      context.closePath();
      context.fill();
    }
  }
}

