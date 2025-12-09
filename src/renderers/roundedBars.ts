import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawRoundedBars(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const barWidth = Math.max(width / data.length, 1);
  const cornerRadius = 3;

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
    const barHeight = Math.max((normalizedValue * height), 1);

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.fillStyle = color;
    
    const x = i * barWidth;
    const barDrawWidth = Math.max(barWidth - 1, 1);
    const y = height - barHeight;

    // Draw rounded rectangle
    context.beginPath();
    context.moveTo(x + cornerRadius, y);
    context.lineTo(x + barDrawWidth - cornerRadius, y);
    context.quadraticCurveTo(x + barDrawWidth, y, x + barDrawWidth, y + cornerRadius);
    context.lineTo(x + barDrawWidth, y + barHeight);
    context.lineTo(x, y + barHeight);
    context.lineTo(x, y + cornerRadius);
    context.quadraticCurveTo(x, y, x + cornerRadius, y);
    context.closePath();
    context.fill();

    if (mirror) {
      context.beginPath();
      context.moveTo(x + cornerRadius, 0);
      context.lineTo(x + barDrawWidth - cornerRadius, 0);
      context.quadraticCurveTo(x + barDrawWidth, 0, x + barDrawWidth, cornerRadius);
      context.lineTo(x + barDrawWidth, barHeight);
      context.lineTo(x, barHeight);
      context.lineTo(x, cornerRadius);
      context.quadraticCurveTo(x, 0, x + cornerRadius, 0);
      context.closePath();
      context.fill();
    }
  }
}

