// Matrix-style falling bars
import { getCanvasDimensions } from '../utils/getCanvasDimensions';
const matrixColumns: { y: number; speed: number }[] = [];

export function drawMatrix(
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

  const columnCount = Math.min(data.length, 50);
  const columnWidth = width / columnCount;

  // Initialize columns if needed
  if (matrixColumns.length !== columnCount) {
    matrixColumns.length = 0;
    for (let i = 0; i < columnCount; i++) {
      matrixColumns.push({ y: Math.random() * height, speed: 0.5 + Math.random() * 2 });
    }
  }

  for (let i = 0; i < columnCount; i++) {
    const value = data[Math.floor((i / columnCount) * data.length)];
    const normalizedValue = value / 255;
    const column = matrixColumns[i];
    
    column.y += column.speed * (1 + normalizedValue);
    if (column.y > height) {
      column.y = -20;
      column.speed = 0.5 + Math.random() * 2;
    }

    const x = i * columnWidth;
    const barHeight = normalizedValue * height * 0.3 + 10;
    const color = typeof barColor === 'function' ? barColor(normalizedValue) : barColor;

    // Draw trailing effect
    for (let j = 0; j < 5; j++) {
      const alpha = 1 - j * 0.2;
      // Handle hex colors
      let rgba = color;
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else if (color.startsWith('rgb')) {
        rgba = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      }
      context.fillStyle = rgba;
      context.fillRect(x, column.y - barHeight * j, columnWidth - 1, barHeight);
    }
  }
}

