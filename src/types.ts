import type { RefObject } from 'react';

export type VisualizerMode = 
  | 'waveform' 
  | 'spectrum' 
  | 'loudness'
  | 'circular'
  | 'frequency-bands'
  | 'rounded-bars'
  | 'particles'
  | 'dual-waveform'
  | 'line-spectrum'
  | 'radial-spectrum'
  | 'oscilloscope'
  | 'vu-meter'
  | 'frequency-dots'
  | 'sound-waves'
  | 'spiral'
  | 'matrix'
  | 'equalizer'
  | 'spectrogram'
  | 'star'
  | 'bubbles'
  | 'lissajous'
  | 'waveform-bars'
  | 'frequency-rings'
  | 'pulse'
  | 'waveform-fill'
  | 'radial-waveform'
  | 'frequency-lines'
  | 'frequency-arcs'
  | 'kaleidoscope'
  | 'mandala'
  | 'flower'
  | 'glow'
  | 'particle-trails'
  | 'light-rays'
  | 'energy-waves'
  | 'waveform-history'
  | 'nebula'
  | 'combined';
export type AudioSource = 'mic' | HTMLAudioElement;
export type FFTSize = 256 | 512 | 1024 | 2048;
export type BarColor = string | ((value: number) => string);

export interface UseAudioVisualizerOptions {
  source: AudioSource;
  mode: VisualizerMode;
  fftSize?: FFTSize;
  smoothing?: number; // 0-1
  minDecibels?: number;
  maxDecibels?: number;
  barColor?: BarColor;
  backgroundColor?: string;
  lineWidth?: number;
  deviceId?: string; // mic selection
  mirror?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (err: Error) => void;
}

export interface UseAudioVisualizerReturn {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  start: () => Promise<void>;
  stop: () => void;
  isRunning: boolean;
  error: Error | null;
}

