import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawOscilloscope(
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

  // Draw grid
  context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  context.lineWidth = 1;
  
  // Horizontal lines
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  
  // Vertical lines
  for (let i = 0; i <= 8; i++) {
    const x = (width / 8) * i;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  // Draw waveform
  context.strokeStyle = lineColor;
  context.lineWidth = lineWidth;
  context.beginPath();

  const sliceWidth = width / data.length;
  let x = 0;

  for (let i = 0; i < data.length; i++) {
    // Normalize: data[i] is 0-255, 128 is center (silence)
    // Subtract 128 to center around 0, then normalize to -1 to 1
    const v = (data[i] - 128) / 128.0;
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
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128.0;
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



