// Spectrogram - 2D time-frequency representation
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
const spectrogramHistory: number[][] = [];
const MAX_HISTORY = 200;

export function drawSpectrogram(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);

  // Add current frame to history
  const frame: number[] = [];
  for (let i = 0; i < data.length; i++) {
    frame.push(data[i]);
  }
  spectrogramHistory.push(frame);
  if (spectrogramHistory.length > MAX_HISTORY) {
    spectrogramHistory.shift();
  }

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const rowHeight = height / spectrogramHistory.length;
  const barWidth = width / data.length;

  // Draw from oldest (top) to newest (bottom)
  for (let row = 0; row < spectrogramHistory.length; row++) {
    const frameData = spectrogramHistory[row];
    const y = row * rowHeight;

    for (let i = 0; i < frameData.length; i++) {
      const value = frameData[i];
      const normalizedValue = value / 255;
      
      // Spectrogram uses user's color choice with alpha based on intensity
      let color: string;
      if (typeof barColor === 'function') {
        color = barColor(normalizedValue);
      } else {
        color = barColor;
      }
      
      // Extract RGB and apply alpha based on intensity
      let r: number, g: number, b: number;
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      } else if (color.startsWith('rgba')) {
        const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          r = parseInt(match[1], 10);
          g = parseInt(match[2], 10);
          b = parseInt(match[3], 10);
        } else {
          context.fillStyle = color;
          const x = i * barWidth;
          context.fillRect(x, y, barWidth, rowHeight);
          continue;
        }
      } else if (color.startsWith('rgb')) {
        const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          r = parseInt(match[1], 10);
          g = parseInt(match[2], 10);
          b = parseInt(match[3], 10);
        } else {
          context.fillStyle = color;
          const x = i * barWidth;
          context.fillRect(x, y, barWidth, rowHeight);
          continue;
        }
      } else {
        // Unknown color format, use as is
        context.fillStyle = color;
        const x = i * barWidth;
        context.fillRect(x, y, barWidth, rowHeight);
        continue;
      }
      
      // Apply alpha based on intensity for gradient effect
      const alpha = Math.max(normalizedValue, 0.1);
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      
      const x = i * barWidth;
      const drawWidth = Math.max(barWidth - 0.5, 0.5);
      context.fillRect(x, y, drawWidth, rowHeight);
    }
  }
}



