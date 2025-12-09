import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawGlow(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);
  const centerY = height / 2;
  const barWidth = Math.max(width / data.length, 1);

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  for (let i = 0; i < data.length; i++) {
    const value = data[i];
    const normalizedValue = value / 255;
    const barHeight = normalizedValue * height;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    let r, g, b;
    
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = 0; g = 255; b = 204;
    }

    const x = i * barWidth;
    const drawWidth = Math.max(barWidth - 1, 1);

    // Draw glow effect with multiple layers
    for (let layer = 0; layer < 5; layer++) {
      const alpha = 0.3 - layer * 0.05;
      const glowHeight = barHeight + layer * 5;
      
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      context.fillRect(x - layer, height - glowHeight, drawWidth + layer * 2, glowHeight);
    }

    // Draw main bar
    context.fillStyle = color;
    context.fillRect(x, height - barHeight, drawWidth, barHeight);

    if (mirror) {
      // Draw glow for mirror
      for (let layer = 0; layer < 5; layer++) {
        const alpha = 0.3 - layer * 0.05;
        const glowHeight = barHeight + layer * 5;
        
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        context.fillRect(x - layer, layer * 5, drawWidth + layer * 2, glowHeight);
      }
      
      context.fillStyle = color;
      context.fillRect(x, 0, drawWidth, barHeight);
    }
  }
}



