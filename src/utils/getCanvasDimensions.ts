/**
 * Get canvas logical dimensions, accounting for high-DPI scaling
 */
export function getCanvasDimensions(canvas: HTMLCanvasElement): {
  width: number;
  height: number;
} {
  return {
    width: canvas.__logicalWidth || canvas.getBoundingClientRect().width || canvas.width,
    height: canvas.__logicalHeight || canvas.getBoundingClientRect().height || canvas.height,
  };
}

