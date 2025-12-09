/**
 * Scale canvas for high-DPI displays
 */
export function scaleCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): void {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Get logical dimensions from CSS or explicit attributes
  // If canvas was already scaled, use stored logical dimensions
  const logicalWidth = canvas.__logicalWidth || 
    (canvas.hasAttribute('width') ? parseInt(canvas.getAttribute('width') || '0') : 0) ||
    rect.width || 
    800;
  const logicalHeight = canvas.__logicalHeight || 
    (canvas.hasAttribute('height') ? parseInt(canvas.getAttribute('height') || '0') : 0) ||
    rect.height || 
    400;
  
  // Only scale if we have valid dimensions
  if (logicalWidth > 0 && logicalHeight > 0) {
    const scaledWidth = logicalWidth * dpr;
    const scaledHeight = logicalHeight * dpr;
    
    // Save the logical dimensions for renderers
    canvas.__logicalWidth = logicalWidth;
    canvas.__logicalHeight = logicalHeight;
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    
    // Reset transform and scale
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
  }
}

