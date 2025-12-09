import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawLissajous(
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
  const maxRadius = Math.min(width, height) / 2 - 20;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  // Lissajous curves: x = A * cos(ωx * t), y = B * sin(ωy * t)
  // Use waveform data to determine frequency ratios and amplitudes
  
  // Split waveform into two parts for X and Y analysis
  const midPoint = Math.floor(data.length / 2);
  
  // Calculate RMS for amplitude scaling
  let sumX = 0, sumY = 0;
  for (let i = 0; i < midPoint; i++) {
    const normalized = (data[i] - 128) / 128;
    sumX += normalized * normalized;
  }
  for (let i = midPoint; i < data.length; i++) {
    const normalized = (data[i] - 128) / 128;
    sumY += normalized * normalized;
  }
  const rmsX = Math.sqrt(sumX / midPoint);
  const rmsY = Math.sqrt(sumY / (data.length - midPoint));
  
  // Calculate frequency ratios from waveform characteristics
  // Count zero crossings to estimate frequency
  let zeroCrossingsX = 0, zeroCrossingsY = 0;
  for (let i = 1; i < midPoint; i++) {
    const prev = (data[i - 1] - 128) / 128;
    const curr = (data[i] - 128) / 128;
    if ((prev < 0 && curr >= 0) || (prev > 0 && curr <= 0)) {
      zeroCrossingsX++;
    }
  }
  for (let i = midPoint + 1; i < data.length; i++) {
    const prev = (data[i - 1] - 128) / 128;
    const curr = (data[i] - 128) / 128;
    if ((prev < 0 && curr >= 0) || (prev > 0 && curr <= 0)) {
      zeroCrossingsY++;
    }
  }
  
  // Map zero crossings to frequency ratios (1:1 to 5:4 range)
  const freqRatioX = Math.max(1, Math.min(5, Math.floor((zeroCrossingsX / midPoint) * 10) + 1));
  const freqRatioY = Math.max(1, Math.min(5, Math.floor((zeroCrossingsY / (data.length - midPoint)) * 10) + 1));
  
  // Amplitude based on RMS
  const amplitudeX = maxRadius * (0.4 + rmsX * 0.4);
  const amplitudeY = maxRadius * (0.4 + rmsY * 0.4);
  
  // Number of points for smooth curve
  const points = Math.max(data.length, 500);

  context.strokeStyle = lineColor;
  context.lineWidth = lineWidth;
  context.beginPath();

  // Draw smooth Lissajous curve
  for (let i = 0; i < points; i++) {
    const t = (i / points) * Math.PI * 2;
    
    // Classic Lissajous equations
    const x = centerX + Math.cos(t * freqRatioX) * amplitudeX;
    const y = centerY + Math.sin(t * freqRatioY) * amplitudeY;

    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.stroke();

  if (mirror) {
    context.beginPath();
    for (let i = 0; i < points; i++) {
      const t = (i / points) * Math.PI * 2;
      
      const x = centerX + Math.cos(t * freqRatioX) * amplitudeX * 0.7;
      const y = centerY + Math.sin(t * freqRatioY) * amplitudeY * 0.7;

      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }
}



