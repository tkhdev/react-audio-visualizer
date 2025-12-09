import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawSpiral(
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

  const numTurns = 3;
  const pointsPerTurn = data.length / numTurns;
  const pointCount = Math.min(data.length, 200); // Limit points for performance

  context.beginPath();
  context.lineWidth = 2;

  for (let i = 0; i < pointCount; i++) {
    // Use interleaved sampling to distribute frequency content evenly
    const dataIndex = Math.floor((i / pointCount) * data.length);
    
    // Sample multiple nearby points for smoother response
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    const sampleRange = Math.max(1, Math.floor(data.length / pointCount));
    
    for (let j = 0; j < sampleRange && (dataIndex + j) < data.length; j++) {
      const value = data[dataIndex + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from interleaved positions
    const interleavedIdx = (i * Math.floor(data.length / pointCount)) % data.length;
    if (interleavedIdx < data.length) {
      const value = data[interleavedIdx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    const normalizedValue = Math.max(combinedValue * 1.8, 0.1);
    
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const radius = (i / pointCount) * maxRadius;
    const offset = normalizedValue * 50; // Increased offset for more dynamic movement
    
    const x = centerX + Math.cos(angle) * (radius + offset);
    const y = centerY + Math.sin(angle) * (radius + offset);

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.strokeStyle = color;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();
}



