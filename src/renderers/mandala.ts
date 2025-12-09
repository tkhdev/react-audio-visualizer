import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawMandala(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 10;

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const layers = 12;
  const pointsPerLayer = Math.floor(data.length / layers);

  // Calculate overall amplitude for dynamic scaling
  let maxValue = 0;
  for (let i = 0; i < data.length; i++) {
    maxValue = Math.max(maxValue, data[i]);
  }
  const amplitudeScale = Math.max(maxValue / 255, 0.3); // Minimum 30% scale

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = (maxRadius / layers) * (layer + 1);
    const angleStep = (Math.PI * 2) / pointsPerLayer;
    
    // Layer-specific scaling - outer layers move more
    const layerScale = 0.5 + (layer / layers) * 1.0; // 0.5 to 1.5 multiplier

    context.beginPath();
    for (let i = 0; i < pointsPerLayer; i++) {
      const dataIndex = layer * pointsPerLayer + i;
      if (dataIndex >= data.length) break;
      
      const value = data[dataIndex];
      const normalizedValue = value / 255;
      
      // Much larger offset range - from -60% to +60% of layer radius
      // Use sine wave for smoother variation
      const baseOffset = (normalizedValue - 0.5) * 2; // -1 to 1
      const offset = baseOffset * layerRadius * 0.6 * layerScale * amplitudeScale;
      
      const angle = i * angleStep;
      
      const x = centerX + Math.cos(angle) * (layerRadius + offset);
      const y = centerY + Math.sin(angle) * (layerRadius + offset);
      
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.closePath();

    // Calculate average value for color and line width
    const avgValue = Array.from({ length: pointsPerLayer }, (_, i) => {
      const idx = layer * pointsPerLayer + i;
      return idx < data.length ? data[idx] : 0;
    }).reduce((a, b) => a + b, 0) / pointsPerLayer / 255;
    
    const color = typeof barColor === 'function' ? barColor(avgValue) : barColor;
    context.strokeStyle = color;
    
    // Dynamic line width based on amplitude - thicker for louder audio
    const lineWidth = 1.5 + (avgValue * 2.5); // 1.5 to 4px
    context.lineWidth = lineWidth;
    context.stroke();
  }
}



