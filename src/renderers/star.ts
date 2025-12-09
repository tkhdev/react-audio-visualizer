import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawStar(
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

  // Use a fixed number of points for better distribution
  const pointCount = Math.min(data.length, 64);
  const angleStep = (Math.PI * 2) / pointCount;

  context.beginPath();
  context.moveTo(centerX, centerY);

  for (let i = 0; i < pointCount; i++) {
    // Use interleaved sampling to distribute frequency content evenly
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    // Sample multiple points across the spectrum for this point
    const samplesPerPoint = Math.floor(data.length / pointCount);
    for (let j = 0; j < samplesPerPoint; j++) {
      // Interleave: point 0 gets indices 0, 64, 128... point 1 gets 1, 65, 129...
      const idx = (j * pointCount + i) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for character
    const bandStart = Math.floor((i / pointCount) * data.length);
    const bandSize = Math.floor(data.length / pointCount);
    for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
      const value = data[bandStart + j];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Combine average and max for dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    const normalizedValue = Math.max(combinedValue * 1.6, 0.1);
    
    const radius = normalizedValue * maxRadius;
    const angle = i * angleStep - Math.PI / 2;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    context.lineTo(x, y);
  }

  context.closePath();
  
  // Calculate overall average for color
  let totalSum = 0;
  let totalCount = 0;
  for (let i = 0; i < data.length; i++) {
    totalSum += data[i];
    totalCount++;
  }
  const avgValue = totalCount > 0 ? totalSum / totalCount / 255 : 0;
  const color = typeof barColor === 'function' ? barColor(avgValue) : barColor;
  
  context.fillStyle = color + '40';
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();

  if (mirror) {
    // Draw inner star
    context.beginPath();
    context.moveTo(centerX, centerY);
    
    for (let i = 0; i < pointCount; i++) {
      // Use same interleaved sampling for inner star
      let sum = 0;
      let maxValue = 0;
      let count = 0;
      
      const samplesPerPoint = Math.floor(data.length / pointCount);
      for (let j = 0; j < samplesPerPoint; j++) {
        const idx = (j * pointCount + i) % data.length;
        const value = data[idx];
        sum += value;
        maxValue = Math.max(maxValue, value);
        count++;
      }
      
      const bandStart = Math.floor((i / pointCount) * data.length);
      const bandSize = Math.floor(data.length / pointCount);
      for (let j = 0; j < bandSize && (bandStart + j) < data.length; j++) {
        const value = data[bandStart + j];
        sum += value;
        maxValue = Math.max(maxValue, value);
        count++;
      }
      
      const avgValue = count > 0 ? sum / count : 0;
      const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
      const normalizedValue = Math.max(combinedValue * 1.6, 0.1);
      
      const radius = normalizedValue * maxRadius * 0.5;
      const angle = i * angleStep - Math.PI / 2;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      context.lineTo(x, y);
    }
    
    context.closePath();
    context.fill();
    context.stroke();
  }
}



