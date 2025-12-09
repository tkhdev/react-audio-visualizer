// Waveform with history
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
const waveformHistory: number[][] = [];
const MAX_HISTORY = 50;

export function drawWaveformHistory(
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

  // Add current frame to history
  const frame: number[] = [];
  for (let i = 0; i < data.length; i++) {
    frame.push(data[i]);
  }
  waveformHistory.push(frame);
  if (waveformHistory.length > MAX_HISTORY) {
    waveformHistory.shift();
  }

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const sliceWidth = width / data.length;
  const alphaStep = 1 / waveformHistory.length;

  // Draw from oldest to newest
  for (let h = 0; h < waveformHistory.length; h++) {
    const frameData = waveformHistory[h];
    const alpha = h * alphaStep;
    
    let rgba = lineColor;
    if (lineColor.startsWith('#')) {
      const r = parseInt(lineColor.slice(1, 3), 16);
      const g = parseInt(lineColor.slice(3, 5), 16);
      const b = parseInt(lineColor.slice(5, 7), 16);
      rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (lineColor.startsWith('rgb')) {
      rgba = lineColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }
    
    context.strokeStyle = rgba;
    context.lineWidth = lineWidth;
    context.beginPath();

    let x = 0;
    for (let i = 0; i < frameData.length; i++) {
      // Normalize: data[i] is 0-255, 128 is center (silence)
      // Subtract 128 to center around 0, then normalize to -1 to 1
      const v = (frameData[i] - 128) / 128.0;
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

    if (mirror) {
      context.beginPath();
      x = 0;
      for (let i = 0; i < frameData.length; i++) {
        const v = (frameData[i] - 128) / 128.0;
        const y = v * centerY * 0.8;

        if (i === 0) {
          context.moveTo(x, centerY - y);
        } else {
          context.lineTo(x, centerY - y);
        }

        x += sliceWidth;
      }
      context.stroke();
    }
  }
}

