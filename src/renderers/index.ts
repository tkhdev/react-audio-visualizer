// Renderer registry with dynamic imports for code splitting
import type { VisualizerMode } from '../types';

type RendererFunctionWithLine = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  lineColor: string,
  lineWidth: number,
  mirror: boolean
) => void;

type RendererFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
) => void;

type CombinedRendererFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  timeData: ArrayLike<number>,
  freqData: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
) => void;

const rendererMap: Record<
  VisualizerMode,
  () => Promise<{ default: RendererFunction | RendererFunctionWithLine | CombinedRendererFunction }>
> = {
  waveform: () => import('./waveform').then(m => ({ default: m.drawWaveform })),
  spectrum: () => import('./spectrum').then(m => ({ default: m.drawSpectrum })),
  loudness: () => import('./loudness').then(m => ({ default: m.drawLoudness })),
  circular: () => import('./circular').then(m => ({ default: m.drawCircular })),
  'frequency-bands': () => import('./frequencyBands').then(m => ({ default: m.drawFrequencyBands })),
  'rounded-bars': () => import('./roundedBars').then(m => ({ default: m.drawRoundedBars })),
  particles: () => import('./particles').then(m => ({ default: m.drawParticles })),
  'dual-waveform': () => import('./dualWaveform').then(m => ({ default: m.drawDualWaveform })),
  'line-spectrum': () => import('./lineSpectrum').then(m => ({ default: m.drawLineSpectrum })),
  'radial-spectrum': () => import('./radialSpectrum').then(m => ({ default: m.drawRadialSpectrum })),
  oscilloscope: () => import('./oscilloscope').then(m => ({ default: m.drawOscilloscope })),
  'vu-meter': () => import('./vuMeter').then(m => ({ default: m.drawVUMeter })),
  'frequency-dots': () => import('./frequencyDots').then(m => ({ default: m.drawFrequencyDots })),
  'sound-waves': () => import('./soundWaves').then(m => ({ default: m.drawSoundWaves })),
  spiral: () => import('./spiral').then(m => ({ default: m.drawSpiral })),
  matrix: () => import('./matrix').then(m => ({ default: m.drawMatrix })),
  equalizer: () => import('./equalizer').then(m => ({ default: m.drawEqualizer })),
  spectrogram: () => import('./spectrogram').then(m => ({ default: m.drawSpectrogram })),
  star: () => import('./star').then(m => ({ default: m.drawStar })),
  bubbles: () => import('./bubbles').then(m => ({ default: m.drawBubbles })),
  lissajous: () => import('./lissajous').then(m => ({ default: m.drawLissajous })),
  'waveform-bars': () => import('./waveformBars').then(m => ({ default: m.drawWaveformBars })),
  'frequency-rings': () => import('./frequencyRings').then(m => ({ default: m.drawFrequencyRings })),
  pulse: () => import('./pulse').then(m => ({ default: m.drawPulse })),
  'waveform-fill': () => import('./waveformFill').then(m => ({ default: m.drawWaveformFill })),
  'radial-waveform': () => import('./radialWaveform').then(m => ({ default: m.drawRadialWaveform })),
  'frequency-lines': () => import('./frequencyLines').then(m => ({ default: m.drawFrequencyLines })),
  'frequency-arcs': () => import('./frequencyArcs').then(m => ({ default: m.drawFrequencyArcs })),
  kaleidoscope: () => import('./kaleidoscope').then(m => ({ default: m.drawKaleidoscope })),
  mandala: () => import('./mandala').then(m => ({ default: m.drawMandala })),
  flower: () => import('./flower').then(m => ({ default: m.drawFlower })),
  glow: () => import('./glow').then(m => ({ default: m.drawGlow })),
  'particle-trails': () => import('./particleTrails').then(m => ({ default: m.drawParticleTrails })),
  'light-rays': () => import('./lightRays').then(m => ({ default: m.drawLightRays })),
  'energy-waves': () => import('./energyWaves').then(m => ({ default: m.drawEnergyWaves })),
  'waveform-history': () => import('./waveformHistory').then(m => ({ default: m.drawWaveformHistory })),
  combined: () => import('./combined').then(m => ({ default: m.drawCombined })),
};

// Cache for loaded renderers
const rendererCache = new Map<VisualizerMode, RendererFunction | RendererFunctionWithLine | CombinedRendererFunction>();

export async function getRenderer(mode: VisualizerMode): Promise<RendererFunction | RendererFunctionWithLine | CombinedRendererFunction> {
  // Check cache first
  if (rendererCache.has(mode)) {
    return rendererCache.get(mode)!;
  }

  // Load dynamically
  const loader = rendererMap[mode];
  if (!loader) {
    throw new Error(`Unknown visualization mode: ${mode}`);
  }

  const module = await loader();
  const renderer = module.default;
  rendererCache.set(mode, renderer);
  return renderer;
}



