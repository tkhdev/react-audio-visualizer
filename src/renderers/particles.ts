import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawParticles(
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

  const particleCount = Math.min(data.length, 200);
  const step = Math.floor(data.length / particleCount);
  const xStep = width / particleCount;

  for (let i = 0; i < particleCount; i++) {
    const dataIndex = i * step;
    const value = data[dataIndex];
    const normalizedValue = value / 255;
    
    const x = i * xStep;
    const y = centerY - (normalizedValue - 0.5) * height * 0.8;
    const size = normalizedValue * 4 + 1;

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.fillStyle = color;
    
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();

    if (mirror) {
      const mirrorY = centerY + (normalizedValue - 0.5) * height * 0.8;
      context.beginPath();
      context.arc(x, mirrorY, size, 0, Math.PI * 2);
      context.fill();
    }
  }
}

