// Bubbles that grow/shrink with frequency
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
const bubbleStates: { x: number; y: number; size: number; targetSize: number }[] = [];

export function drawBubbles(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  const { width, height } = getCanvasDimensions(canvas);

  if (backgroundColor === 'transparent') {
    context.clearRect(0, 0, width, height);
  } else {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  const bubbleCount = Math.min(data.length, 30);
  const step = Math.floor(data.length / bubbleCount);

  // Initialize bubbles
  if (bubbleStates.length !== bubbleCount) {
    bubbleStates.length = 0;
    for (let i = 0; i < bubbleCount; i++) {
      bubbleStates.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0,
        targetSize: 0
      });
    }
  }

  for (let i = 0; i < bubbleCount; i++) {
    const dataIndex = i * step;
    const value = data[dataIndex];
    const normalizedValue = value / 255;
    
    const bubble = bubbleStates[i];
    bubble.targetSize = normalizedValue * 50 + 5;
    bubble.size += (bubble.targetSize - bubble.size) * 0.1;

    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;
    
    // Draw bubble with gradient
    const gradient = context.createRadialGradient(
      bubble.x, bubble.y, 0,
      bubble.x, bubble.y, bubble.size
    );
    gradient.addColorStop(0, color + 'FF');
    gradient.addColorStop(0.7, color + '80');
    gradient.addColorStop(1, color + '00');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
    context.fill();

    // Draw outline
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }
}



