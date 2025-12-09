import { getCanvasDimensions } from '../utils/getCanvasDimensions';

export function drawFlower(
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

  const petals = 8;
  
  // Distribute frequency data more evenly across petals
  // Use interleaved sampling to ensure all petals get diverse frequency content
  const samplesPerPetal = Math.floor(data.length / petals);
  
  for (let petal = 0; petal < petals; petal++) {
    const angle = (petal / petals) * Math.PI * 2 - Math.PI / 2;
    
    // Use interleaved sampling: take every Nth sample starting from petal index
    // This distributes frequency content more evenly across all petals
    let sum = 0;
    let maxValue = 0;
    let count = 0;
    
    for (let i = 0; i < samplesPerPetal; i++) {
      // Interleave: petal 0 gets indices 0, 8, 16... petal 1 gets 1, 9, 17...
      const idx = (i * petals + petal) % data.length;
      const value = data[idx];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Also sample from a specific frequency band for this petal
    // This gives each petal a "home" frequency range while still being diverse
    const bandStart = Math.floor((petal / petals) * data.length);
    const bandSize = Math.floor(data.length / petals);
    for (let i = 0; i < bandSize && (bandStart + i) < data.length; i++) {
      const value = data[bandStart + i];
      sum += value;
      maxValue = Math.max(maxValue, value);
      count++;
    }
    
    // Use a combination of average and max for more dynamic response
    const avgValue = count > 0 ? sum / count : 0;
    const combinedValue = (avgValue * 0.5 + maxValue * 0.5) / 255;
    
    // Amplify and ensure minimum visibility
    const normalizedValue = Math.max(combinedValue * 1.8, 0.15);
    const petalLength = normalizedValue * maxRadius;
    
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    // Draw petal with varying width based on value
    context.save();
    context.translate(centerX, centerY);
    context.rotate(angle);
    
    context.fillStyle = color;
    context.beginPath();
    
    // Petal shape: wider at base, narrower at tip
    const petalWidth = petalLength * (0.25 + normalizedValue * 0.35);
    const petalHeight = petalLength;
    
    // Draw petal as an ellipse
    context.ellipse(0, -petalHeight / 2, petalWidth, petalHeight, 0, 0, Math.PI * 2);
    context.fill();
    
    context.restore();
  }

  // Draw center
  const centerValue = Array.from(data).reduce((a, b) => a + b, 0) / data.length / 255;
  const centerColor = typeof barColor === 'function' ? barColor(centerValue) : barColor;
  context.fillStyle = centerColor;
  context.beginPath();
  context.arc(centerX, centerY, maxRadius * 0.1, 0, Math.PI * 2);
  context.fill();
}



