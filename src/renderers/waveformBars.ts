import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawWaveformBars(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;
  const barWidth = Math.max(width / data.length, 1);

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const normalizedValue = (value - 128) / 128;
    const barHeight = Math.abs(normalizedValue) * centerY;
    
    const color = typeof barColor === 'function' ? barColor(Math.abs(normalizedValue)) : barColor;
    context.fillStyle = color;
    
    const x = i * barWidth;
    const drawWidth = Math.max(barWidth - 0.5, 0.5);
    
    if (normalizedValue > 0) {
      // Positive values go up
      context.fillRect(x, centerY - barHeight, drawWidth, barHeight);
    } else {
      // Negative values go down
      context.fillRect(x, centerY, drawWidth, barHeight);
    }

    if (mirror) {
      if (normalizedValue > 0) {
        context.fillRect(x, centerY, drawWidth, barHeight);
      } else {
        context.fillRect(x, centerY - barHeight, drawWidth, barHeight);
      }
    }
  }
}



