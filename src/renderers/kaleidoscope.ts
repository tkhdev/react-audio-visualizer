// Kaleidoscope effect
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
export function drawKaleidoscope(
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

  const segments = 8; // Number of mirror segments
  const angleStep = (Math.PI * 2) / segments;
  const pointsPerSegment = Math.min(Math.floor(data.length / segments), 30);

  for (let seg = 0; seg < segments; seg++) {
    context.save();
    context.translate(centerX, centerY);
    context.rotate(seg * angleStep);

    for (let i = 0; i < pointsPerSegment; i++) {
      // Use interleaved sampling to distribute frequency content evenly
      let sum = 0;
      let maxValue = 0;
      let count = 0;
      
      // Sample multiple points across the spectrum for this point
      const samplesPerPoint = Math.floor(data.length / (segments * pointsPerSegment));
      for (let j = 0; j < samplesPerPoint; j++) {
        // Interleave: segment 0, point 0 gets indices 0, 240, 480... segment 0, point 1 gets 1, 241, 481...
        const idx = (j * segments * pointsPerSegment + seg * pointsPerSegment + i) % data.length;
        const value = data[idx];
        sum += value;
        maxValue = Math.max(maxValue, value);
        count++;
      }
      
      // Also sample from a specific frequency band for character
      const bandStart = Math.floor(((seg * pointsPerSegment + i) / (segments * pointsPerSegment)) * data.length);
      const bandSize = Math.floor(data.length / (segments * pointsPerSegment));
      for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
        const value = data[bandStart + j];
        sum += value;
        maxValue = Math.max(maxValue, value);
        count++;
      }
      
      // Combine average and max for dynamic response
      const avgValue = count > 0 ? sum / count : 0;
      const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
      const normalizedValue = Math.max(combinedValue * 1.8, 0.1);
      
      const radius = normalizedValue * maxRadius;
      const angle = (i / pointsPerSegment) * (Math.PI / segments);
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
      context.fillStyle = color;
      context.beginPath();
      // Dynamic point size based on value
      const pointSize = 2 + normalizedValue * 4;
      context.arc(x, y, pointSize, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }
}



