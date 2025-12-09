import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawEqualizer(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Group into 10 bands (like classic equalizer)
  const bandCount = 10;
  const samplesPerBand = Math.floor(data.length / bandCount);
  const bands: number[] = [];

  for (let i = 0; i < bandCount; i++) {
    let sum = 0;
    const start = i * samplesPerBand;
    const end = Math.min(start + samplesPerBand, data.length);
    for (let j = start; j < end; j++) {
      sum += data[j];
    }
    bands.push(sum / (end - start));
  }

  const barWidth = width / bandCount;
  const centerY = height / 2;

  for (let i = 0; i < bands.length; i++) {
    const normalizedValue = bands[i] / 255;
    const barHeight = normalizedValue * centerY;
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;

    const x = i * barWidth;
    const drawWidth = barWidth - 4;

    // Draw center line
    context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x + barWidth / 2, 0);
    context.lineTo(x + barWidth / 2, height);
    context.stroke();

    // Draw bar
    context.fillStyle = color;
    context.fillRect(x + 2, centerY - barHeight, drawWidth, barHeight * 2);

    if (mirror) {
      // Draw mirrored
      context.fillRect(x + 2, centerY - barHeight, drawWidth, barHeight * 2);
    }
  }
}



