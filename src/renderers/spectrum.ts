import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawSpectrum(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  // Use logical dimensions (accounting for DPR scaling)
  const { width, height } = getCanvasDimensions(canvas);
  const barWidth = Math.max(width / data.length, 1);

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const normalizedValue = value / 255;
    
    // Ensure minimum bar height for visibility
    const barHeight = Math.max((normalizedValue * height), 1);

    // Determine color
    const color =
      typeof barColor === 'function' ? barColor(normalizedValue) : barColor;

    context.fillStyle = color;
    
    // Draw bar with slight spacing for better visibility
    const x = i * barWidth;
    const barDrawWidth = Math.max(barWidth - 0.5, 0.5);
    
    context.fillRect(x, height - barHeight, barDrawWidth, barHeight);

    // Draw mirrored bars if enabled
    if (mirror) {
      context.fillRect(x, 0, barDrawWidth, barHeight);
    }
  }
}

