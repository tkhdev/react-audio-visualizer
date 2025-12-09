import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFrequencyBands(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  
  // Group frequencies into bands (bass, mid, treble)
  const bandCount = 32;
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

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < bands.length; i++) {
    const normalizedValue = bands[i] / 255;
    const barHeight = normalizedValue * height;

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.fillStyle = color;
    
    const x = i * barWidth;
    const barDrawWidth = Math.max(barWidth - 2, 1);
    
    context.fillRect(x, height - barHeight, barDrawWidth, barHeight);

    if (mirror) {
      context.fillRect(x, 0, barDrawWidth, barHeight);
    }
  }
}

