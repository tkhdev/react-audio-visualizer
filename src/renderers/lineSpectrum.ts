import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawLineSpectrum(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const centerY = height / 2;
  const sliceWidth = width / data.length;

  context.beginPath();
  context.strokeStyle = typeof barColor === 'function' ? barColor(0.5) : barColor;
  context.lineWidth = 2;

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const normalizedValue = value / 255;
    const x = i * sliceWidth;
    const y = centerY - (normalizedValue * centerY);

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();

  if (mirror) {
    context.beginPath();
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      const normalizedValue = value / 255;
      const x = i * sliceWidth;
      const y = centerY + (normalizedValue * centerY);

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }
}



