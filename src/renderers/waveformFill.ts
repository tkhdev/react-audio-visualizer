import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawWaveformFill(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const sliceWidth = width / data.length;
  const color = typeof barColor === 'function' ? barColor(0.5) : barColor;

  // Draw top waveform fill
  context.fillStyle = color + '80';
  context.beginPath();
  context.moveTo(0, centerY);

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = (v * centerY) / 2;
    const x = i * sliceWidth;
    context.lineTo(x, centerY - y);
  }

  context.lineTo(width, centerY);
  context.closePath();
  context.fill();

  // Draw bottom waveform fill
  context.beginPath();
  context.moveTo(0, centerY);

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = (v * centerY) / 2;
    const x = i * sliceWidth;
    context.lineTo(x, centerY + y);
  }

  context.lineTo(width, centerY);
  context.closePath();
  context.fill();

  // Draw outline
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, centerY);

  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = (v * centerY) / 2;
    const x = i * sliceWidth;
    if (i === 0) {
      context.moveTo(x, centerY - y);
    } else {
      context.lineTo(x, centerY - y);
    }
  }
  context.stroke();

  context.beginPath();
  for (let i = 0; i < data.length; i++) {
    const v = data[i] / 128.0;
    const y = (v * centerY) / 2;
    const x = i * sliceWidth;
    if (i === 0) {
      context.moveTo(x, centerY + y);
    } else {
      context.lineTo(x, centerY + y);
    }
  }
  context.stroke();
}



