// Combined waveform + spectrum
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
export function drawCombined(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  timeData: ArrayLike<number>,
  freqData: ArrayLike<number>,
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

  // Draw waveform in center
  context.strokeStyle = typeof barColor === 'function' ? barColor(0.5) : barColor;
  context.lineWidth = 2;
  context.beginPath();

  const sliceWidth = width / timeData.length;
  let x = 0;

  for (let i = 0; i < timeData.length; i++) {
    // Normalize: timeData[i] is 0-255, 128 is center (silence)
    // Subtract 128 to center around 0, then normalize to -1 to 1
    const v = (timeData[i] - 128) / 128.0;
    // Scale by centerY to get amplitude (positive and negative)
    const y = v * centerY * 0.8; // 0.8 factor to leave some margin

    if (i === 0) {
      context.moveTo(x, centerY + y);
    } else {
      context.lineTo(x, centerY + y);
    }

    x += sliceWidth;
  }

  context.stroke();

  // Draw spectrum bars on top and bottom
  const barWidth = width / freqData.length;
  for (let i = 0; i < freqData.length; i++) {
    const value = freqData[i];
    const normalizedValue = value / 255;
    const barHeight = normalizedValue * centerY * 0.3;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    context.fillStyle = color;
    
    const x = i * barWidth;
    const drawWidth = Math.max(barWidth - 0.5, 0.5);
    
    // Top bars
    context.fillRect(x, centerY - barHeight - 5, drawWidth, barHeight);
    
    // Bottom bars
    context.fillRect(x, centerY + 5, drawWidth, barHeight);
  }
}



