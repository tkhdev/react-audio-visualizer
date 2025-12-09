import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawLightRays(
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

  const rayCount = Math.min(data.length, 60);
  const angleStep = (Math.PI * 2) / rayCount;

  for (let i = 0; i < rayCount; i++) {
    // Use interleaved sampling to distribute frequency content evenly
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    // Sample multiple points across the spectrum for this ray
    const samplesPerRay = Math.floor(data.length / rayCount);
    for (let j = 0; j < samplesPerRay; j++) {
      // Interleave: ray 0 gets indices 0, 60, 120... ray 1 gets 1, 61, 121...
      const idx = (j * rayCount + i) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for character
    const bandStart = Math.floor((i / rayCount) * data.length);
    const bandSize = Math.floor(data.length / rayCount);
    for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
      const value = data[bandStart + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    const normalizedValue = Math.max(combinedValue * 1.8, 0.1);
    
    const rayLength = normalizedValue * maxRadius;
    const angle = i * angleStep - Math.PI / 2;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    let r, g, b;
    
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = 0; g = 255; b = 204;
    }

    // Draw ray with gradient
    const gradient = context.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(angle) * rayLength,
      centerY + Math.sin(angle) * rayLength
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    context.strokeStyle = gradient;
    // Dynamic line width based on amplitude
    context.lineWidth = 2 + normalizedValue * 3;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(
      centerX + Math.cos(angle) * rayLength,
      centerY + Math.sin(angle) * rayLength
    );
    context.stroke();

    if (mirror) {
      const innerAngle = angle + Math.PI;
      const innerGradient = context.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(innerAngle) * rayLength * 0.7,
        centerY + Math.sin(innerAngle) * rayLength * 0.7
      );
      innerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
      innerGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      context.strokeStyle = innerGradient;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(
        centerX + Math.cos(innerAngle) * rayLength * 0.7,
        centerY + Math.sin(innerAngle) * rayLength * 0.7
      );
      context.stroke();
    }
  }
}



