import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFrequencyDots(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const dotCount = Math.min(data.length, 150);
  const step = Math.floor(data.length / dotCount);
  const xStep = width / dotCount;

  for (let i = 0; i < dotCount; i++) {
    const dataIndex = i * step;
    const value = data[dataIndex];
    const normalizedValue = value / 255;
    
    const x = i * xStep;
    const y = centerY - (normalizedValue - 0.5) * height * 0.7;
    const size = normalizedValue * 5 + 2;

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.fillStyle = color;
    
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();

    if (mirror) {
      const mirrorY = centerY + (normalizedValue - 0.5) * height * 0.7;
      context.beginPath();
      context.arc(x, mirrorY, size, 0, Math.PI * 2);
      context.fill();
    }
  }
}



