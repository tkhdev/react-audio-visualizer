import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawDualWaveform(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  lineColor: string,
  lineWidth: number,
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

  context.strokeStyle = lineColor;
  context.lineWidth = lineWidth;

  // Draw top waveform
  context.beginPath();
  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128.0;
    const y = (v * centerY) / 2;

    if (i === 0) {
      context.moveTo(x, centerY - y);
    } else {
      context.lineTo(x, centerY - y);
    }
    x += sliceWidth;
  }
  context.stroke();

  // Draw bottom waveform (inverted)
  context.beginPath();
  x = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128.0;
    const y = (v * centerY) / 2;

    if (i === 0) {
      context.moveTo(x, centerY + y);
    } else {
      context.lineTo(x, centerY + y);
    }
    x += sliceWidth;
  }
  context.stroke();

  // Draw center line
  context.strokeStyle = lineColor;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, centerY);
  context.lineTo(width, centerY);
  context.stroke();
}

