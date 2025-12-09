import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawVUMeter(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string)
): void {
  const { width, height } = getCanvasDimensions(canvas);

  // Clear canvas
  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Calculate RMS for overall level
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sum += normalized * normalized;
  }
  const rms = Math.sqrt(sum / data.length);
  const amplifiedRms = Math.min(rms * 3, 1);
  const normalizedRms = Math.max(amplifiedRms, 0);

  // Draw meter background
  const meterWidth = width * 0.8;
  const meterHeight = height * 0.6;
  const meterX = (width - meterWidth) / 2;
  const meterY = (height - meterHeight) / 2;

  context.fillStyle = 'rgba(0, 0, 0, 0.3)';
  context.fillRect(meterX, meterY, meterWidth, meterHeight);

  // Draw meter segments (green, yellow, red)
  const segmentHeight = meterHeight / 3;
  
  // Green zone
  context.fillStyle = 'rgba(0, 255, 0, 0.2)';
  context.fillRect(meterX, meterY + segmentHeight * 2, meterWidth, segmentHeight);
  
  // Yellow zone
  context.fillStyle = 'rgba(255, 255, 0, 0.2)';
  context.fillRect(meterX, meterY + segmentHeight, meterWidth, segmentHeight);
  
  // Red zone
  context.fillStyle = 'rgba(255, 0, 0, 0.2)';
  context.fillRect(meterX, meterY, meterWidth, segmentHeight);

  // Draw level bar
  const levelHeight = normalizedRms * meterHeight;
  const color = typeof barColor === 'function' ? barColor(normalizedRms) : barColor;
  
  context.fillStyle = color;
  context.fillRect(meterX, meterY + meterHeight - levelHeight, meterWidth, levelHeight);

  // Draw border
  context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  context.lineWidth = 2;
  context.strokeRect(meterX, meterY, meterWidth, meterHeight);
}



