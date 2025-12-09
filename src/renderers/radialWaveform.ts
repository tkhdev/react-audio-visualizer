import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawRadialWaveform(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  lineColor: string,
  lineWidth: number,
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = Math.min(width, height) / 3;
  const maxRadius = Math.min(width, height) / 2 - 10;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  context.strokeStyle = lineColor;
  context.lineWidth = lineWidth;
  context.beginPath();

  const angleStep = (Math.PI * 2) / data.length;

  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    const radius = baseRadius + v * (maxRadius - baseRadius);
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.closePath();
  context.stroke();

  if (mirror) {
    context.beginPath();
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      const radius = baseRadius + v * (maxRadius - baseRadius) * 0.7;
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();
    context.stroke();
  }
}



