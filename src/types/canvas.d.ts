/**
 * Type extension for HTMLCanvasElement to support logical dimensions
 * used for high-DPI display scaling
 */
declare global {
  interface HTMLCanvasElement {
    __logicalWidth?: number;
    __logicalHeight?: number;
  }
}

export {};

