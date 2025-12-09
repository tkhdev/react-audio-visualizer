import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFrequencyLines(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;
  const lineSpacing = height / data.length;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const normalizedValue = value / 255;
    const lineLength = normalizedValue * width;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.strokeStyle = color;
    context.lineWidth = 2;
    
    const y = i * lineSpacing;
    
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(lineLength, y);
    context.stroke();

    if (mirror) {
      const mirrorY = height - y;
      context.beginPath();
      context.moveTo(0, mirrorY);
      context.lineTo(lineLength, mirrorY);
      context.stroke();
    }
  }
}



